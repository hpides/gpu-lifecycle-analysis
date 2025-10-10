#!/usr/bin/env python3
"""
Auto-tiling GEMM benchmark for GPUs (PyTorch)

Goal:
- Benchmark a *fixed, large* matrix multiplication workload N x N that may not fit
  into GPU VRAM.
- Each GPU automatically picks the largest feasible tile size based on free VRAM.
- If the full matrix fits, perform a single cuBLAS GEMM (one-shot) for peak TFLOPS.
- Otherwise, perform a correctness-agnostic, performance-representative *tiled* GEMM,
  allocating only tiles on-the-fly to keep memory bounded.

Notes:
- Tiles are generated with torch.rand on the GPU as needed; this simulates the compute
  and memory traffic of a large GEMM without trying to materialize full matrices.
- We measure total wall-clock for the whole N x N multiply and compute TFLOPS as 2*N^3 / time.
- This is a *throughput* benchmark for large problems; tiling overhead is part of the
  measurement (reflects real out-of-core scenarios). For pure peak FLOPS comparisons,
  prefer one-shot GEMMs that fit in memory.

Usage examples:
  python matmul_benchmark.py
"""
import argparse
import math
import time
import torch


def human_bytes(n: int) -> str:
    units = ["B", "KB", "MB", "GB", "TB"]
    x = float(n)
    for u in units:
        if x < 1024.0:
            return f"{x:.2f} {u}"
        x /= 1024.0
    return f"{x:.2f} PB"


def dtype_from_str(s: str):
    s = s.lower()
    if s in ["fp32", "float32", "32"]:
        return torch.float32
    if s in ["fp16", "float16", "16", "half"]:
        return torch.float16
    if s in ["bf16", "bfloat16"]:
        return torch.bfloat16
    raise ValueError(f"Unsupported precision: {s}")


def bytes_per_elem(dtype: torch.dtype) -> int:
    if dtype is torch.float32:
        return 4
    if dtype in (torch.float16, torch.bfloat16):
        return 2
    # Fallback (rare)
    return torch.tensor([], dtype=dtype).element_size()


def choose_tile_size(N: int, dtype: torch.dtype, safety: float, user_tile: int | None) -> tuple[int, bool]:
    """Return (tile_size, can_do_one_shot) given current free VRAM.

    We attempt a one-shot GEMM if 3*N^2*bytes <= free_bytes * safety.
    (two inputs + one output); cuBLAS workspace overhead not explicitly modeled,
    thus the safety multiplier (default 0.5) keeps headroom.

    If not feasible, choose the largest square tile t such that 3*t^2*bytes <= free_bytes * safety.
    """
    torch.cuda.empty_cache()
    free_b, total_b = torch.cuda.mem_get_info()
    bpe = bytes_per_elem(dtype)

    need = 3 * (N**2) * bpe
    can_one_shot = need <= free_b * safety

    if user_tile:
        t = min(N, int(user_tile))
    else:
        # Largest tile that (roughly) fits: 3 tiles in memory (A,B,C)
        t = int(math.floor(math.sqrt((free_b * safety) / (3 * bpe))))
        t = max(512, min(N, t))  # clamp to something reasonable

    return t, can_one_shot


def run_one_shot(N: int, dtype: torch.dtype) -> float:
    # Materialize full matrices (only if it fits!)
    A = torch.rand((N, N), device="cuda", dtype=dtype)
    B = torch.rand((N, N), device="cuda", dtype=dtype)

    # Warm-up
    _ = torch.mm(A, B)
    torch.cuda.synchronize()

    start = time.perf_counter()
    C = torch.mm(A, B)
    torch.cuda.synchronize()
    end = time.perf_counter()

    # Keep C alive to avoid DCE
    _ = C[0, 0].item()

    # Cleanup
    del A, B, C
    torch.cuda.empty_cache()

    return end - start


def run_tiled(N: int, t: int, dtype: torch.dtype) -> float:
    """Perform a tiled GEMM of an implicit NxN multiply using tiles of up to t x t.
    Only tiles live on the GPU at any time. We generate A(i,k) and B(k,j) tiles on the fly.
    """
    torch.cuda.synchronize()

    # Quick warm-up with one tile multiply
    m0 = min(t, N)
    A0 = torch.rand((m0, m0), device="cuda", dtype=dtype)
    B0 = torch.rand((m0, m0), device="cuda", dtype=dtype)
    _ = torch.mm(A0, B0)
    torch.cuda.synchronize()
    del A0, B0

    start = time.perf_counter()

    for i in range(0, N, t):
        m = min(t, N - i)
        for j in range(0, N, t):
            n = min(t, N - j)
            C_ij = torch.zeros((m, n), device="cuda", dtype=dtype)
            for k in range(0, N, t):
                kblk = min(t, N - k)
                # Generate input tiles on the fly
                A_ik = torch.rand((m, kblk), device="cuda", dtype=dtype)
                B_kj = torch.rand((kblk, n), device="cuda", dtype=dtype)
                # C_ij += A_ik @ B_kj
                C_ij = torch.addmm(C_ij, A_ik, B_kj, beta=1.0, alpha=1.0)
                # Free ASAP
                del A_ik, B_kj
            # Touch the result so the kernel work is definitely realized
            _ = C_ij.mean()
            del C_ij
    torch.cuda.synchronize()

    end = time.perf_counter()
    torch.cuda.empty_cache()

    return end - start


def main():
    size = 200000
    precision = "fp32"
    repeats = 1
    safety = 0.55
    tile = None

    assert torch.cuda.is_available(), "CUDA device not available"

    device_name = torch.cuda.get_device_name(0)
    cap = torch.cuda.get_device_capability(0)
    dtype = dtype_from_str(precision)

    torch.cuda.set_device(0)
    free_b, total_b = torch.cuda.mem_get_info()

    print(f"\nGPU: {device_name} (cc {cap[0]}.{cap[1]})")
    print(f"Total VRAM: {human_bytes(total_b)} | Free: {human_bytes(free_b)}")
    print(f"Precision: {precision} (elem {bytes_per_elem(dtype)} bytes)")
    print(f"Problem: {size} x {size}")
    print(f"Safety: {safety}")

    tile, can_one = choose_tile_size(size, dtype, safety, tile)
    print(f"Tile (auto): {tile} | One-shot possible: {can_one}")

    # Simple warm-up to stabilize clocks
    warm = torch.rand((1024, 1024), device="cuda", dtype=dtype)
    _ = torch.mm(warm, warm)
    torch.cuda.synchronize()
    del warm

    best_time = float("inf")
    mode = "one-shot" if can_one else "tiled"

    for r in range(repeats):
        if can_one and tile is None:
            dt = run_one_shot(size, dtype)
        else:
            dt = run_tiled(size, tile, dtype)
        best_time = min(best_time, dt)
        tflops = (2 * (size ** 3)) / (dt * 1e12)
        print(f"Run {r+1}: {dt:.4f}s  |  {tflops:.2f} TFLOPS  [{mode}]")

    best_tflops = (2 * (size ** 3)) / (best_time * 1e12)
    print(f"\nBest: {best_time:.4f}s  |  {best_tflops:.2f} TFLOPS  [{mode}]\n")


if __name__ == "__main__":
    main()
