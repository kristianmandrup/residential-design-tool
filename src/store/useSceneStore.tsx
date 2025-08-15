/* eslint-disable @typescript-eslint/no-explicit-any */
// File: src/store/useStore.tsx (Enhanced)
"use client";
import React from "react";
import { create } from "zustand";
import { SceneObj, StoreState, RoadObj, Snapshot } from "./storeTypes";
import { ensureCompleteSceneObj, validateRoadObj } from "@/utils/typeMigration";
import { PerformanceManager } from "@/utils/performanceManager";
import { DebugSystem } from "@/utils/debugSystem";

const debugSystem = DebugSystem.getInstance();
const performanceManager = PerformanceManager.getInstance();

const initialObjects: SceneObj[] = [
  {
    id: "demo-building",
    type: "building",
    name: "Demo Building",
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    floors: 2,
    color: "#8B4513",
    roofType: "gabled",
    roofColor: "#654321",
    floorProperties: [
      { windowsEnabled: true, wallColor: "#8B4513", name: "Ground Floor" },
      { windowsEnabled: true, wallColor: "#8B4513", name: "First Floor" },
    ],
    windowColor: "#87CEEB",
    gridWidth: 2,
    gridDepth: 2,
    gridHeight: 2,
  },
];

export const useSceneStore = create<StoreState>((set, get) => ({
  objects: initialObjects,
  selectedId: null,
  selectedIds: [],
  gridSize: 1,
  snapEnabled: true,
  past: [],
  future: [],

  addObject: (obj) => {
    try {
      const completeObj = ensureCompleteSceneObj(obj);

      // Enhanced validation for roads
      if (
        completeObj.type === "road" &&
        !validateRoadObj(completeObj as RoadObj)
      ) {
        debugSystem.log("error", "Invalid road object rejected", completeObj);
        return "";
      }

      debugSystem.log("info", "Adding object to scene", {
        type: completeObj.type,
        id: completeObj.id,
      });

      // Performance optimization - check for instancing opportunities
      const { recommendations } = performanceManager.optimizeSceneObjects([
        ...get().objects,
        completeObj,
      ]);
      if (recommendations.length > 0) {
        debugSystem.log("info", "Performance recommendations", recommendations);
      }

      get().saveSnapshot();
      set((s) => ({
        objects: [...s.objects, completeObj],
        selectedId: completeObj.id,
        future: [],
      }));

      return completeObj.id;
    } catch (error) {
      debugSystem.log("error", "Failed to add object", { error, obj });
      return "";
    }
  },

  updateObject: (id, patch) => {
    try {
      get().saveSnapshot();
      set((s) => ({
        objects: s.objects.map((o) => {
          if (o.id === id) {
            const updated = { ...o, ...patch } as SceneObj;

            // Validate roads after update
            if (
              updated.type === "road" &&
              !validateRoadObj(updated as RoadObj)
            ) {
              debugSystem.log(
                "warn",
                "Road update resulted in invalid road",
                updated
              );
              return o; // Don't apply invalid update
            }

            debugSystem.log("info", "Object updated", {
              id,
              changes: Object.keys(patch),
            });
            return updated;
          }
          return o;
        }),
        future: [],
      }));
    } catch (error) {
      debugSystem.log("error", "Failed to update object", { id, patch, error });
    }
  },

  removeObject: (id) => {
    try {
      const obj = get().objects.find((o) => o.id === id);
      debugSystem.log("info", "Removing object", { id, type: obj?.type });

      get().saveSnapshot();
      set((s) => ({
        objects: s.objects.filter((o) => o.id !== id),
        selectedId: s.selectedId === id ? null : s.selectedId,
        selectedIds: s.selectedIds.filter((selId) => selId !== id),
        future: [],
      }));
    } catch (error) {
      debugSystem.log("error", "Failed to remove object", { id, error });
    }
  },

  setSelectedId: (id) => {
    debugSystem.log("info", "Selection changed", { selectedId: id });
    set(() => ({ selectedId: id, selectedIds: id ? [id] : [] }));
  },

  setSelectedIds: (ids) => {
    debugSystem.log("info", "Multi-selection changed", { count: ids.length });
    set(() => ({
      selectedIds: ids,
      selectedId: ids.length === 1 ? ids[0] : null,
    }));
  },

  setGridSize: (n) => set(() => ({ gridSize: n })),
  toggleSnap: () => set((s) => ({ snapEnabled: !s.snapEnabled })),

  saveSnapshot: () => {
    const { objects, selectedId, past } = get();
    const snapshot: Snapshot = {
      objects: JSON.parse(JSON.stringify(objects)),
      selectedId,
    };

    // Limit undo history
    const newPast = [...past, snapshot];
    if (newPast.length > 50) {
      newPast.shift();
    }

    set(() => ({ past: newPast, future: [] }));
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

    debugSystem.log("info", "Undo performed", {
      objectCount: previous.objects.length,
      undoStepsRemaining: prevPast.length,
    });

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

    debugSystem.log("info", "Redo performed", {
      objectCount: next.objects.length,
      redoStepsRemaining: nextFuture.length,
    });

    set(() => ({
      objects: next.objects,
      selectedId: next.selectedId,
      future: nextFuture,
      past: [...past, current],
    }));
  },

  overwriteAll: (objects) => {
    try {
      const migratedObjects = objects
        .map((obj) => {
          try {
            return ensureCompleteSceneObj(obj as any);
          } catch (error) {
            debugSystem.log("warn", "Failed to migrate object during load", {
              obj,
              error,
            });
            return null;
          }
        })
        .filter((obj): obj is SceneObj => obj !== null);

      debugSystem.log("info", "Scene loaded", {
        loaded: migratedObjects.length,
        total: objects.length,
        skipped: objects.length - migratedObjects.length,
      });

      get().saveSnapshot();
      set(() => ({
        objects: migratedObjects,
        selectedId: null,
        selectedIds: [],
        future: [],
      }));
    } catch (error) {
      debugSystem.log("error", "Failed to load scene", { error });
    }
  },

  // New debugging methods
  analyzeScene: () => {
    return debugSystem.analyzeScene(get().objects);
  },

  getPerformanceStats: () => {
    return performanceManager.getPerformanceStats();
  },

  optimizeScene: () => {
    const { recommendations } = performanceManager.optimizeSceneObjects(
      get().objects
    );
    debugSystem.log("info", "Scene optimization analysis", recommendations);
    return recommendations;
  },
}));

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <>{children}</>;
