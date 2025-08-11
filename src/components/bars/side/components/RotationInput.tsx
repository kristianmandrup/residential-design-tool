import React from "react";
import { SceneObj } from "@/store/useStore";

interface RotationInputProps {
  selected: SceneObj;
  updateObject: (id: string, patch: Partial<SceneObj>) => void;
}

export default function RotationInput({
  selected,
  updateObject,
}: RotationInputProps) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-2 block">
        Rotation Y
      </label>
      <input
        type="number"
        step="10"
        min="0"
        max="360"
        className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
        value={selected.rotation[1]}
        onChange={(e) => {
          const newRotation = [...selected.rotation] as [
            number,
            number,
            number
          ];
          let value = Number(e.target.value || "0");
          // Round to nearest 45-degree increment for grid snapping
          value = Math.round(value / 45) * 45;
          // Ensure value is within 0-360 range
          value = ((value % 360) + 360) % 360;
          newRotation[1] = value;
          updateObject(selected.id, { rotation: newRotation });
        }}
      />
      <div className="text-xs text-gray-500 mt-1">
        Increments of 10° (0°, 10°, 20°, ..., 350°)
      </div>
    </div>
  );
}
