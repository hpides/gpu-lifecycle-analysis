import math
import numpy as np

def geometric_mean(values):
    """Compute geometric mean of a list of positive numbers."""
    values = [v for v in values if v > 0]
    return np.exp(np.mean(np.log(values)))

def compute_aiucpmsf(TLD, UT_list, US1_list, US2_list, TTT):
    """
    SF: scale factor (int)
    N: number of use cases executed (int)
    S: number of streams in throughput test (int)
    TLD: load time in seconds (float)
    UT_list: list of training times for each use case (seconds)
    US1_list: serving times for Power Serving Test 1 (seconds)
    US2_list: serving times for Power Serving Test 2 (seconds)
    TTT: throughput test metric (float)
    """
    # TPTT = geomean of training times
    TPTT = geometric_mean(UT_list)

    # TPST1 & TPST2 = geomean of serving times
    TPST1 = geometric_mean(US1_list)
    TPST2 = geometric_mean(US2_list)
    TPST = max(TPST1, TPST2)

    # TTT = throughput time / (N * S)

    # AIUCpm@SF
    # numerator = SF * N * 60 (hardcoded for SF 10 and 3 relevant use cases)
    numerator = 10 * 3 * 60
    denominator = (TLD * TPTT * TPST * TTT) ** 0.25  # 4th root
    return numerator / denominator

def main():
    print(compute_aiucpmsf(19.219,[217.144, 179.475, 330.239], [14.778, 6.093, 89.376], [14.18, 5.933, 89.216], 5.576))

if __name__ == "__main__":
          main()
