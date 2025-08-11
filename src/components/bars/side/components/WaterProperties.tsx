import React from "react";
import { WaterObj, SceneObj } from "@/store/useStore";
import SelectField from "./generic/SelectField";
import GridSizeFields from "./GridSizeFields";
import NumberField from "./generic/NumberField";

interface WaterPropertiesProps {
  selected: WaterObj;
  updateObject: (id: string, patch: Partial<SceneObj>) => void;
}

export default function WaterProperties({
  selected,
  updateObject,
}: WaterPropertiesProps) {
  return (
    <>
      <SelectField
        label="Shape"
        value={selected.shape || "circular"}
        onChange={(value) =>
          updateObject(selected.id, {
            shape: value as "circular" | "rectangular",
          })
        }
        options={[
          { value: "circular", label: "Circular" },
          { value: "rectangular", label: "Rectangular" },
        ]}
      />

      <GridSizeFields
        gridWidth={selected.gridWidth || 1}
        gridDepth={selected.gridDepth || 1}
        gridHeight={selected.gridHeight || 0.1}
        onGridWidthChange={(value) =>
          updateObject(selected.id, { gridWidth: Math.max(1, value) })
        }
        onGridDepthChange={(value) =>
          updateObject(selected.id, { gridDepth: Math.max(1, value) })
        }
        onGridHeightChange={(value) =>
          updateObject(selected.id, {
            gridHeight: Math.max(0.05, Math.min(1, value)),
          })
        }
        heightMin={0.05}
        heightMax={1}
        showHeight={false}
      />

      {selected.shape === "rectangular" && (
        <NumberField
          label="Direction (degrees)"
          value={selected.direction || 0}
          onChange={(value) => {
            let numValue = Number(value);
            // Round to nearest 45-degree increment for grid snapping
            numValue = Math.round(numValue / 90) * 90;
            // Ensure value is within 0-360 range
            numValue = ((numValue % 360) + 360) % 360;
            updateObject(selected.id, {
              direction: numValue,
            });
          }}
          step={90}
          className="mt-3"
        />
      )}
    </>
  );
}
