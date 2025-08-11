import React from "react";
import NumberField from "./generic/NumberField";

interface GridSizeFieldsProps {
  gridWidth?: number;
  gridDepth?: number;
  gridHeight?: number;
  onGridWidthChange: (value: number) => void;
  onGridDepthChange: (value: number) => void;
  onGridHeightChange: (value: number) => void;
  widthMin?: number;
  widthMax?: number;
  depthMin?: number;
  depthMax?: number;
  heightMin?: number;
  heightMax?: number;
  showHeight?: boolean;
}

export default function GridSizeFields({
  gridWidth = 2,
  gridDepth = 2,
  gridHeight = 1,
  onGridWidthChange,
  onGridDepthChange,
  onGridHeightChange,
  widthMin = 2,
  widthMax = 10,
  depthMin = 2,
  depthMax = 10,
  heightMin = 1,
  heightMax = 5,
  showHeight = true,
}: GridSizeFieldsProps) {
  return (
    <>
      <NumberField
        label="Grid Width (units)"
        value={gridWidth}
        onChange={onGridWidthChange}
        min={widthMin}
        max={widthMax}
        step={2}
      />
      <NumberField
        label="Grid Depth (units)"
        value={gridDepth}
        onChange={onGridDepthChange}
        min={depthMin}
        max={depthMax}
        className="mt-3"
        step={2}
      />
      {showHeight && (
        <NumberField
          label="Grid Height (units)"
          value={gridHeight}
          onChange={onGridHeightChange}
          min={heightMin}
          max={heightMax}
          className="mt-3"
        />
      )}
    </>
  );
}
