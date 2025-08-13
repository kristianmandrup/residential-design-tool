import React from "react";
import { SceneObj } from "@/store/storeTypes";
import NumberField from "@/components/generic/NumberField";
import SectionHeader from "@/components/generic/SectionHeader";

interface PositionInputsProps {
  selected: SceneObj;
  updateObject: (id: string, patch: Partial<SceneObj>) => void;
}

export function PositionInputs({
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
      <SectionHeader>Position</SectionHeader>
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
