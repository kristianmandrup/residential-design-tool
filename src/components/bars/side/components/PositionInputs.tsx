import React from "react";
import { SceneObj } from "@/store/useStore";
import NumberField from "./generic/NumberField";

interface PositionInputsProps {
  selected: SceneObj;
  updateObject: (id: string, patch: Partial<SceneObj>) => void;
}

export default function PositionInputs({
  selected,
  updateObject,
}: PositionInputsProps) {
  const updatePosition = (index: number, value: number) => {
    const newPosition = [...selected.position] as [number, number, number];
    newPosition[index] = value;
    updateObject(selected.id, { position: newPosition });
  };

  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-2 block">
        Position
      </label>
      <div className="grid grid-cols-3 gap-2">
        <NumberField
          label="X"
          value={selected.position[0]}
          onChange={(value) => updatePosition(0, value)}
          className="col-span-1"
        />
        <NumberField
          label="Y"
          value={selected.position[2]}
          onChange={(value) => updatePosition(2, value)}
          className="col-span-1"
        />
      </div>
    </div>
  );
}
