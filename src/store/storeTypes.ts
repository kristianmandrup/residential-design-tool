export type RoofType = "flat" | "gabled" | "hipped";
export type ObjType = "building" | "tree" | "road" | "wall" | "water";

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
  gridWidth?: number;
  gridDepth?: number;
  gridHeight?: number;
}

export interface WallObj extends SceneBase {
  type: "wall";
  length: number;
  height: number;
  direction?: number;
  gridWidth?: number;
  gridDepth?: number;
  gridHeight?: number;
}

export interface RoadObj extends SceneBase {
  type: "road";
  points: [number, number][];
  width: number;
  color?: string;
  direction?: number;
  gridWidth?: number;
  gridDepth?: number;
  gridHeight?: number;
}

export interface WaterObj extends SceneBase {
  type: "water";
  radius: number;
  shape?: "circular" | "rectangular";
  direction?: number;
  gridWidth?: number;
  gridDepth?: number;
  gridHeight?: number;
}

export type SceneObj = BuildingObj | TreeObj | WallObj | RoadObj | WaterObj;

export type Snapshot = {
  objects: SceneObj[];
  selectedId: string | null;
};

export interface StoreState {
  objects: SceneObj[];
  selectedId: string | null;
  gridSize: number;
  snapEnabled: boolean;
  past: Snapshot[];
  future: Snapshot[];
  addObject: (obj: Partial<SceneObj> & { type: ObjType }) => string;
  updateObject: (id: string, patch: Partial<SceneObj>) => void;
  removeObject: (id: string) => void;
  setSelectedId: (id: string | null) => void;
  setGridSize: (s: number) => void;
  toggleSnap: () => void;
  saveSnapshot: () => void;
  undo: () => void;
  redo: () => void;
  overwriteAll: (objects: SceneObj[]) => void;
}
