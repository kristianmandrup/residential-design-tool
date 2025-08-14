/* eslint-disable @typescript-eslint/no-explicit-any */
import { Camera, Scene, Vector3 } from "three";
import { Tool } from "@/contexts/ToolContext";
import { RoadPoint } from "@/store/storeTypes";

export interface PointerEventContext {
  canvas: HTMLCanvasElement;
  camera: Camera;
  scene: Scene;
  gridSize: number;
  snap: boolean;
  objects: any[];
}

export interface PointerEventData {
  event: PointerEvent;
  worldPosition: Vector3;
  snappedPosition: Vector3;
  button: number;
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
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

export interface ToolState {
  selectedTool: Tool;
  setSelectedTool: (tool: Tool) => void;
}

// Road drawing state and actions (unified)
export interface RoadDrawingState {
  isDrawingRoad: boolean;
  tempRoadPoints: RoadPoint[];
  lastClickTime: number | null;
  selectedRoadType: "residential" | "highway" | "dirt" | "pedestrian";
  roadWidth: number;
  snapToGrid: boolean;
}

export interface RoadDrawingActions {
  setIsDrawingRoad: (isDrawing: boolean) => void;
  setTempRoadPoints: (points: RoadPoint[]) => void;
  setLastClickTime: (time: number | null) => void;
  setSelectedRoadType: (
    type: "residential" | "highway" | "dirt" | "pedestrian"
  ) => void;
  setRoadWidth: (width: number) => void;
  setSnapToGrid: (snap: boolean) => void;
  cancelRoadDrawing: () => void;
  undoLastRoadPoint: () => void;
}
