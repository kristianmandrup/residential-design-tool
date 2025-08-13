// src/components/bars/side/components/object/RoadBasicProperties.tsx
import React from "react";
import { RoadObj, SceneObj } from "@/store/storeTypes";
import { NumberField, SelectField, ColorField } from "@/components/generic";
import { PositionInputs } from "../../";
import { ROAD_TYPE_OPTIONS, ROAD_TYPE_CONFIGS } from "./roadUtils";

interface RoadBasicPropertiesProps {
  selected: RoadObj;
  updateObject: (id: string, patch: Partial<SceneObj>) => void;
}

export function RoadBasicProperties({
  selected,
  updateObject,
}: RoadBasicPropertiesProps) {
  const roadType = selected.roadType || "residential";
  const roadConfig = ROAD_TYPE_CONFIGS[roadType];

  const applyRoadTypeDefaults = () => {
    updateObject(selected.id, {
      width: roadConfig.defaultWidth,
      color: roadConfig.color,
    });
  };

  return (
    <div className="space-y-3">
      <PositionInputs selected={selected} updateObject={updateObject} />

      <div className="space-y-2">
        <SelectField
          label="Road Type"
          value={roadType}
          onChange={(value) => {
            updateObject(selected.id, {
              roadType: value as
                | "residential"
                | "highway"
                | "dirt"
                | "pedestrian",
            });
          }}
          options={ROAD_TYPE_OPTIONS}
        />

        <div className="flex items-center gap-2 p-3 text-xs text-gray-600 border border-gray-200 rounded-lg bg-gray-50">
          <span className="text-lg">{roadConfig.emoji}</span>
          <span>{roadConfig.description}</span>
        </div>

        <button
          onClick={applyRoadTypeDefaults}
          className="px-2 py-1 text-xs text-blue-600 underline transition-all rounded hover:text-blue-800 hover:no-underline bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          Apply default width & color for this type
        </button>
      </div>

      <NumberField
        label="Width (meters)"
        value={selected.width || roadConfig.defaultWidth}
        onChange={(value) =>
          updateObject(selected.id, { width: Math.max(1, value) })
        }
        min={1}
        max={20}
        step={0.5}
      />

      <ColorField
        label="Road Color"
        value={selected.color || roadConfig.color}
        onChange={(value) => updateObject(selected.id, { color: value })}
      />
    </div>
  );
}
