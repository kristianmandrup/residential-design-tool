"use client";
import React, { createContext, useContext, useState } from "react";

// Import the unified Tool type from ToolContext
export type { Tool } from "./ToolContext";

export type RoofType = "flat" | "gabled" | "hipped";

export interface SceneObjectBase {
  id: string;
  type: "building" | "tree" | "road" | "wall" | "water";
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface BuildingObject extends SceneObjectBase {
  type: "building";
  floors: number;
  color: string;
  roofType: RoofType;
  roofColor: string;
  gridWidth: number;
  gridDepth: number;
  gridHeight: number;
}

export interface TreeObject extends SceneObjectBase {
  type: "tree";
  treeType: string;
  gridWidth: number;
  gridDepth: number;
  gridHeight: number;
}

export interface RoadObject extends SceneObjectBase {
  type: "road";
  roadType: "residential" | "highway" | "dirt" | "pedestrian";
  points: Array<{ x: number; z: number; controlPoint?: { x: number; z: number } }>;
  width: number;
  color: string;
  elevation: number;
  thickness: number;
  gridWidth: number;
  gridDepth: number;
  gridHeight: number;
}

export interface WallObject extends SceneObjectBase {
  type: "wall";
  length: number;
  height: number;
  thickness: number;
  color: string;
  gridWidth: number;
  gridDepth: number;
  gridHeight: number;
}

export interface WaterObject extends SceneObjectBase {
  type: "water";
  width: number;
  depth: number;
  waveHeight: number;
  transparency: number;
  gridWidth: number;
  gridDepth: number;
  gridHeight: number;
}

export type SceneObject = BuildingObject | TreeObject | RoadObject | WallObject | WaterObject;

export interface EditorState {
  objects: SceneObject[];
  addObject: (obj: SceneObject) => void;
  updateObject: (id: string, patch: Partial<SceneObject>) => void;
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
  const [objects, setObjects] = useState<SceneObject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [gridSize, setGridSize] = useState(1);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  function addObject(obj: SceneObject) {
    console.log("🏗️ Adding object to scene:", obj);
    setObjects((s) => [...s, obj]);
    setSelectedId(obj.id);
    setSelectedIds([obj.id]);
  }

  function updateObject(id: string, patch: Partial<SceneObject>) {
    console.log("🔄 Updating object:", id, patch);
    setObjects((s) => s.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }

  function removeObject(id: string) {
    console.log("🗑️ Removing object:", id);
    setObjects((s) => s.filter((o) => o.id !== id));
    setSelectedId((cur) => (cur === id ? null : cur));
    setSelectedIds((cur) => cur.filter(selId => selId !== id));
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

