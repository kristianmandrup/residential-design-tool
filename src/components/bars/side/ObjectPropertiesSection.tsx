import React from "react";
import {
  BuildingObj,
  RoadObj,
  SceneObj,
  TreeObj,
  WallObj,
  WaterObj,
} from "@/store/storeTypes";
import { BuildingProperties } from "./components/object/BuildingProperties";
import { RoadProperties } from "./components/object/RoadProperties";
import { TreeProperties } from "./components/object/TreeProperties";
import { WallProperties } from "./components/object/WallProperties";
import { WaterProperties } from "./components/object/WaterProperties";

interface ObjectPropertiesSectionProps {
  selectedObject: SceneObj | null;
  updateObject: (id: string, patch: Partial<SceneObj>) => void;
}

export function ObjectPropertiesSection({
  selectedObject,
  updateObject,
}: ObjectPropertiesSectionProps) {
  const renderObjectProperties = () => {
    if (!selectedObject) return null;

    switch (selectedObject.type) {
      case "building":
        return (
          <BuildingProperties
            selected={selectedObject as BuildingObj}
            updateObject={updateObject}
          />
        );
      case "road":
        return (
          <RoadProperties
            selected={selectedObject as RoadObj}
            updateObject={updateObject}
          />
        );
      case "tree":
        return (
          <TreeProperties
            selected={selectedObject as TreeObj}
            updateObject={updateObject}
          />
        );
      case "wall":
        return (
          <WallProperties
            selected={selectedObject as WallObj}
            updateObject={updateObject}
          />
        );
      case "water":
        return (
          <WaterProperties
            selected={selectedObject as WaterObj}
            updateObject={updateObject}
          />
        );
      default:
        return (
          <div className="text-sm text-gray-600">
            No properties available for {(selectedObject as SceneObj).type}
          </div>
        );
    }
  };

  return (
    <div className="pt-3 border-t border-gray-200">
      <label className="block mb-3 text-sm font-medium text-gray-700">
        Properties
      </label>
      {renderObjectProperties()}
    </div>
  );
}
