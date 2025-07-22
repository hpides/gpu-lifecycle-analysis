import React, { useState } from "react";
import CPU_DATA from "../assets/data.ts";
import { ServerType, useBenchmarkContext, NEW_LABEL, OLD_LABEL } from "../utility/BenchmarkContext.tsx";
import close from "../assets/close.png";

export const RAM_CAPACITIES :number[] = [128, 512];
export const SSD_CAPACITIES :number[] = [512, 2048];
export const HDD_CAPACITIES :number[] = [0, 4096];

// Reusable Dropdown Component
interface DropdownProps {
  label: string;
  thisServer: ServerType;
  otherServer: ServerType;
  showAdvanced: boolean;
  advancedOptions: null | 'Mirror' | 'Scale';
}

const Dropdown: React.FC<DropdownProps> = ({ label, thisServer }) => {

  const { singleComparison, updateServer, setSingleComparison} = useBenchmarkContext();

  const canToggle = label == NEW_LABEL;

  const [showDropdown, setShowDropdown] = useState<boolean>(canToggle ? false : true);

  // This is when new hardware is hidden, we set it equal to current hardware
  if (canToggle && !showDropdown) {
    // thisServer.setCPU(otherServer.cpu)
    // thisServer.setRAM(otherServer.ram)
    // thisServer.setHDD(otherServer.hdd)
  }

  const toggleShow = () => {
    if (!canToggle) return;
    setSingleComparison(!singleComparison);
    setShowDropdown(!showDropdown);
  }

  const updateComponent = (updates: Partial<ServerType>) => {
    // Always update the current server
    updateServer(thisServer, updates);
  };

  return (
    <div className="col-span-1 z-10 flex flex-col gap-2 font-light relative">
      <div
        onClick={toggleShow}
        className={`${showDropdown ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'} z-10 cursor-pointer duration-150 absolute top-0 left-0 w-full h-full bg-white border-2 border-slate-400 rounded-xl flex items-center justify-center group hover:border-slate-300`}>
        <p className="text-6xl text-slate-500 group-hover:text-slate-400 duration-150">+</p>
      </div>
      <div className="flex justify-between">
        <p className="text-medium font-medium">{label}</p>
        <button
          hidden={!canToggle}
          onClick={toggleShow}
          className="w-fit px-2 cursor-pointer hover:text-red-600 duration-200 scale-110 hover:scale-125"
        >
          <img 
            src={close} 
            className="h-5" />
        </button>
      </div>
      <div className={`${showDropdown ? 'opacity-100' : 'opacity-0 pointer-events-none'} relative duration-150`}>
        <select
          className="block appearance-none text-base w-full bg-gray-100 border-2 border-gray-400 py-1 px-2 pr-8 rounded focus:outline-none focus:bg-white focus:border-gray-500"
          value={thisServer.cpu}
          onChange={(e) => updateComponent({cpu: (e.target.value)})}
        >
          {[...CPU_LIST]
            .sort((a, b) => (CPU_DATA[a]?.YEAR ?? 0) - (CPU_DATA[b]?.YEAR ?? 0))
            .map((option) => {
              const year = CPU_DATA[option]?.YEAR ?? "Unknown";
              return (
                <option key={option} value={option}>
                  {`${year} - ${option}`}
                </option>
              );
            })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg 
            className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
    </div>
  );
};

export const CPU_LIST = Object.keys(CPU_DATA) as Array<string>;

function Compare() {
  const { currentServer, newServer, advancedSettings, advancedOptions } = useBenchmarkContext();

  return (
    <>
      <div className="grid grid-cols-2 px-4 py-2 gap-5">
        <Dropdown
          label={OLD_LABEL}
          showAdvanced={advancedSettings}
          thisServer={currentServer}
          otherServer={newServer}
          advancedOptions={advancedOptions}
        />
        <Dropdown
          label={NEW_LABEL}
          showAdvanced={advancedSettings}
          thisServer={newServer}
          otherServer={currentServer}
          advancedOptions={advancedOptions}
        />
      </div>
    </>
  );
}

export default Compare;
