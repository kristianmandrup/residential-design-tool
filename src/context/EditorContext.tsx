"use client";
import React, { createContext, useContext, useState } from "react";

export type Tool =
  | "select"
  | "add-building"
  | "add-tree"
  | "add-road"
  | "add-wall"
  | "erase";

export type RoofType = "flat" | "gabled" | "hipped";

export interface SceneObjectBase {
  id: string;
  type: "building" | "tree" | "road" | "wall";
  position: [number, number, number];
}

export interface BuildingObject extends SceneObjectBase {
  type: "building";
  floors: number;
  color: string;
  roofType: RoofType;
  roofColor: string;
}

export interface TreeObject extends SceneObjectBase {
  type: "tree";
  scale: number;
}

export interface RoadObject extends SceneObjectBase {
  type: "road";
  length: number;
  width: number;
  rotationY: number;
}

export interface WallObject extends SceneObjectBase {
  type: "wall";
  length: number;
  height: number;
  rotationY: number;
}

export type SceneObject = BuildingObject | TreeObject | RoadObject | WallObject;

export interface EditorState {
  tool: Tool;
  setTool: (t: Tool) => void;
  objects: SceneObject[];
  addObject: (obj: SceneObject) => void;
  updateObject: (id: string, patch: Partial<SceneObject>) => void;
  removeObject: (id: string) => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
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
  const [tool, setTool] = useState<Tool>("select");
  const [objects, setObjects] = useState<SceneObject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function addObject(obj: SceneObject) {
    setObjects((s) => [...s, obj]);
    setSelectedId(obj.id);
  }

  function updateObject(id: string, patch: Omit<Partial<SceneObject>, "type">) {
    setObjects((s) => s.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }

  function removeObject(id: string) {
    setObjects((s) => s.filter((o) => o.id !== id));
    setSelectedId((cur) => (cur === id ? null : cur));
  }

  return (
    <EditorContext.Provider
      value={{
        tool,
        setTool,
        objects,
        addObject,
        updateObject,
        removeObject,
        selectedId,
        setSelectedId,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};
