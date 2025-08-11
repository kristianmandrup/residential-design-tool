import React from "react";
import { SceneObj } from "@/store/useStore";

interface PositionInputsProps {
  selected: SceneObj;
  updateObject: (id: string, patch: Partial<SceneObj>) => void;
}

export default function PositionInputs({
  selected,
  updateObject,
}: PositionInputsProps) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-2 block">
        Position
      </label>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs text-gray-600 mb-1 block">X</label>
          <input
            type="number"
            className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
            value={selected.position[0]}
            onChange={(e) => {
              const newPosition = [...selected.position] as [
                number,
                number,
                number
              ];
              newPosition[0] = Number(e.target.value || "0");
              updateObject(selected.id, { position: newPosition });
            }}
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Y</label>
          <input
            type="number"
            className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
            value={selected.position[1]}
            onChange={(e) => {
              const newPosition = [...selected.position] as [
                number,
                number,
                number
              ];
              newPosition[1] = Number(e.target.value || "0");
              updateObject(selected.id, { position: newPosition });
            }}
          />
        </div>
        <div>
          <label className="text-xs text-gray-600 mb-1 block">Z</label>
          <input
            type="number"
            className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
            value={selected.position[2]}
            onChange={(e) => {
              const newPosition = [...selected.position] as [
                number,
                number,
                number
              ];
              newPosition[2] = Number(e.target.value || "0");
              updateObject(selected.id, { position: newPosition });
            }}
          />
        </div>
      </div>
    </div>
  );
}
