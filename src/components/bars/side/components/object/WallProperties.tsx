import React from "react";
import { WallObj, SceneObj } from "@/store/storeTypes";
import { PositionInputs, GridSizeFields } from "../";
import { NumberField } from "@/components/generic";

interface WallPropertiesProps {
  selected: WallObj;
  updateObject: (id: string, patch: Partial<SceneObj>) => void;
}

export function WallProperties({
  selected,
  updateObject,
}: WallPropertiesProps) {
  return (
    <>
      <PositionInputs selected={selected} updateObject={updateObject} />
      <GridSizeFields
        gridWidth={selected.gridWidth || 2}
        gridDepth={selected.gridDepth || 1}
        gridHeight={selected.gridHeight || 1}
        onGridWidthChange={(value) =>
          updateObject(selected.id, { gridWidth: Math.max(1, value) })
        }
        onGridDepthChange={(value) =>
          updateObject(selected.id, { gridDepth: Math.max(1, value) })
        }
        onGridHeightChange={(value) =>
          updateObject(selected.id, {
            gridHeight: Math.max(1, Math.min(5, value)),
          })
        }
      />

      <NumberField
        label="Direction (degrees)"
        value={selected.direction || 0}
        onChange={(value) => {
          let numValue = Number(value);
          // Round to nearest 45-degree increment for grid snapping
          numValue = Math.round(numValue / 45) * 45;
          // Ensure value is within 0-360 range
          numValue = ((numValue % 360) + 360) % 360;
          updateObject(selected.id, {
            direction: numValue,
          });
        }}
        step={45}
        className="mt-3"
      />
    </>
  );
}

export default WallProperties;
