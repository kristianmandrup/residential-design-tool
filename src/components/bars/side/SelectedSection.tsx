import React from "react";
import { useStore } from "@/store/useStore";
import { ObjectPropertiesSection } from "./ObjectPropertiesSection";
import Section from "../../generic/Section";
import Label from "../../generic/Label";

export default function SelectedSection() {
  const objects = useStore((s) => s.objects);
  const selectedId = useStore((s) => s.selectedId);
  const updateObject = useStore((s) => s.updateObject);
  const gridSize = useStore((s) => s.gridSize);

  const selectedObject = objects.find((o) => o.id === selectedId);
  const gridX = selectedObject
    ? Math.round(selectedObject.position[0] / gridSize)
    : null;
  const gridZ = selectedObject
    ? Math.round(selectedObject.position[2] / gridSize)
    : null;

  return (
    selectedObject && (
      <Section>
        <div>
          <Label htmlFor="selected-name">Name</Label>
          <input
            type="text"
            id="selected-name"
            value={selectedObject.name}
            onChange={(e) =>
              updateObject(selectedObject.id, { name: e.target.value })
            }
            className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
          />
        </div>
        <div>
          <Label htmlFor="selected-coordinates">Grid Coordinates</Label>
          <p className="mt-1 text-sm text-gray-600">
            X: {gridX}, Z: {gridZ}
          </p>
        </div>
        <div>
          <Label htmlFor="selected-type">Type</Label>
          <p className="mt-1 text-sm text-gray-600">{selectedObject.type}</p>
        </div>
        <ObjectPropertiesSection
          selectedObject={selectedObject}
          updateObject={updateObject}
        />
      </Section>
    )
  );
}
