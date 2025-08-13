import { RoadObj, RoadPoint } from "./storeTypes";

// Road drawing context
export interface RoadDrawingContext {
  isDrawingRoad: boolean;
  tempRoadPoints: RoadPoint[];
  selectedRoadType: "residential" | "highway" | "dirt" | "pedestrian";
  roadWidth: number;
  snapToGrid: boolean;
  showIntersectionPreview: boolean;
}

// Store actions for road system
export interface RoadStoreActions {
  startRoadDrawing: (roadType: string) => void;
  addRoadPoint: (point: RoadPoint) => void;
  finishRoadDrawing: () => void;
  cancelRoadDrawing: () => void;
  updateRoadPoint: (
    roadId: string,
    pointIndex: number,
    updates: Partial<RoadPoint>
  ) => void;
  addCurveToRoadSegment: (roadId: string, segmentIndex: number) => void;
  generateIntersections: (roadIds?: string[]) => void;
  optimizeRoadConnections: (roadIds?: string[]) => void;
}

// Utility functions for road conversion
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertLegacyRoadToNew(legacyRoad: any): RoadObj {
  // Convert old road format to new format
  const points: RoadPoint[] = [];

  if (legacyRoad.points && Array.isArray(legacyRoad.points)) {
    // Handle legacy points format [x, z][] or RoadPoint[]
    points.push(
      ...legacyRoad.points.map((point: [number, number] | RoadPoint) => {
        if (Array.isArray(point)) {
          return { x: point[0], z: point[1] };
        }
        return point;
      })
    );
  } else {
    // Create default points based on position and direction
    const direction = ((legacyRoad.direction || 0) * Math.PI) / 180;
    const length = Math.max(
      legacyRoad.gridWidth || 4,
      legacyRoad.gridDepth || 4
    );
    const halfLength = length / 2;

    points.push(
      {
        x: -halfLength * Math.cos(direction),
        z: -halfLength * Math.sin(direction),
      },
      {
        x: halfLength * Math.cos(direction),
        z: halfLength * Math.sin(direction),
      }
    );
  }

  return {
    ...legacyRoad,
    type: "road" as const,
    points,
    width: legacyRoad.width || 6,
    roadType: legacyRoad.roadType || "residential",
    color: legacyRoad.color || "#404040",
  };
}

export function validateRoadData(road: RoadObj): boolean {
  // Validate road data
  if (!road.points || road.points.length < 2) return false;
  if (!road.width || road.width < 0.5) return false;
  if (!["residential", "highway", "dirt", "pedestrian"].includes(road.roadType))
    return false;

  // Validate points
  return road.points.every(
    (point) =>
      typeof point.x === "number" &&
      typeof point.z === "number" &&
      !isNaN(point.x) &&
      !isNaN(point.z)
  );
}

// Road configuration presets
export const ROAD_TYPE_CONFIGS = {
  residential: {
    width: 6,
    color: "#404040",
    elevation: 0.02, // Slightly above ground
    thickness: 0.08, // Road thickness
    maxSpeed: 50,
    lanes: 2,
    markings: {
      centerLine: true,
      centerLineDashed: true,
      sideLines: true,
      crosswalks: true,
    },
  },
  highway: {
    width: 8,
    color: "#383838",
    elevation: 0.03, // Slightly higher for highways
    thickness: 0.1,
    maxSpeed: 120,
    lanes: 4,
    markings: {
      centerLine: true,
      centerLineDashed: true,
      sideLines: true,
      crosswalks: false,
    },
  },
  dirt: {
    width: 4,
    color: "#8B4513",
    elevation: 0.01, // Minimal elevation for dirt roads
    thickness: 0.05,
    maxSpeed: 30,
    lanes: 1,
    markings: {
      centerLine: false,
      centerLineDashed: false,
      sideLines: false,
      crosswalks: false,
    },
  },
  pedestrian: {
    width: 2,
    color: "#606060",
    elevation: 0.015, // Slight elevation for walkways
    thickness: 0.04,
    maxSpeed: 5,
    lanes: 0,
    markings: {
      centerLine: false,
      centerLineDashed: false,
      sideLines: true,
      crosswalks: true,
    },
  },
};

// Road tools and utilities
export class RoadUtils {
  static calculateRoadLength(points: RoadPoint[]): number {
    let totalLength = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];

      if (p1.controlPoint) {
        // Approximate bezier curve length
        const segments = 10;
        let curveLength = 0;
        for (let t = 0; t < 1; t += 1 / segments) {
          const t1 = t;
          const t2 = t + 1 / segments;
          const pt1 = RoadUtils.getBezierPoint(p1, p2, p1.controlPoint, t1);
          const pt2 = RoadUtils.getBezierPoint(p1, p2, p1.controlPoint, t2);
          const dx = pt2.x - pt1.x;
          const dz = pt2.z - pt1.z;
          curveLength += Math.sqrt(dx * dx + dz * dz);
        }
        totalLength += curveLength;
      } else {
        // Straight line distance
        const dx = p2.x - p1.x;
        const dz = p2.z - p1.z;
        totalLength += Math.sqrt(dx * dx + dz * dz);
      }
    }
    return totalLength;
  }

  static getBezierPoint(
    p1: RoadPoint,
    p2: RoadPoint,
    p3: RoadPoint,
    t: number
  ): RoadPoint {
    const x = p1.x * (1 - t) * (1 - t) + p2.x * 2 * (1 - t) * t + p3.x * t * t;
    const z = p1.z * (1 - t) * (1 - t) + p2.z * 2 * (1 - t) * t + p3.z * t * t;
    return { x, z };
  }
}

