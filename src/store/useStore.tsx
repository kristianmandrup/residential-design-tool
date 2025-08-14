/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/useStore.tsx - Updated with migration utilities
"use client";
import React from "react";
import { create } from "zustand";
import { SceneObj, StoreState, RoadObj, Snapshot } from "./storeTypes";
import { ensureCompleteSceneObj, validateRoadObj } from "@/utils/typeMigration";

const initialObjects: SceneObj[] = [
  {
    id: "initial-building",
    type: "building",
    name: "Initial Building",
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    floors: 2,
    color: "#d9d9d9",
    roofType: "gabled",
    roofColor: "#666666",
    floorProperties: [
      { windowsEnabled: true, wallColor: "#d9d9d9", name: "Ground Floor" },
      { windowsEnabled: true, wallColor: "#d9d9d9", name: "First Floor" },
    ],
    gridWidth: 2,
    gridDepth: 2,
    gridHeight: 2,
  },
];

export const useStore = create<StoreState>((set, get) => ({
  objects: initialObjects,
  selectedId: null,
  selectedIds: [],
  gridSize: 1,
  snapEnabled: true,
  past: [],
  future: [],

  addObject: (obj) => {
    try {
      // 🔥 USE MIGRATION UTILITY HERE - ensures complete object
      const completeObj = ensureCompleteSceneObj(obj);

      // Additional validation for roads
      if (
        completeObj.type === "road" &&
        !validateRoadObj(completeObj as RoadObj)
      ) {
        console.error("❌ Invalid road object, not adding:", completeObj);
        return "";
      }

      console.log("✅ Adding complete object:", completeObj);

      // snapshot for undo
      get().saveSnapshot();
      set((s) => ({
        objects: [...s.objects, completeObj],
        selectedId: completeObj.id,
        future: [],
      }));

      return completeObj.id;
    } catch (error) {
      console.error("❌ Failed to add object:", error, obj);
      return "";
    }
  },

  updateObject: (id, patch) => {
    get().saveSnapshot();
    set((s) => ({
      objects: s.objects.map((o) => {
        if (o.id === id) {
          const updated = { ...o, ...patch } as SceneObj;

          // Validate roads after update
          if (updated.type === "road" && !validateRoadObj(updated as RoadObj)) {
            console.warn("⚠️ Road update resulted in invalid road:", updated);
            return o; // Don't apply invalid update
          }

          return updated;
        }
        return o;
      }),
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
  setSelectedIds: (ids) => set(() => ({ selectedIds: ids })),

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
    // 🔥 USE MIGRATION UTILITY HERE - when loading saved data
    try {
      const migratedObjects = objects
        .map((obj) => {
          try {
            return ensureCompleteSceneObj(obj as any);
          } catch (error) {
            console.warn("Failed to migrate object, skipping:", error, obj);
            return null;
          }
        })
        .filter((obj): obj is SceneObj => obj !== null);

      console.log(
        `📁 Loaded ${migratedObjects.length}/${objects.length} objects`
      );

      get().saveSnapshot();
      set(() => ({ objects: migratedObjects, selectedId: null, future: [] }));
    } catch (error) {
      console.error("❌ Failed to load objects:", error);
    }
  },
}));

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <>{children}</>;
