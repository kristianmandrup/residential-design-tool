import React from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface DimensionSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  label: string;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  showRangeLabels?: boolean;
  formatValue?: (value: number) => string;
}

export function DimensionSlider({
  value,
  onValueChange,
  label,
  unit = "m",
  min = 0.5,
  max = 10,
  step = 0.5,
  className = "",
  showRangeLabels = false,
  formatValue,
}: DimensionSliderProps) {
  const displayValue = formatValue ? formatValue(value) : value.toFixed(1);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <Badge variant="outline" className="text-xs">
          {displayValue}
          {unit}
        </Badge>
      </div>
      <Slider
        value={[value]}
        onValueChange={(values) => onValueChange(values[0])}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
      {showRangeLabels && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {min}
            {unit}
          </span>
          <span>
            {max}
            {unit}
          </span>
        </div>
      )}
    </div>
  );
}
