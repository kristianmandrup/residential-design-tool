import React from "react";
import Label from "./Label";

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export default function SelectField({
  label,
  value,
  onChange,
  options,
  className = "",
}: SelectFieldProps) {
  return (
    <div className={className}>
      <Label htmlFor={`select-${label.replace(/\s+/g, "-")}`}>{label}</Label>
      <select
        id={`select-${label.replace(/\s+/g, "-")}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
