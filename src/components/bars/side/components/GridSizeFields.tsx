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
  gridWidth = 1,
  gridDepth = 1,
  gridHeight = 1,
  onGridWidthChange,
  onGridDepthChange,
  onGridHeightChange,
  widthMin = 1,
  widthMax = 10,
  depthMin = 1,
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
      />
      <NumberField
        label="Grid Depth (units)"
        value={gridDepth}
        onChange={onGridDepthChange}
        min={depthMin}
        max={depthMax}
        className="mt-3"
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
