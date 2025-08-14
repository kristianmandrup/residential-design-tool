"use client";
import React, { createContext, useContext, useState } from "react";
import {
  SceneObj,
  BuildingObj,
  TreeObj,
  RoadObj,
  WallObj,
  WaterObj,
} from "@/store/storeTypes";
import { nanoid } from "nanoid";

// Re-export store types for convenience
export type {
  SceneObj,
  BuildingObj,
  TreeObj,
  RoadObj,
  WallObj,
  WaterObj,
  RoadPoint,
  RoofType,
  ObjType,
} from "@/store/storeTypes";

// Import the unified Tool type from ToolContext
export type { Tool } from "./ToolContext";

// Use store types directly - no duplicate definitions
export type SceneObject = SceneObj;
export type BuildingObject = BuildingObj;
export type TreeObject = TreeObj;
export type RoadObject = RoadObj;
export type WallObject = WallObj;
export type WaterObject = WaterObj;

export interface EditorState {
  objects: SceneObj[];
  addObject: (obj: SceneObj) => void;
  updateObject: (id: string, patch: Partial<SceneObj>) => void;
  removeObject: (id: string) => void;
  selectedId: string | null;
  selectedIds: string[];
  setSelectedId: (id: string | null) => void;
  setSelectedIds: (ids: string[]) => void;
  // Scene settings
  gridSize: number;
  setGridSize: (size: number) => void;
  snapEnabled: boolean;
  setSnapEnabled: (enabled: boolean) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
}

const EditorContext = createContext<EditorState | undefined>(undefined);

export const useEditor = () => {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used inside EditorProvider");
  return ctx;
};

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [objects, setObjects] = useState<SceneObj[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [gridSize, setGridSize] = useState(1);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  function addObject(obj: SceneObj) {
    console.log("🏗️ Adding object to scene:", obj);

    // Ensure the object has all required properties
    const completeObj: SceneObj = {
      ...obj,
      id: obj.id || nanoid(),
      name:
        obj.name ||
        `${obj.type.charAt(0).toUpperCase() + obj.type.slice(1)} ${
          objects.length + 1
        }`,
    };

    // Add type-specific defaults if missing
    if (completeObj.type === "road") {
      const roadObj = completeObj as RoadObj;
      if (!roadObj.color) roadObj.color = "#404040";
      if (roadObj.elevation === undefined) roadObj.elevation = 0.02;
      if (roadObj.thickness === undefined) roadObj.thickness = 0.08;
      if (!roadObj.roadType) roadObj.roadType = "residential";
    }

    setObjects((s) => [...s, completeObj]);
    setSelectedId(completeObj.id);
    setSelectedIds([completeObj.id]);
  }

  function updateObject(id: string, patch: Partial<SceneObj>) {
    console.log("🔄 Updating object:", id, patch);
    setObjects((s) =>
      s.map((o) => (o.id === id ? ({ ...o, ...patch } as SceneObj) : o))
    );
  }

  function removeObject(id: string) {
    console.log("🗑️ Removing object:", id);
    setObjects((s) => s.filter((o) => o.id !== id));
    setSelectedId((cur) => (cur === id ? null : cur));
    setSelectedIds((cur) => cur.filter((selId) => selId !== id));
  }

  return (
    <EditorContext.Provider
      value={{
        objects,
        addObject,
        updateObject,
        removeObject,
        selectedId,
        selectedIds,
        setSelectedId,
        setSelectedIds,
        gridSize,
        setGridSize,
        snapEnabled,
        setSnapEnabled,
        showGrid,
        setShowGrid,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};
