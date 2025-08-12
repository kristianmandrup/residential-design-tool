import React, { useState } from "react";
import { BuildingObj, SceneObj } from "@/store";
import NumberField from "../../../../generic/NumberField";
import GridSizeFields from "../GridSizeFields";
import { SelectField, ColorField } from "../../../../generic";
import { FloorProperties } from "./FloorProperties";
import PositionInputs from "../PositionInputs";
import CollapsibleSection from "../../CollapsibleSection";

interface BuildingPropertiesProps {
  selected: BuildingObj;
  updateObject: (id: string, patch: Partial<SceneObj>) => void;
}

export function BuildingProperties({
  selected,
  updateObject,
}: BuildingPropertiesProps) {
  const [selectedFloor, setSelectedFloor] = useState(0);

  const handleFloorsChange = (value: number) => {
    const newFloors = Math.max(1, Math.min(10, value));

    // Adjust floorProperties array when number of floors changes
    let newFloorProperties = [...selected.floorProperties];
    if (newFloors > selected.floors) {
      // Add new floors with default properties
      for (let i = selected.floors; i < newFloors; i++) {
        newFloorProperties.push({
          windowsEnabled: true,
          wallColor: selected.color,
        });
      }
    } else if (newFloors < selected.floors) {
      // Remove excess floors
      newFloorProperties = newFloorProperties.slice(0, newFloors);
    }

    updateObject(selected.id, {
      floors: newFloors,
      floorProperties: newFloorProperties,
    });

    // Adjust selected floor if it's out of bounds
    if (selectedFloor >= newFloors) {
      setSelectedFloor(newFloors - 1);
    }
  };

  return (
    <div className="space-y-2">
      {/* Building-wide properties */}
      <CollapsibleSection
        title="Building Properties"
        defaultCollapsed={true}
        icon={<span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>}
      >
        <div className="space-y-2">
          <NumberField
            label="Floors"
            value={selected.floors}
            onChange={handleFloorsChange}
            min={1}
            max={10}
          />

          <PositionInputs selected={selected} updateObject={updateObject} />
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
            label="Default wall color"
            value={selected.color}
            onChange={(value) => updateObject(selected.id, { color: value })}
          />
          <ColorField
            label="Roof color"
            value={selected.roofColor}
            onChange={(value) =>
              updateObject(selected.id, { roofColor: value })
            }
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
            onChange={(value) =>
              updateObject(selected.id, { windowColor: value })
            }
          />
        </div>
      </CollapsibleSection>

      {/* Floor selector */}
      <div>
        <SelectField
          label="Select Floor"
          value={selectedFloor.toString()}
          onChange={(value: string) => setSelectedFloor(parseInt(value))}
          options={Array.from({ length: selected.floors }, (_, i) => ({
            value: i.toString(),
            label: `Floor ${i + 1}`,
          }))}
        />
      </div>

      {/* Floor-specific properties */}
      <FloorProperties
        selected={selected}
        selectedFloor={selectedFloor}
        updateObject={updateObject}
      />
    </div>
  );
}

export default BuildingProperties;
