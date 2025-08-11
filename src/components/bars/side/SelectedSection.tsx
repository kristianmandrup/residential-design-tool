/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useStore, SceneObj } from "@/store/useStore";
import PositionInputs from "./components/PositionInputs";
import RotationInput from "./components/RotationInput";
import BuildingProperties from "./components/BuildingProperties";
import TreeProperties from "./components/TreeProperties";
import WaterProperties from "./components/WaterProperties";
import WallProperties from "./components/WallProperties";
import RoadProperties from "./components/RoadProperties";
import DeleteButton from "./components/generic/DeleteButton";

export default function SelectedSection() {
  const selectedId = useStore((s) => s.selectedId);
  const objects = useStore((s) => s.objects);
  const updateObject = useStore((s) => s.updateObject);

  const selected = objects.find((o) => o.id === selectedId) as
    | SceneObj
    | undefined;

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-md hover:shadow-lg transition-shadow duration-300 flex-1">
      <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
        Selected
      </h3>
      {!selected && (
        <div className="text-sm text-gray-600 italic bg-gray-50 p-4 rounded-lg border border-gray-200">
          Select an object to edit its properties
        </div>
      )}

      {selected && (
        <div className="space-y-4">
          <div className="text-sm">
            <strong className="text-gray-800 font-medium">Type:</strong>
            <span className="ml-2 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-lg text-sm font-semibold">
              {selected.type}
            </span>
          </div>

          <PositionInputs selected={selected} updateObject={updateObject} />
          <RotationInput selected={selected} updateObject={updateObject} />

          {selected.type === "building" && (
            <BuildingProperties
              selected={selected as any}
              updateObject={updateObject}
            />
          )}

          {selected.type === "tree" && (
            <TreeProperties
              selected={selected as any}
              updateObject={updateObject}
            />
          )}

          {selected.type === "water" && (
            <WaterProperties
              selected={selected as any}
              updateObject={updateObject}
            />
          )}

          {selected.type === "wall" && (
            <WallProperties
              selected={selected as any}
              updateObject={updateObject}
            />
          )}

          {selected.type === "road" && (
            <RoadProperties
              selected={selected as any}
              updateObject={updateObject}
            />
          )}

          <div className="flex gap-3 mt-6">
            <DeleteButton selectedId={selected.id} />
          </div>
        </div>
      )}
    </section>
  );
}
