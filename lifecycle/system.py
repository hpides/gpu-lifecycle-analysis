from . import constants
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
        hbm_stacks
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
        self.packaging_size = packaging_size
        self.performance_indicator = performance_indicator
        self.vram_capacity = vram_capacity
        self.process_node = process_node
        self.gpu_tdp_max = gpu_tdp_max
        self.gpu_tdp_min = gpu_tdp_min if gpu_tdp_min is not None else gpu_tdp_max * 0.1
        self.memory_type = memory_type
        self.hbm_stacks = hbm_stacks if hbm_stacks is not None else 1

    def calculate_capex_emissions(self):
        # Constants
        MPA = 0.5  # Procure materials | kg CO2 per cm^2
        EPA = constants.get_energy_per_area(self.process_node) or 0  # Fab Energy | kWh per cm^2
        CI_FAB = 0.486  # kg CO2 per kWh (Taiwan)
        GPA = constants.get_gas_per_area(self.process_node) or 0  # Kg CO2 per cm^2
        FAB_YIELD = 0.96  # Fab yield

        # Calculate emissions
        capex_gpu = (((CI_FAB * EPA) + GPA + MPA) * self.packaging_size) / FAB_YIELD
        exponent = self.hbm_stacks if self.hbm_stacks is not None else 1

        capex_vram = (
            self.vram_capacity * (constants.get_vram_embodied(self.memory_type) or 0)
        ) * (1 / (FAB_YIELD ** exponent))

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
