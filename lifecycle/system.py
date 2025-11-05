from . import constants
import math
from .grid_intensities import GRID_INTENSITY
# from BenchmarkSettings import MemoryType  # Uncomment if needed

GPU = "GPU"

class System:
    def __init__(
        self,
        packaging_size,
        performance_indicator,
        vram_capacity,
        process_node,
        gpu_tdp_max,
        gpu_tdp_min,
        memory_type,
        hbm_stacks,
        name = ""
    ):
        """
        :param packaging_size: die size in cm^2
        :param performance_indicator:
        :param vram_capacity: GB
        :param process_node:
        :param gpu_tdp_max: Watts
        :param gpu_tdp_min: Watts (optional, defaults to 10% of max)
        :param memory_type:
        :param hbm_stacks: optional, defaults to 1
        """
        self.packaging_size = packaging_size if name != "B200_HGX" else packaging_size / 2
        self.performance_indicator = performance_indicator
        self.vram_capacity = vram_capacity
        self.process_node = process_node
        self.gpu_tdp_max = gpu_tdp_max
        self.gpu_tdp_min = gpu_tdp_min if gpu_tdp_min is not None else gpu_tdp_max * 0.1
        self.memory_type = memory_type
        self.hbm_stacks = hbm_stacks if hbm_stacks is not None else 1
        self.name = name

    def calculate_capex_emissions(self):
        # Constants
        MPA = 0.5  # Procure materials | kg CO2 per cm^2
        EPA = constants.get_energy_per_area(self.process_node) or 0  # Fab Energy | kWh per cm^2
        CI_FAB = 0.486  # kg CO2 per kWh (Taiwan grid mix)
        GPA = constants.get_gas_per_area(self.process_node) or 0  # Kg CO2 per cm^2

        # ---- GPU die yield using Poisson model ----
        D0 = 0.1  # defects per cm^2
        die_area_cm2 = self.packaging_size  # assuming packaging_size is in cm^2
        fab_yield = math.exp(-D0 * die_area_cm2)  # Poisson yield model

        # ---- GPU embodied carbon ----
        capex_gpu = (((CI_FAB * EPA) + GPA + MPA) * die_area_cm2) / fab_yield

        # ---- B200 has two 800mm2 dies, not a single 1600mm2 die, which would mess with the poisson model
        if self.name == "B200_HGX":
            capex_gpu = capex_gpu * 2

        # ---- HBM yield model ----
        hbm_stack_yield = 0.95  # 95% yield per stack
        exponent = self.hbm_stacks if self.hbm_stacks is not None else 1
        effective_hbm_yield = hbm_stack_yield ** exponent

        capex_vram = (
            self.vram_capacity * (constants.get_vram_embodied(self.memory_type) or 0)
        ) / effective_hbm_yield

        return {
            "GPU": capex_gpu,
            "TOTAL": capex_gpu + capex_vram
        }
    
    def generate_accum_projected_opex_emissions(
        self,
        time_horizon,
        system_id,
        country,
        utilization,
    ):
        # Placeholder for unused case
        opex_per_year = None

        opex_breakdown = self.calculate_opex_emissions(utilization, country)
        opex_per_year = opex_breakdown["opexPerYear"]

        projected = [i * opex_per_year for i in range(time_horizon)]

        return {
            "projected": projected,
            "opexBreakdown": opex_breakdown
        }

    def generate_normalized_power_usage(self, utilization):
        # Slope = (TDP_MAX - TDP_MIN) / 100
        slope = (self.gpu_tdp_max - self.gpu_tdp_min) / 100
        intercept = self.gpu_tdp_min

        return (intercept + utilization * slope) / 1000  # kW

    def calculate_opex_emissions(self, utilization, country):
        normalized_power_usage = self.generate_normalized_power_usage(utilization)  # kW
        total_watts_per_year = 24 * 7 * 52 * normalized_power_usage  # kWh
        GCI = (GRID_INTENSITY.get(country) or 0) / 1000

        return {
            "GPU": normalized_power_usage,     # kW
            "TOTAL": normalized_power_usage,
            "opexPerYear": total_watts_per_year * GCI
        }
