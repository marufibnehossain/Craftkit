"use client";

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  className?: string;
}

export default function QuantityStepper({
  value,
  min = 1,
  max = 99,
  onChange,
  className = "",
}: QuantityStepperProps) {
  return (
    <div
      className={`inline-flex items-center border border-brand-dark bg-brand-light h-14 ${className}`}
      role="group"
      aria-label="Quantity"
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-12 h-full flex items-center justify-center text-dark-100 text-lg hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <span className="w-12 text-center font-sans text-base font-semibold text-dark-100 tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-12 h-full flex items-center justify-center text-dark-100 text-lg hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
