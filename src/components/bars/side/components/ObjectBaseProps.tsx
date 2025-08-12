import React from "react";
import Label from "../../../generic/Label";

interface ObjectBaseProps {
  gridX: number | null;
  gridY: number | null;
  gridZ: number | null;
  type: string;
}

export function ObjectBaseProps({
  gridX,
  gridY,
  gridZ,
  type,
}: ObjectBaseProps) {
  return (
    <div className="flex space-x-4">
      <div className="flex-1">
        <Label htmlFor="selected-coordinates">Grid Coordinates</Label>
        <p className="mt-1 text-sm text-gray-600">
          X: {gridX}, Y: {gridY}, Z: {gridZ}
        </p>
      </div>
      <div className="flex-1">
        <Label htmlFor="selected-type">Type</Label>
        <p className="mt-1 text-sm text-gray-600">{type}</p>
      </div>
    </div>
  );
}
