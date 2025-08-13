/* eslint-disable @typescript-eslint/no-explicit-any */
import { Camera, Scene } from "three";

export interface PointerEventContext {
  canvas: HTMLCanvasElement;
  camera: Camera;
  scene: Scene;
  gridSize: number;
  snap: boolean;
  objects: any[];
}

export interface StoreActions {
  addObject: (object: any) => void;
  updateObject: (id: string, updates: any) => void;
  removeObject: (id: string) => void;
  setSelectedId: (id: string | null) => void;
  setSelectedIds: (ids: string[]) => void;
}

export interface SelectionState {
  selectedId: string | null;
  selectedIds: string[];
}

import { Tool } from "@/contexts/ToolContext";

export interface ToolState {
  selectedTool: Tool;
  setSelectedTool: (tool: Tool) => void;
}
