import React from "react";
import { BuildingObj, SceneObj } from "@/store";
import { SwitchField, ColorField, InputField } from "../../../../generic";
import CollapsibleSection from "../../CollapsibleSection";

interface FloorPropertiesProps {
  selected: BuildingObj;
  selectedFloor: number;
  updateObject: (id: string, patch: Partial<SceneObj>) => void;
  floorName?: string;
}

export function FloorProperties({
  selected,
  selectedFloor,
  updateObject,
  floorName,
}: FloorPropertiesProps) {
  const floorProperties = selected.floorProperties[selectedFloor];

  if (!floorProperties) {
    return (
      <div className="text-sm text-gray-600">
        Floor properties not available
      </div>
    );
  }

  const updateFloorProperties = (patch: Partial<typeof floorProperties>) => {
    const newFloorProperties = [...selected.floorProperties];
    newFloorProperties[selectedFloor] = {
      ...newFloorProperties[selectedFloor],
      ...patch,
    };
    updateObject(selected.id, { floorProperties: newFloorProperties });
  };

  return (
    <CollapsibleSection
      title={
        floorName
          ? `${floorName} Properties`
          : `Floor ${selectedFloor + 1} Properties`
      }
      defaultCollapsed={true}
      icon={<span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>}
    >
      <div className="space-y-4">
        <InputField
          label="Floor name"
          value={floorProperties.name || ""}
          onChange={(value) => updateFloorProperties({ name: value })}
          placeholder="Enter floor name"
        />

        <SwitchField
          label="Windows enabled"
          checked={floorProperties.windowsEnabled}
          onCheckedChange={(checked: boolean) =>
            updateFloorProperties({ windowsEnabled: checked })
          }
        />

        <ColorField
          label="Wall color"
          value={floorProperties.wallColor}
          onChange={(value) => updateFloorProperties({ wallColor: value })}
        />
      </div>
    </CollapsibleSection>
  );
}

export default FloorProperties;
