import React from "react";

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function ColorField({
  label,
  value,
  onChange,
  className = "",
}: ColorFieldProps) {
  return (
    <div className={className}>
      <label className="text-sm font-medium text-gray-700 mb-2 block">
        {label}
      </label>
      <input
        className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-200"
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
