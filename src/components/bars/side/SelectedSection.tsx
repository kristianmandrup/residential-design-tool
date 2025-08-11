/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useStore } from "@/store/useStore";
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

export default function SelectedSection() {
  const objects = useStore((s) => s.objects);
  const selectedId = useStore((s) => s.selectedId);
  const updateObject = useStore((s) => s.updateObject);
  const setSelectedId = useStore((s) => s.setSelectedId);
  const gridSize = useStore((s) => s.gridSize);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedObject = objects.find((o) => o.id === selectedId);
  const gridX = selectedObject
    ? Math.round(selectedObject.position[0] / gridSize)
    : null;
  const gridZ = selectedObject
    ? Math.round(selectedObject.position[2] / gridSize)
    : null;

  const filteredObjects = objects.filter(
    (o: SceneObj) =>
      o.name &&
      searchQuery &&
      o.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            No properties available for {(selectedObject as any).type}
          </div>
        );
    }
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-md hover:shadow-lg transition-shadow duration-300">
      <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
        Selected Object
      </h3>
      {selectedObject ? (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={selectedObject.name}
              onChange={(e) =>
                updateObject(selectedObject.id, { name: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Grid Coordinates
            </label>
            <p className="mt-1 text-sm text-gray-600">
              X: {gridX}, Z: {gridZ}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <p className="mt-1 text-sm text-gray-600">{selectedObject.type}</p>
          </div>
          <div className="pt-3 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Properties
            </label>
            {renderObjectProperties()}
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-600">No object selected</p>
      )}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Search Objects
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name..."
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
        <ul className="mt-2 max-h-40 overflow-auto">
          {filteredObjects.map((obj) => (
            <li
              key={obj.id}
              onClick={() => setSelectedId(obj.id)}
              className={`cursor-pointer p-2 rounded-md hover:bg-blue-100 ${
                obj.id === selectedId ? "bg-blue-200" : ""
              }`}
            >
              {obj.name} ({obj.type})
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
