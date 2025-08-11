import React from "react";
import Label from "./Label";

interface InputFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number" | "email" | "password";
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  className = "",
  disabled = false,
  required = false,
}: InputFieldProps) {
  return (
    <div className={className}>
      <Label
        htmlFor={`input-${label.replace(/\s+/g, "-")}`}
        required={required}
      >
        {label}
      </Label>
      <input
        type={type}
        id={`input-${label.replace(/\s+/g, "-")}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700 disabled:bg-gray-100 disabled:text-gray-500"
      />
    </div>
  );
}
