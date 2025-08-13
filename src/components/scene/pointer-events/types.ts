import * as THREE from "three";
import { SceneObj, RoadPoint } from "@/store/storeTypes";
import { Tool } from "@/contexts/ToolContext";

export interface PointerEventContext {
  canvas: HTMLCanvasElement;
  camera: THREE.Camera;
  scene: THREE.Scene;
  gridSize: number;
  snap: boolean;
  objects: SceneObj[];
}

export interface StoreActions {
  addObject: (obj: Partial<SceneObj> & { type: string }) => string;
  updateObject: (id: string, patch: Partial<SceneObj>) => void;
  removeObject: (id: string) => void;
  setSelectedId: (id: string | null) => void;
  setSelectedIds: (ids: string[]) => void;
}

export interface SelectionState {
  selectedId: string | null;
  selectedIds: string[];
}

export interface RoadDrawingState {
  isDrawingRoad: boolean;
  tempRoadPoints: RoadPoint[];
  lastClickTime: number | null;
  selectedRoadType: "residential" | "highway" | "dirt" | "pedestrian";
  roadWidth: number;
}

export interface RoadDrawingActions {
  setIsDrawingRoad: (drawing: boolean) => void;
  setTempRoadPoints: (points: RoadPoint[]) => void;
  setLastClickTime: (time: number | null) => void;
  setSelectedRoadType: (
    type: "residential" | "highway" | "dirt" | "pedestrian"
  ) => void;
  setRoadWidth: (width: number) => void;
}

export interface ToolState {
  selectedTool: Tool;
  setSelectedTool: (tool: Tool) => void;
}

export interface PointerEventData {
  event: PointerEvent;
  worldPosition: THREE.Vector3;
  snappedPosition: THREE.Vector3;
  button: number;
  shiftKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
}
