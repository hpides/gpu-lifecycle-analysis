interface ValueSelectionProps {
  label: string;
  setState: (value: number) => void;
  currentState: number;
  color?: string;
}

const ValueSelection = ({
  label,
  setState,
  currentState,
}: ValueSelectionProps) => {

  return (
    <div className="flex items-center gap-4">
      <p className="text-sm font-medium">{label}</p>
      <input
        type="number"
        value={currentState}
        onChange={(e) => setState(Number(e.target.value))}
        className="w-20 px-2 border rounded text-center"
      />
      <button
        type="button"
        className="px-3 border cursor-pointer rounded hover:bg-gray-100 transition"
        onClick={() => setState(currentState / 2)}
      >
        ÷2
      </button>
      <button
        type="button"
        className="px-3 border cursor-pointer rounded hover:bg-gray-100 transition"
        onClick={() => setState(currentState * 2)}
      >
        ×2
      </button>
    </div>
  );
};

export default ValueSelection;
