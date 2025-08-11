import React from "react";
import { RoadObj, SceneObj } from "@/store/useStore";
import GridSizeFields from "./GridSizeFields";
import ColorField from "./generic/ColorField";
import NumberField from "./generic/NumberField";

interface RoadPropertiesProps {
  selected: RoadObj;
  updateObject: (id: string, patch: Partial<SceneObj>) => void;
}

export default function RoadProperties({
  selected,
  updateObject,
}: RoadPropertiesProps) {
  return (
    <>
      <GridSizeFields
        gridWidth={selected.gridWidth || 1}
        gridDepth={selected.gridDepth || 1}
        gridHeight={selected.gridHeight || 0.1}
        onGridWidthChange={(value) =>
          updateObject(selected.id, { gridWidth: Math.max(0.5, value) })
        }
        onGridDepthChange={(value) =>
          updateObject(selected.id, { gridDepth: Math.max(0.5, value) })
        }
        onGridHeightChange={(value) =>
          updateObject(selected.id, {
            gridHeight: Math.max(0.05, Math.min(1, value)),
          })
        }
        widthMin={0.5}
        widthMax={5}
        depthMin={0.5}
        depthMax={5}
        heightMin={0.05}
        heightMax={1}
        showHeight={true}
      />

      <ColorField
        label="Road Color"
        value="#808080"
        onChange={(value) => updateObject(selected.id, { color: value })}
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

      <div className="text-xs text-gray-600 mt-3 bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200">
        Road has{" "}
        <strong className="text-gray-800 font-semibold">
          {selected.points?.length || 0}
        </strong>{" "}
        points (multi-segment)
      </div>
    </>
  );
}
