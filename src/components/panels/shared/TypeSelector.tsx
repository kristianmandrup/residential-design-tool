import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface TypeOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface TypeSelectorProps {
  options: TypeOption[];
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  className?: string;
  placeholder?: string;
}

export function TypeSelector({
  options,
  value,
  onValueChange,
  label,
  className = "",
  placeholder = "Select type...",
}: TypeSelectorProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor="type-selector" className="text-sm font-medium">
          {label}
        </Label>
      )}
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  {option.icon && <span>{option.icon}</span>}
                  <span>{option.label}</span>
                </div>
                {option.description && (
                  <span className="text-xs text-muted-foreground">
                    {option.description}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
