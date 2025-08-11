import { create } from "zustand";
import { SceneObj, StoreState } from "./storeTypes";
import {
  addObject,
  updateObject,
  removeObject,
  setSelectedId,
  setGridSize,
  toggleSnap,
  saveSnapshot,
  undo,
  redo,
  overwriteAll,
} from "./storeUtils";

const initialObjects: SceneObj[] = [
  {
    id: "initial-building",
    name: "Initial Building",
    type: "building",
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    floors: 2,
    color: "#d9d9d9",
    roofType: "gabled",
    roofColor: "#666666",
    gridWidth: 2,
    gridDepth: 2,
    gridHeight: 1,
  },
];

export const useStore = create<StoreState>((set, get) => ({
  objects: initialObjects,
  selectedId: null,
  gridSize: 1,
  snapEnabled: true,
  past: [],
  future: [],

  addObject: (obj) => addObject(set, get, obj),
  updateObject: (id, patch) => updateObject(set, get, id, patch),
  removeObject: (id) => removeObject(set, get, id),
  setSelectedId: (id) => setSelectedId(set, id),
  setGridSize: (n) => setGridSize(set, n),
  toggleSnap: () => toggleSnap(set),
  saveSnapshot: () => saveSnapshot(set, get),
  undo: () => undo(set, get),
  redo: () => redo(set, get),
  overwriteAll: (objects) => overwriteAll(set, get, objects),
}));

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <>{children}</>;
