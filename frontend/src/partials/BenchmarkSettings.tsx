import CPU_DATA from "../assets/data";
import { GRID_INTENSITY } from "../assets/grid_intensities";
import { ServerType, useBenchmarkContext, NEW_LABEL, OLD_LABEL } from "../utility/BenchmarkContext";
import ToggleSelection from "../utility/ToggleSelection";
import { addCommaToNumber, clamp } from "../utility/UtilityFunctions";
import { getCountryColor } from "../partials/GeoMap";
// @tsignore
import GeoMap from "../partials/GeoMap";
// @ts-ignore
import { COUNTRY_NAMES } from '../assets/countries.js';
import { ListItem, ListItemWithSearch } from "../utility/ListItems";
import { WORKLOAD_EXPLANATIONS, SCALING_EXPLANATIONS } from "../utility/descriptions";
import UtilizationInput from "../utility/UtilizationInput.js";

export const WORKLOAD_TYPES = ['FP16', 'FP32', 'FP64', 'BENCH_S_MATRIX'] as const;
export type WorkloadType = typeof WORKLOAD_TYPES[number];

export const SCALING_TYPES = ['None', 'Utilization', 'Emissions'] as const;
export type ScalingType = typeof SCALING_TYPES[number];

export const MEMORY_TYPES = ['HBM2', 'HBM3', 'GDDR6', 'GDDR5'] as const;
export type MemoryType = typeof MEMORY_TYPES[number];


export type PerformanceType = number | null;

export const INTEL = "Intel";
export const AMD = "AMD";

export type CPUMake = typeof INTEL | typeof AMD;

export interface CPUEntry {
  YEAR: number,
  TDP_MAX: number,
  TDP_IDLE: number | null,
  CUDA_CORES: number,
  PROCESS: number,
  DIE_SIZE: number,
  VRAM: number,
  BUS_WIDTH: number,
  BASE_CLOCK: number,
  BANDWIDTH: number,
  TRANSISTOR_COUNT: number,
  FP16: PerformanceType,
  FP32: PerformanceType,
  FP64: PerformanceType,
  HBM_STACKS: number | null,
  MEMORY_TYPE: MemoryType,
  HPI_AVAILABLE: number,
  BENCH_S_MATRIX: PerformanceType,
}

type PerformanceKeys = {
  [K in keyof CPUEntry]: CPUEntry[K] extends PerformanceType ? K : never;
}[keyof CPUEntry];

export interface WorkloadMappingType {
  FP16: PerformanceKeys;
  FP32: PerformanceKeys;
  FP64: PerformanceKeys;
  BENCH_S_MATRIX: PerformanceKeys;
}

export const WORKLOAD_MAPPING: WorkloadMappingType = {
  BENCH_S_MATRIX: 'BENCH_S_MATRIX',
  FP16: 'FP16',
  FP32: 'FP32',
  FP64: 'FP64',
};

function BenchmarkSettings() {

  const { country, currentServer, newServer, workload, scaling, singleComparison, advancedSettings, oldPerformanceIndicator, newPerformanceIndicator, setCountry, setWorkload, setScaling, updateServer } = useBenchmarkContext();

  const intensity = GRID_INTENSITY[country];
  let disabledWorkload: WorkloadType[] = [];

  WORKLOAD_TYPES.forEach(workload => {
    let push = false
    if (CPU_DATA[currentServer.cpu][WORKLOAD_MAPPING[workload]] === 0) push = true;
    if (!singleComparison && CPU_DATA[newServer.cpu][WORKLOAD_MAPPING[workload]] === 0) push = true;

    // push only if it is not alreal in disableWorkload
    if (push && !disabledWorkload.includes(workload)) disabledWorkload.push(workload)
  })

  // need to reset workload if restriced cpu is selected after workload is set
  if (disabledWorkload.includes(workload)) setWorkload(WORKLOAD_TYPES[0])

  const updateUtilization = (server: String, updates: Partial<ServerType>) => {
    const thisServer = server == NEW_LABEL ? newServer : currentServer;
    const otherServer = server == NEW_LABEL ? currentServer : newServer;

    updateServer(thisServer, updates);

    if (singleComparison) return;

    if (scaling == 'Utilization') {
      const isNew = server === NEW_LABEL;
      console.log(isNew)
      const base = isNew ? oldPerformanceIndicator : newPerformanceIndicator;
      const target = isNew ? newPerformanceIndicator : oldPerformanceIndicator;

      const ratio = target / base;
      const scaledUtilization = clamp( updates.utilization as number * ratio, 0, 100)

      updateServer(otherServer, { utilization: scaledUtilization })
    }
  }


return (
  <div className="flex z-30 flex-col text-medium font-medium flex-wrap px-4 py-2 gap-4">
    <div className="grid grid-cols-7 space-x-4">
      <div className="flex flex-col col-span-5 gap-5">
        <ToggleSelection<WorkloadType>
          label="Workload:"
          options={[...WORKLOAD_TYPES]}
          optionsTooltip={WORKLOAD_EXPLANATIONS}
          currentState={workload}
          setState={setWorkload}
          zIndex="z-30"
          disabled={disabledWorkload}
          flexGrow={false}
        />
        <ToggleSelection<ScalingType>
          label="Scaling:"
          options={[...SCALING_TYPES]}
          optionsTooltip={SCALING_EXPLANATIONS}
          currentState={scaling}
          setState={setScaling}
          zIndex="z-30"
          disabled={[]}
          flexGrow={false}
        />
        <UtilizationInput
          label={advancedSettings ? 'Current HW Utilization %:' : 'Utilization %:'}
          accent="accent-orange-600"
          utilization={currentServer.utilization}
          setUtilization={(x) => updateUtilization(OLD_LABEL, {utilization: (x)} )}
        />
          {
            singleComparison ? null :
              <UtilizationInput
                label="New HW Utilization %:"
                accent="accent-blue-500"
                utilization={newServer.utilization}
                setUtilization={(x) => updateUtilization(NEW_LABEL, {utilization: (x)} )}
                hidden={!advancedSettings}
              />
          }
      </div>
      <div className="flex font-normal gap-2 flex-col col-span-2">
        <ListItemWithSearch
          label="Location"
          value={country}
          options={COUNTRY_NAMES}
          onChange={setCountry}
          borderColor={getCountryColor(intensity)}
        />
        <ListItem
          label="Grid Carbon Intensity"
          value={`${addCommaToNumber(intensity)} gCO₂/kWh`}
          borderColor={getCountryColor(intensity)}
        />
      </div>
    </div>
    <div className={`${advancedSettings ? 'h-0' : 'h-96'} duration-300 ease-in-out overflow-hidden relative`}>
      <GeoMap country={country} setCountry={setCountry} />
    </div>
  </div>
)
}

export default BenchmarkSettings;
