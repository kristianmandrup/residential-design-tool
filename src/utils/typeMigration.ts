/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  SceneObj,
  RoadObj,
  BuildingObj,
  TreeObj,
  WallObj,
  WaterObj,
} from "@/store/storeTypes";
import { nanoid } from "nanoid";

/**
 * Ensures a road object has all required properties with sensible defaults
 */
export function ensureCompleteRoadObj(
  partialRoad: Partial<RoadObj> & { type: "road" }
): RoadObj {
  const roadDefaults = {
    residential: {
      width: 6,
      color: "#404040",
      elevation: 0.02,
      thickness: 0.08,
    },
    highway: { width: 8, color: "#383838", elevation: 0.03, thickness: 0.1 },
    dirt: { width: 4, color: "#8B4513", elevation: 0.01, thickness: 0.05 },
    pedestrian: {
      width: 2,
      color: "#606060",
      elevation: 0.015,
      thickness: 0.04,
    },
  };

  const roadType = partialRoad.roadType || "residential";
  const defaults = roadDefaults[roadType];

  return {
    id: partialRoad.id || nanoid(),
    name: partialRoad.name || `Road ${Date.now().toString().slice(-4)}`,
    type: "road",
    position: partialRoad.position || [0, 0, 0],
    rotation: partialRoad.rotation || [0, 0, 0],
    scale: partialRoad.scale || [1, 1, 1],
    points: partialRoad.points || [],
    width: partialRoad.width || defaults.width,
    roadType,
    color: partialRoad.color || defaults.color,
    elevation: partialRoad.elevation ?? defaults.elevation,
    thickness: partialRoad.thickness ?? defaults.thickness,
    gridWidth:
      partialRoad.gridWidth || Math.max(4, partialRoad.width || defaults.width),
    gridDepth:
      partialRoad.gridDepth || Math.max(4, partialRoad.width || defaults.width),
    gridHeight: partialRoad.gridHeight || defaults.thickness,
  };
}

/**
 * Ensures any scene object has all required properties
 */
export function ensureCompleteSceneObj(
  partialObj: Partial<SceneObj> & { type: SceneObj["type"] }
): SceneObj {
  const baseObj = {
    id: partialObj.id || nanoid(),
    name:
      partialObj.name ||
      `${
        partialObj.type.charAt(0).toUpperCase() + partialObj.type.slice(1)
      } Object`,
    position: partialObj.position || ([0, 0, 0] as [number, number, number]),
    rotation: partialObj.rotation || ([0, 0, 0] as [number, number, number]),
    scale: partialObj.scale || ([1, 1, 1] as [number, number, number]),
  };

  switch (partialObj.type) {
    case "road":
      return ensureCompleteRoadObj({ ...baseObj, ...partialObj, type: "road" });

    case "building":
      return {
        ...baseObj,
        ...partialObj,
        type: "building",
        floors: partialObj.floors || 1,
        elevation: partialObj.elevation ?? 0,
        color: partialObj.color || "#d9d9d9",
        roofType: partialObj.roofType || "gabled",
        roofColor: partialObj.roofColor || "#666666",
        floorProperties: partialObj.floorProperties || [
          { windowsEnabled: true, wallColor: partialObj.color || "#d9d9d9" },
        ],
        gridWidth: partialObj.gridWidth || 2,
        gridDepth: partialObj.gridDepth || 2,
        gridHeight: partialObj.gridHeight || 1,
      } as BuildingObj;

    case "tree":
      return {
        ...baseObj,
        ...partialObj,
        type: "tree",
        elevation: partialObj.elevation ?? 0,
        foliageColor: partialObj.foliageColor || "#2E8B57",
        treeType: partialObj.treeType || "oak",
        gridWidth: partialObj.gridWidth || 1,
        gridDepth: partialObj.gridDepth || 1,
        gridHeight: partialObj.gridHeight || 3,
      } as TreeObj;

    case "wall":
      return {
        ...baseObj,
        ...partialObj,
        type: "wall",
        length: partialObj.length || 3,
        height: partialObj.height || 2,
        thickness: partialObj.thickness || 0.2,
        elevation: partialObj.elevation ?? 0,
        color: partialObj.color || "#CCCCCC",
        gridWidth: partialObj.gridWidth || 3,
        gridDepth: partialObj.gridDepth || 0.2,
        gridHeight: partialObj.gridHeight || 2,
      } as WallObj;

    case "water":
      return {
        ...baseObj,
        ...partialObj,
        type: "water",
        radius: partialObj.radius || 2,
        width: partialObj.width || 4,
        depth: partialObj.depth || 4,
        waveHeight: partialObj.waveHeight || 0.1,
        transparency: partialObj.transparency || 0.7,
        shape: partialObj.shape || "circular",
        elevation: partialObj.elevation ?? 0,
        gridWidth: partialObj.gridWidth || 4,
        gridDepth: partialObj.gridDepth || 4,
        gridHeight: partialObj.gridHeight || 0.2,
      } as WaterObj;

    default:
      throw new Error(`Unknown object type: ${(partialObj as any).type}`);
  }
}

/**
 * Validates that a road object has valid points
 */
export function validateRoadObj(road: RoadObj): boolean {
  if (!road.points || road.points.length < 2) {
    console.warn("Road validation failed: insufficient points", road);
    return false;
  }

  const hasValidPoints = road.points.every(
    (point) =>
      typeof point.x === "number" &&
      typeof point.z === "number" &&
      !isNaN(point.x) &&
      !isNaN(point.z) &&
      isFinite(point.x) &&
      isFinite(point.z)
  );

  if (!hasValidPoints) {
    console.warn("Road validation failed: invalid point coordinates", road);
    return false;
  }

  if (!road.width || road.width <= 0) {
    console.warn("Road validation failed: invalid width", road);
    return false;
  }

  return true;
}

/**
 * Migrates old object format to new unified format
 */
export function migrateObjectToUnified(oldObj: any): SceneObj | null {
  try {
    // If it's already in the correct format, just ensure completeness
    if (oldObj.type && typeof oldObj.type === "string") {
      return ensureCompleteSceneObj(oldObj);
    }

    console.warn("Unable to migrate object - unknown format:", oldObj);
    return null;
  } catch (error) {
    console.error("Error migrating object:", error, oldObj);
    return null;
  }
}

/**
 * Batch migrate an array of objects
 */
export function migrateObjectsToUnified(oldObjects: any[]): SceneObj[] {
  return oldObjects
    .map(migrateObjectToUnified)
    .filter((obj): obj is SceneObj => obj !== null);
}
