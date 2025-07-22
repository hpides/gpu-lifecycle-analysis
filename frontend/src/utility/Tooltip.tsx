import { useState, useRef } from "react";

interface TooltipProps {
  tooltipText: string;
  children: React.ReactNode;
}

export default function Tooltip({ tooltipText, children }: TooltipProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    setIsHovered(true);
    timeoutRef.current = window.setTimeout(() => {
      setShowTooltip(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }
    setShowTooltip(false);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <p
        className={`${
          isHovered ? "opacity-60" : "opacity-100"
        } hover:cursor-help duration-300 ease-in-out`}
      >
        {children}
      </p>
      <div
        className={`absolute bottom-full mb-2 w-max max-w-xs text-base bg-black text-white rounded-lg px-2 py-1 text-center font-normal shadow-lg whitespace-pre-line transition-all duration-300 ease-in-out
          ${
            showTooltip
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-2 pointer-events-none"
          }
        `}
      >
        {tooltipText}
      </div>
    </div>
  );
}
