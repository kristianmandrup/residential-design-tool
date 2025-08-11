import React from "react";
import { SceneObj } from "@/store";
import SectionHeader from "@/components/generic/SectionHeader";

interface RotationInputProps {
  selected: SceneObj;
  updateObject: (id: string, patch: Partial<SceneObj>) => void;
}

export default function RotationInput({
  selected,
  updateObject,
}: RotationInputProps) {
  // Convert radians to degrees for display
  const rotationInDegrees = Math.round((selected.rotation[1] * 180) / Math.PI);

  return (
    <div>
      <SectionHeader>Rotation Y</SectionHeader>
      <input
        type="number"
        step="90"
        min="0"
        max="270"
        className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
        value={rotationInDegrees}
        onChange={(e) => {
          const newRotation = [...selected.rotation] as [
            number,
            number,
            number
          ];
          let degrees = Number(e.target.value || "0");

          // Snap to 90-degree increments (0, 90, 180, 270)
          degrees = Math.round(degrees / 90) * 90;

          // Ensure value is within 0-270 range (0, 90, 180, 270)
          degrees = Math.max(0, Math.min(270, degrees));

          // Convert degrees to radians for Three.js
          const radians = (degrees * Math.PI) / 180;
          newRotation[1] = radians;

          updateObject(selected.id, { rotation: newRotation });
        }}
      />
      <div className="mt-1 text-xs text-gray-500">
        90° increments (0°, 90°, 180°, 270°)
      </div>
    </div>
  );
}
