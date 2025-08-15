import React from "react";
import { Button } from "@/components/ui/button";

interface ColorOption {
  value: string;
  label?: string;
}

interface ColorPaletteProps {
  colors: ColorOption[];
  selectedColor?: string;
  onColorChange: (color: string) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  showLabels?: boolean;
}

export function ColorPalette({
  colors,
  selectedColor,
  onColorChange,
  className = "",
  size = "md",
  showLabels = false,
}: ColorPaletteProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  }[size];

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-4 gap-2">
        {colors.map((color) => (
          <Button
            key={color.value}
            variant="ghost"
            size="sm"
            className={`${sizeClasses} rounded-lg border-2 transition-all hover:scale-105 p-0 ${
              selectedColor === color.value ? "border-primary" : "border-muted"
            }`}
            style={{ backgroundColor: color.value }}
            onClick={() => onColorChange(color.value)}
            title={color.label || color.value}
          >
            {showLabels && (
              <span className="text-xs text-white mix-blend-difference">
                {color.label}
              </span>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
