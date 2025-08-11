import React from "react";
import { BuildingObj, SceneObj } from "@/store";
import NumberField from "../generic/NumberField";
import GridSizeFields from "../GridSizeFields";
import { SelectField, ColorField } from "../generic";

interface BuildingPropertiesProps {
  selected: BuildingObj;
  updateObject: (id: string, patch: Partial<SceneObj>) => void;
}

export function BuildingProperties({
  selected,
  updateObject,
}: BuildingPropertiesProps) {
  return (
    <>
      <NumberField
        label="Floors"
        value={selected.floors}
        onChange={(value) =>
          updateObject(selected.id, {
            floors: Math.max(1, Math.min(10, value)),
          })
        }
        min={1}
        max={10}
      />

      <GridSizeFields
        gridWidth={selected.gridWidth || 2}
        gridDepth={selected.gridDepth || 2}
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

      <ColorField
        label="Wall color"
        value={selected.color}
        onChange={(value) => updateObject(selected.id, { color: value })}
      />
      <ColorField
        label="Roof color"
        value={selected.roofColor}
        onChange={(value) => updateObject(selected.id, { roofColor: value })}
      />

      <SelectField
        label="Roof type"
        value={selected.roofType}
        onChange={(value) =>
          updateObject(selected.id, {
            roofType: value as "flat" | "gabled" | "hipped",
          })
        }
        options={[
          { value: "flat", label: "Flat" },
          { value: "gabled", label: "Gabled" },
          { value: "hipped", label: "Hipped" },
        ]}
      />

      <ColorField
        label="Window color"
        value={selected.windowColor || "#bfe9ff"}
        onChange={(value) => updateObject(selected.id, { windowColor: value })}
      />
    </>
  );
}

export default BuildingProperties;
