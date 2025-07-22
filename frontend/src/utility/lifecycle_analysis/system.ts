import * as constants from './constants.ts';
import { GRID_INTENSITY } from '../../assets/grid_intensities.ts';
import { Country } from '../../assets/grid_intensities.ts';
import { MemoryType } from '../../partials/BenchmarkSettings.tsx';

export const CPU = 'CPU';
export type Components = typeof CPU

export interface CapexType extends Record<Components, number> {
  TOTAL: number;
}

export interface OpexType extends Record<Components, number> {
  TOTAL: number;
  opexPerYear: number;
}

export interface ProjectedOpexEmissionsType {
  projected: number[];
  opexBreakdown: OpexType;
}

export class System {
  packagingSize: number;
  performanceIndicator: number;
  lifetime: number;
  vramCapacity: number;
  processNode: number;
  cpuTdpMax: number;
  cpuTdpMin: number;
  memoryType: MemoryType;
  hbmStacks: number

  constructor(
    packagingSize: number,
    performanceIndicator: number,
    lifetime: number,
    vramCapacity: number,
    processNode: number,
    cpuTdpMax: number,
    cpuTdpMin: number | null,
    memoryType: MemoryType,
    hbmStacks: number | null
  ) {
    /**
     * @param dieSize in cm^2
     * @param performanceIndicator
     * @param lifetime in years
     * @param dramCapacity in GB
     * @param ssdCapacity in GB
     * @param hddCapacity in GB
     * @param cpuTdp in Watts
     */
    this.packagingSize = packagingSize;
    this.performanceIndicator = performanceIndicator;
    this.lifetime = lifetime;
    this.vramCapacity = vramCapacity;
    this.processNode = processNode;
    this.cpuTdpMax = cpuTdpMax;
    this.cpuTdpMin = cpuTdpMin == null ? cpuTdpMax * 0.1 : cpuTdpMin;
    this.memoryType = memoryType;
    this.hbmStacks = hbmStacks || 1;
  }

  calculateCapexEmissions(): CapexType {
    // Constants
    const MPA = 0.5; // Procure materials | kg CO2 per cm^2
    const EPA = constants.getEnergyPerArea(this.processNode) || 0; // Fab Energy | kWh per cm^2
    const CI_FAB = 0.486; // g CO2 per kWh converted to kg CO2 per kWh (taiwan)
    const GPA = constants.getGasPerArea(this.processNode) || 0; // Kg CO2 per cm^2
    const FAB_YIELD = 0.96; // Fab yield

    console.log(this)
    console.log(CI_FAB, EPA, GPA, MPA)
    console.log(CI_FAB * EPA + GPA + MPA)
    // Calculate emissions
    const capexCpu =
      ((CI_FAB * EPA + GPA + MPA) * this.packagingSize) / FAB_YIELD;

    const exponent = this.hbmStacks == null ? 1 : this.hbmStacks;

    const capexVram = (this.vramCapacity * (constants.getVramEmbodied(this.memoryType) || 0)) * (1 / (FAB_YIELD ** exponent))

    console.log(capexVram + capexCpu)

    return {
      CPU: capexCpu,
      TOTAL: capexCpu + capexVram
    }
  }

  generateAccumProjectedOpexEmissions(
    timeHorizon: number,
    systemId: string,
    country: Country,
    utilization: number,
    opexCalculation: string
  ): ProjectedOpexEmissionsType {
    let opexPerYear: number;

    let opexBreakdown: OpexType;

    // never reaching this if statement, want to delete but too much refactoring
    // TODO: later
    if (opexCalculation === constants.HPE_POWER_ADVISOR) {
      opexPerYear = constants.OPEX_PER_YEAR[country][utilization][systemId];
    };

    opexBreakdown = this.calculateOpexEmissions(utilization, country);
    opexPerYear = opexBreakdown.opexPerYear;

    const projected =  Array.from({ length: timeHorizon }, (_, i) =>
      i * opexPerYear
    );

    return {
      projected,
      opexBreakdown
    }
  }

  generateNormalizedPowerUsage(utilization: number): number {
    // Slope = (TDP_MAX - TDP_MIN) / (100 - 0)
    const slope = (this.cpuTdpMax - this.cpuTdpMin) / 100;
    const intercept = this.cpuTdpMin;

    return (intercept + utilization * slope) / 1000; // Convert to kW
  }

  calculateOpexEmissions(utilization: number, country: Country): OpexType {
    const normalizedPowerUsage = this.generateNormalizedPowerUsage(utilization); // already in kW

    const totalWattsPerYear = 24 * 7 * 52 * normalizedPowerUsage; // kWh
    const GCI = (GRID_INTENSITY[country] || 0) / 1000;

    return {
      CPU: normalizedPowerUsage,     // kW
      TOTAL: normalizedPowerUsage,   // same as CPU in this context
      opexPerYear: totalWattsPerYear * GCI
    };
  }
}
