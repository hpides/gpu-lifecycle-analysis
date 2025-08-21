from .system import System
from .grid_intensities import GRID_INTENSITY
from . import constants
from typing import Union, Tuple


def float_to_days(year_fraction: float) -> int:
    """
    Convert a fractional year into days.
    
    Parameters:
        year_fraction (float): A fraction where 1.0 = 1 year.
        days_in_year (int): Number of days in a year (default 365).
    
    Returns:
        int: Equivalent number of days.
    """
    return int(round(year_fraction * 365))


def compare_gpus(df, gpu1: str, gpu2: str, workload: str, country: str,
                 utilization1: float = 50, utilization2: float = 50, scaling: int = 0):
    """
    Compare two GPUs using the System and generate_systems_comparison logic.

    Args:
        df (pd.DataFrame): GPU dataset
        gpu1 (str): Name of old system GPU (e.g., "A100")
        gpu2 (str): Name of new system GPU (e.g., "V100")
        workload (int/float): Workload parameter
        country (str): Country code for grid intensity
        lifetime (int): System lifetime in years
        utilization1 (float): Utilization (%) of gpu1
        utilization2 (float): Utilization (%) of gpu2
        scaling (number): Type of scaling

    Returns:
        dict: Comparison dictionary
    """

    def build_system(row):
        return System(
            row["DIE_SIZE"] / 100,       # convert mm² → cm²
            row[workload],                 # performance indicator (adjust if needed)
            row["VRAM"],                 # VRAM GB
            row["PROCESS"],              # process node
            row["TDP_MAX"],              # max TDP W
            row["TDP_IDLE"],             # idle TDP W
            row["MEMORY_TYPE"],          # memory type
            row["HBM_STACKS"],           # HBM stacks
        )

    # Look up rows
    row1 = df[df["GPU"] == gpu1].iloc[0]
    row2 = df[df["GPU"] == gpu2].iloc[0]

    old_system = build_system(row1)
    new_system = build_system(row2)

    TIME_HORIZON = 100

    comparison = generate_systems_comparison(
        new_system,
        old_system,
        TIME_HORIZON,
        country,
        utilization2,
        utilization1,
        scaling
    )

    return comparison


def calculate_intersect(old_system_opex: list[float], new_system_opex: list[float]) -> Union[Tuple[float, float], bool]:
    """
    Calculate the intersection point between old system OPEX line and new system OPEX line.
    Returns a tuple (x, y) or False if no intersection.
    """
    def line_intersect(x1, y1, x2, y2, x3, y3, x4, y4):
        """
        Returns the intersection point (x, y) of lines (x1,y1)-(x2,y2) and (x3,y3)-(x4,y4),
        or False if they are parallel.
        """
        denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
        if denom == 0:
            return False  # parallel lines
        px = ((x1*y2 - y1*x2)*(x3 - x4) - (x1 - x2)*(x3*y4 - y3*x4)) / denom
        py = ((x1*y2 - y1*x2)*(y3 - y4) - (y1 - y2)*(x3*y4 - y3*x4)) / denom
        return (px, py)

    l = len(old_system_opex)
    intersect = line_intersect(
        0, old_system_opex[0],
        l - 1, old_system_opex[-1],
        0, new_system_opex[0],
        l - 1, new_system_opex[-1]
    )
    return intersect

def generate_systems_comparison(
    new_system: System,
    old_system: System,
    time_horizon: int,
    country: str,
    old_system_utilization: float,
    new_system_utilization: float,
    scaling: int,
):
    # --- New system OPEX and CAPEX ---
    new_system_emissions = new_system.generate_accum_projected_opex_emissions(
        time_horizon,
        constants.NEW_SYSTEM,
        country,
        new_system_utilization,
    )
    new_system_opex = new_system_emissions["projected"]

    new_system_capex_breakdown = new_system.calculate_capex_emissions()
    new_system_capex = new_system_capex_breakdown["TOTAL"]

    # --- Old system OPEX ---
    old_system_emissions = old_system.generate_accum_projected_opex_emissions(
        time_horizon,
        constants.OLD_SYSTEM,
        country,
        old_system_utilization,
    )
    old_system_opex = old_system_emissions["projected"]

    # --- Performance factor ---
    performance_factor = old_system.performance_indicator / new_system.performance_indicator

    if scaling == constants.SCALING_EMISSIONS:
        # Adjust old system OPEX based on performance factor
        old_system_opex = [opex / performance_factor for opex in old_system_opex]
    elif scaling == constants.SCALING_UTILIZATION:
        # Adjust new system OPEX based on performance factor
        new_system_opex = [opex * performance_factor for opex in new_system_opex]

    # Add CAPEX to new system OPEX at each time step
    new_system_opex = [opex + new_system_capex for opex in new_system_opex]

    # Absolute savings
    abs_savings = [new_opex - old_opex for new_opex, old_opex in zip(new_system_opex, old_system_opex)]

    # Relative savings
    relative_savings = [1 - (old_opex / new_opex) for new_opex, old_opex in zip(new_system_opex, old_system_opex)]

    # OPEX ratio
    ratio = [new_opex / old_opex for new_opex, old_opex in zip(new_system_opex, old_system_opex)]

    return {
        "newSystemOpex": new_system_opex,
        "oldSystemOpex": old_system_opex,
        "absSavings": abs_savings,
        "relativeSavings": relative_savings,
        "ratio": ratio,
        "capexBreakdown": new_system_capex_breakdown,
        "opexBreakdown": new_system_emissions["opexBreakdown"],
        "oldPowerConsumption": old_system_emissions["opexBreakdown"]["TOTAL"],
        "newPowerConsumption": new_system_emissions["opexBreakdown"]["TOTAL"],
    }
