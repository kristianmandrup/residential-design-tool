import React from "react";
import { useSceneStore } from "@/store/useSceneStore";
import { ObjectPropertiesSection } from "./ObjectPropertiesSection";
import { ObjectBaseProps } from "./components/ObjectBaseProps";
import Section from "../../generic/Section";
import InputField from "../../generic/InputField";

export default function SelectedSection() {
  const objects = useSceneStore((s) => s.objects);
  const selectedId = useSceneStore((s) => s.selectedId);
  const updateObject = useSceneStore((s) => s.updateObject);
  const gridSize = useSceneStore((s) => s.gridSize);

  const selectedObject = objects.find((o) => o.id === selectedId);
  const gridX = selectedObject
    ? Math.round(selectedObject.position[0] / gridSize)
    : null;
  const gridY = selectedObject
    ? Math.round(selectedObject.position[2] / gridSize)
    : null;

  const gridZ = selectedObject
    ? Math.round(selectedObject.position[1] / gridSize)
    : null;

  return (
    selectedObject && (
      <Section>
        <div>
          <InputField
            label="Name"
            value={selectedObject.name || ""}
            onChange={(value) =>
              updateObject(selectedObject.id, { name: value })
            }
          />
        </div>
        <ObjectBaseProps
          gridX={gridX}
          gridY={gridY}
          gridZ={gridZ}
          type={selectedObject.type}
        />
        <ObjectPropertiesSection
          selectedObject={selectedObject}
          updateObject={updateObject}
        />
      </Section>
    )
  );
}
