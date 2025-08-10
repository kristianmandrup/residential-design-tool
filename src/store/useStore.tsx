"use client";
import React from "react";
import { create } from "zustand";
import { nanoid } from "nanoid";

export type RoofType = "flat" | "gabled" | "hipped";
export type ObjType = "building" | "tree" | "road" | "wall" | "water";

export interface SceneBase {
  id: string;
  type: ObjType;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  // Grid-based properties
  gridWidth?: number; // Width in grid units
  gridDepth?: number; // Depth in grid units
  gridHeight?: number; // Height in grid units (for buildings/trees)
}

export interface BuildingObj extends SceneBase {
  type: "building";
  floors: number;
  color: string;
  roofType: RoofType;
  roofColor: string;
  windowColor?: string;
  // Grid defaults
  gridWidth?: number; // Default: 2 (2x2 grid)
  gridDepth?: number; // Default: 2 (2x2 grid)
  gridHeight?: number; // Default: 1 (height in grid units)
}

export interface TreeObj extends SceneBase {
  type: "tree";
  foliageColor?: string;
  // Grid defaults
  gridWidth?: number; // Default: 1 (1x1 grid)
  gridDepth?: number; // Default: 1 (1x1 grid)
  gridHeight?: number; // Default: 1 (height in grid units)
}

export interface WallObj extends SceneBase {
  type: "wall";
  length: number;
  height: number;
  direction?: number; // Direction for wall placement
  // Grid defaults
  gridWidth?: number; // Default: 2 (2x1 grid)
  gridDepth?: number; // Default: 1 (2x1 grid)
  gridHeight?: number; // Default: 1 (height in grid units)
}

export interface RoadObj extends SceneBase {
  type: "road";
  points: [number, number][]; // x,z points for a path (multi-segment)
  width: number;
  color?: string; // Optional road color
  direction?: number; // Direction for road placement
  // Grid defaults
  gridWidth?: number; // Default: 1 (road width in grid units)
  gridDepth?: number; // Default: 1 (road depth in grid units)
  gridHeight?: number; // Default: 0.1 (road thickness in grid units)
}

export interface WaterObj extends SceneBase {
  type: "water";
  radius: number;
  shape?: "circular" | "rectangular";
  direction?: number; // for rectangular water
  // Grid defaults
  gridWidth?: number; // Default: 2 (water width in grid units)
  gridDepth?: number; // Default: 2 (water depth in grid units)
  gridHeight?: number; // Default: 0.1 (water thickness in grid units)
}

export type SceneObj = BuildingObj | TreeObj | WallObj | RoadObj | WaterObj;

type Snapshot = {
  objects: SceneObj[];
  selectedId: string | null;
};

export interface StoreState {
  objects: SceneObj[];
  selectedId: string | null;
  gridSize: number;
  snapEnabled: boolean;

  // undo/redo
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

const initialObjects: SceneObj[] = [
  {
    id: "initial-building",
    type: "building",
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    floors: 2,
    color: "#d9d9d9",
    roofType: "gabled",
    roofColor: "#666666",
  },
]; // start with one building in center

export const useStore = create<StoreState>((set, get) => ({
  objects: initialObjects,
  selectedId: null,
  gridSize: 1,
  snapEnabled: true,
  past: [],
  future: [],

  addObject: (obj) => {
    const id = nanoid();
    const newObj = {
      id,
      type: obj.type,
      position: (obj.position ?? [0, 0, 0]) as [number, number, number],
      rotation: (obj.rotation ?? [0, 0, 0]) as [number, number, number],
      scale: (obj.scale ?? [1, 1, 1]) as [number, number, number],
      // Grid-based defaults
      gridWidth: obj.gridWidth,
      gridDepth: obj.gridDepth,
      gridHeight: obj.gridHeight,
      // type-specific defaults
      ...(obj.type === "building"
        ? {
            floors: (obj as Partial<BuildingObj>).floors ?? 1,
            color: (obj as Partial<BuildingObj>).color ?? "#d9d9d9",
            roofType: (obj as Partial<BuildingObj>).roofType ?? "gabled",
            roofColor: (obj as Partial<BuildingObj>).roofColor ?? "#666666",
            gridWidth: (obj as Partial<BuildingObj>).gridWidth ?? 2,
            gridDepth: (obj as Partial<BuildingObj>).gridDepth ?? 2,
            gridHeight: (obj as Partial<BuildingObj>).gridHeight ?? 1,
          }
        : {}),
      ...(obj.type === "tree"
        ? {
            foliageColor: (obj as Partial<TreeObj>).foliageColor ?? "#2E8B57",
            gridWidth: (obj as Partial<TreeObj>).gridWidth ?? 1,
            gridDepth: (obj as Partial<TreeObj>).gridDepth ?? 1,
            gridHeight: (obj as Partial<TreeObj>).gridHeight ?? 1,
          }
        : {}),
      ...(obj.type === "wall"
        ? {
            length: (obj as Partial<WallObj>).length ?? 3,
            height: (obj as Partial<WallObj>).height ?? 1,
            gridWidth: (obj as Partial<WallObj>).gridWidth ?? 2,
            gridDepth: (obj as Partial<WallObj>).gridDepth ?? 1,
            gridHeight: (obj as Partial<WallObj>).gridHeight ?? 1,
          }
        : {}),
      ...(obj.type === "road"
        ? {
            points: (obj as Partial<RoadObj>).points ?? [],
            width: (obj as Partial<RoadObj>).width ?? 1,
            gridWidth: (obj as Partial<RoadObj>).gridWidth ?? 1,
            gridDepth: (obj as Partial<RoadObj>).gridDepth ?? 1,
            gridHeight: (obj as Partial<RoadObj>).gridHeight ?? 0.1,
          }
        : {}),
      ...(obj.type === "water"
        ? {
            radius: (obj as Partial<WaterObj>).radius ?? 2,
            gridWidth: (obj as Partial<WaterObj>).gridWidth ?? 2,
            gridDepth: (obj as Partial<WaterObj>).gridDepth ?? 2,
            gridHeight: (obj as Partial<WaterObj>).gridHeight ?? 0.1,
          }
        : {}),
    } as SceneObj;

    // snapshot for undo
    get().saveSnapshot();
    set((s) => ({
      objects: [...s.objects, newObj],
      selectedId: id,
      future: [],
    }));
    return id;
  },

  updateObject: (id, patch) => {
    get().saveSnapshot();
    set((s) => ({
      objects: s.objects.map((o) =>
        o.id === id ? ({ ...o, ...patch } as SceneObj) : o
      ),
      future: [],
    }));
  },

  removeObject: (id) => {
    get().saveSnapshot();
    set((s) => ({
      objects: s.objects.filter((o) => o.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId,
      future: [],
    }));
  },

  setSelectedId: (id) => set(() => ({ selectedId: id })),

  setGridSize: (n) => set(() => ({ gridSize: n })),

  toggleSnap: () => set((s) => ({ snapEnabled: !s.snapEnabled })),

  saveSnapshot: () => {
    const { objects, selectedId, past } = get();
    const snapshot: Snapshot = {
      objects: JSON.parse(JSON.stringify(objects)),
      selectedId,
    };
    set(() => ({ past: [...past, snapshot], future: [] }));
  },

  undo: () => {
    const { past, future } = get();
    if (!past.length) return;
    const previous = past[past.length - 1];
    const prevPast = past.slice(0, -1);
    const current: Snapshot = {
      objects: JSON.parse(JSON.stringify(get().objects)),
      selectedId: get().selectedId,
    };
    set(() => ({
      objects: previous.objects,
      selectedId: previous.selectedId,
      past: prevPast,
      future: [...future, current],
    }));
  },

  redo: () => {
    const { future, past } = get();
    if (!future.length) return;
    const next = future[future.length - 1];
    const nextFuture = future.slice(0, -1);
    const current: Snapshot = {
      objects: JSON.parse(JSON.stringify(get().objects)),
      selectedId: get().selectedId,
    };
    set(() => ({
      objects: next.objects,
      selectedId: next.selectedId,
      future: nextFuture,
      past: [...past, current],
    }));
  },

  overwriteAll: (objects) => {
    get().saveSnapshot();
    set(() => ({ objects, selectedId: null, future: [] }));
  },
}));

// optional provider wrapper (not necessary but keeps API consistent)
export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <>{children}</>;
