import { StoreApi } from "zustand";
import { nanoid } from "nanoid";
import {
  SceneObj,
  StoreState,
  Snapshot,
  ObjType,
  BuildingObj,
  RoadObj,
  TreeObj,
  WallObj,
  WaterObj,
} from "./storeTypes";

type SetState<T> = StoreApi<T>["setState"];
type GetState<T> = StoreApi<T>["getState"];

export const addObject = (
  set: SetState<StoreState>,
  get: GetState<StoreState>,
  obj: Partial<SceneObj> & { type: ObjType }
): string => {
  const id = nanoid();
  const defaultName = `${
    obj.type.charAt(0).toUpperCase() + obj.type.slice(1)
  } ${get().objects.length + 1}`;
  const newObj = {
    id,
    name: obj.name ?? defaultName,
    type: obj.type,
    position: (obj.position ?? [0, 0, 0]) as [number, number, number],
    rotation: (obj.rotation ?? [0, 0, 0]) as [number, number, number],
    scale: (obj.scale ?? [1, 1, 1]) as [number, number, number],
    gridWidth: obj.gridWidth,
    gridDepth: obj.gridDepth,
    gridHeight: obj.gridHeight,
    ...(obj.type === "building"
      ? {
          floors: (obj as Partial<BuildingObj>).floors ?? 1,
          color: (obj as Partial<BuildingObj>).color ?? "#d9d9d9",
          roofType: (obj as Partial<BuildingObj>).roofType ?? "gabled",
          roofColor: (obj as Partial<BuildingObj>).roofColor ?? "#666666",
          floorProperties: Array.from(
            { length: (obj as Partial<BuildingObj>).floors ?? 1 },
            (_, i) => ({
              windowsEnabled: true,
              wallColor: (obj as Partial<BuildingObj>).color ?? "#d9d9d9",
            })
          ),
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
          radius: (obj as Partial<WaterObj>).radius ?? 1,
          gridWidth: (obj as Partial<WaterObj>).gridWidth ?? 1,
          gridDepth: (obj as Partial<WaterObj>).gridDepth ?? 1,
          gridHeight: (obj as Partial<WaterObj>).gridHeight ?? 0.1,
        }
      : {}),
  } as SceneObj;

  get().saveSnapshot();
  set((s) => ({
    objects: [...s.objects, newObj],
    selectedId: id,
    future: [],
  }));
  return id;
};

export const updateObject = (
  set: SetState<StoreState>,
  get: GetState<StoreState>,
  id: string,
  patch: Partial<SceneObj>
) => {
  get().saveSnapshot();
  set((s) => ({
    objects: s.objects.map((o) =>
      o.id === id ? ({ ...o, ...patch } as SceneObj) : o
    ),
    future: [],
  }));
};

export const removeObject = (
  set: SetState<StoreState>,
  get: GetState<StoreState>,
  id: string
) => {
  get().saveSnapshot();
  set((s) => ({
    objects: s.objects.filter((o) => o.id !== id),
    selectedId: s.selectedId === id ? null : s.selectedId,
    future: [],
  }));
};

export const setSelectedId = (set: SetState<StoreState>, id: string | null) => {
  set(() => ({ selectedId: id }));
};

export const setGridSize = (set: SetState<StoreState>, n: number) => {
  set(() => ({ gridSize: n }));
};

export const toggleSnap = (set: SetState<StoreState>) => {
  set((s) => ({ snapEnabled: !s.snapEnabled }));
};

export const saveSnapshot = (
  set: SetState<StoreState>,
  get: GetState<StoreState>
) => {
  const { objects, selectedId, past } = get();
  const snapshot: Snapshot = {
    objects: JSON.parse(JSON.stringify(objects)),
    selectedId,
  };
  set(() => ({ past: [...past, snapshot], future: [] }));
};

export const undo = (set: SetState<StoreState>, get: GetState<StoreState>) => {
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
};

export const redo = (set: SetState<StoreState>, get: GetState<StoreState>) => {
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
};

export const overwriteAll = (
  set: SetState<StoreState>,
  get: GetState<StoreState>,
  objects: SceneObj[]
) => {
  get().saveSnapshot();
  set(() => ({ objects, selectedId: null, future: [] }));
};
