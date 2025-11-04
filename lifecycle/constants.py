# Workloads
SORTING = "sorting"
SPECINT = "specint"

MMULT_16 = "BENCH_MULT_FP16_TFLOPS"
MMULT_32 = "BENCH_MULT_FP32_TFLOPS"
MMULT_64 = "BENCH_MULT_FP64_TFLOPS"
SORTING = "MKEYS/S_SORT"
TPCXAI = "TCPxAIUCpm@10.0"
FP16 = "FP16"
FP32 = "FP32"
FP64 = "FP64"

# Countries
SWEDEN = "sweden"
GERMANY = "germany"

# Systems
OLD_SYSTEM = "old_system"
NEW_SYSTEM = "new_system"

TIME_HORIZON = 100
UTILIZATION_DEFAULT = 75

SCALING_NONE = 0
SCALING_UTILIZATION = 1
SCALING_EMISSIONS = 2

def get_scaling_string(scaling):
    scaling_map = {
        SCALING_NONE: "No Scaling",
        SCALING_UTILIZATION: "Utilization Scaling",
        SCALING_EMISSIONS: "Emissions Scaling",
    }
    return scaling_map.get(scaling, "Unknown Scaling")

def get_energy_per_area(process_node):
    energy_map = {
        4: 2.75,
        5: 2.75,
        7: 1.52,
        8: 1.52,
        12: 1.3,
        16: 1.2,
        28: 0.9,
    }
    return energy_map.get(process_node, None)


def get_gas_per_area(process_node):
    gas_map = {
        4: 0.327,
        5: 0.327,
        7: 0.275,
        8: 0.275,
        12: 0.177,
        16: 0.160,
        28: 0.1375,
    }
    return gas_map.get(process_node, None)


def get_vram_embodied(component):
    embodied_map = {
        "GDDR5": 0.29,
        "GDDR6": 0.36,
        "HBM2": 0.28,
        "HBM3": 0.24,
    }
    return embodied_map.get(component, None)
