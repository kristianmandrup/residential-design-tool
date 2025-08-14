export type RoofType = "flat" | "gabled" | "hipped";
export type ObjType =
  | "building"
  | "tree"
  | "road"
  | "wall"
  | "water"
  | "intersection";

export interface SceneBase {
  id: string;
  name: string;
  type: ObjType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  gridWidth?: number;
  gridDepth?: number;
  gridHeight?: number;
}

export interface FloorProperties {
  windowsEnabled: boolean;
  wallColor: string;
  name?: string;
}

export interface BuildingObj extends SceneBase {
  type: "building";
  floors: number;
  color: string;
  roofType: RoofType;
  roofColor: string;
  windowColor?: string;
  floorProperties: FloorProperties[];
  gridWidth?: number;
  gridDepth?: number;
  gridHeight?: number;
}

export interface TreeObj extends SceneBase {
  type: "tree";
  foliageColor?: string;
  treeType?: string;
  gridWidth?: number;
  gridDepth?: number;
  gridHeight?: number;
}

export interface WallObj extends SceneBase {
  type: "wall";
  length: number;
  height: number;
  thickness?: number;
  color?: string;
  direction?: number;
  gridWidth?: number;
  gridDepth?: number;
  gridHeight?: number;
}

export interface RoadPoint {
  x: number;
  z: number;
  controlPoint?: { x: number; z: number };
}

export interface RoadObj extends SceneBase {
  type: "road";
  points: RoadPoint[];
  width: number;
  roadType: "residential" | "highway" | "dirt" | "pedestrian";
  color?: string;
  elevation?: number;
  thickness?: number;
  direction?: number;
  gridWidth?: number;
  gridDepth?: number;
  gridHeight?: number;
}

export interface WaterObj extends SceneBase {
  type: "water";
  radius?: number;
  width?: number;
  depth?: number;
  waveHeight?: number;
  transparency?: number;
  shape?: "circular" | "rectangular";
  direction?: number;
  gridWidth?: number;
  gridDepth?: number;
  gridHeight?: number;
}

export interface IntersectionObj extends SceneBase {
  type: "intersection";
  connectedRoads: string[];
  intersectionType: "T-junction" | "cross" | "Y-junction" | "multi-way";
  radius: number;
}

export type SceneObj =
  | BuildingObj
  | TreeObj
  | WallObj
  | RoadObj
  | WaterObj
  | IntersectionObj;

export type Snapshot = {
  objects: SceneObj[];
  selectedId: string | null;
};

export interface StoreState {
  objects: SceneObj[];
  selectedId: string | null;
  selectedIds: string[];
  gridSize: number;
  snapEnabled: boolean;
  past: Snapshot[];
  future: Snapshot[];
  addObject: (obj: Partial<SceneObj> & { type: ObjType }) => string;
  updateObject: (id: string, patch: Partial<SceneObj>) => void;
  removeObject: (id: string) => void;
  setSelectedId: (id: string | null) => void;
  setSelectedIds: (ids: string[]) => void;
  setGridSize: (s: number) => void;
  toggleSnap: () => void;
  saveSnapshot: () => void;
  undo: () => void;
  redo: () => void;
  overwriteAll: (objects: SceneObj[]) => void;
}

// Additional utility types for better type safety
export type RoadType = "residential" | "highway" | "dirt" | "pedestrian";
export type WaterShape = "circular" | "rectangular";

// Type guards
export function isRoadObj(obj: SceneObj): obj is RoadObj {
  return obj.type === "road";
}

export function isBuildingObj(obj: SceneObj): obj is BuildingObj {
  return obj.type === "building";
}

export function isTreeObj(obj: SceneObj): obj is TreeObj {
  return obj.type === "tree";
}

export function isWallObj(obj: SceneObj): obj is WallObj {
  return obj.type === "wall";
}

export function isWaterObj(obj: SceneObj): obj is WaterObj {
  return obj.type === "water";
}

export function isIntersectionObj(obj: SceneObj): obj is IntersectionObj {
  return obj.type === "intersection";
}
