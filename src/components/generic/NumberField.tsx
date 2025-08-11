import React from "react";

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export default function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  className = "",
}: NumberFieldProps) {
  return (
    <div className={className}>
      <label className="text-sm font-medium text-gray-700 mb-2 block">
        {label}
      </label>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
        value={value}
        onChange={(e) => {
          const numValue = Number(e.target.value);
          if (!isNaN(numValue)) {
            onChange(numValue);
          }
        }}
      />
    </div>
  );
}
