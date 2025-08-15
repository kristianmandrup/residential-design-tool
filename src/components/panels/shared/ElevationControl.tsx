import React from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useSceneStore } from "@/store/useSceneStore";

interface ElevationControlProps {
  objectId: string;
  elevation?: number;
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function ElevationControl({
  objectId,
  elevation = 0,
  label = "Elevation",
  min = -5,
  max = 5,
  step = 0.1,
  className = "",
}: ElevationControlProps) {
  const updateObject = useSceneStore((s) => s.updateObject);

  const handleElevationChange = (value: number[]) => {
    updateObject(objectId, { elevation: value[0] });
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <Badge variant="outline" className="text-xs">
          {elevation.toFixed(2)}m
        </Badge>
      </div>
      <Slider
        value={[elevation]}
        onValueChange={handleElevationChange}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  );
}
