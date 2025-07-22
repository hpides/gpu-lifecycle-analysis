import React from 'react';

interface UtilizationInputProps {
  label: string;
  utilization: number;
  setUtilization: (value: number) => void;
  hidden?: boolean;
  accent: string;
}

const UtilizationInput: React.FC<UtilizationInputProps> = ({
  label,
  utilization,
  setUtilization,
  accent,
  hidden = false,
}) => {
  const formattedValue = Number.isInteger(utilization)
    ? utilization
    : utilization.toFixed(1);

  return (
    <div hidden={hidden} className="flex items-center gap-2">
      <label>
        <p>{label}</p>
      </label>

      <input
        className={`grow ${accent}`}
        type="range"
        min={0}
        max={100}
        value={utilization}
        onChange={(e) => setUtilization(Number(e.target.value))}
      />

      <div className="flex items-center gap-1">
        <input
          className="w-16 border rounded-md text-center bg-white"
          type="number"
          min={0}
          max={100}
          step={0.1}
          value={formattedValue}
          onChange={(e) => setUtilization(Number(e.target.value))}
        />
        <span>%</span>
      </div>
    </div>
  );
};

export default UtilizationInput;
