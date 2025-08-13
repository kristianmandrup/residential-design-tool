// src/components/bars/side/components/object/roadUtils.ts
import { RoadPoint } from "@/store/storeTypes";

export interface RoadTypeConfig {
  defaultWidth: number;
  color: string;
  description: string;
  emoji: string;
}

export const ROAD_TYPE_CONFIGS: Record<string, RoadTypeConfig> = {
  residential: {
    defaultWidth: 6,
    color: "#404040",
    description: "Standard suburban roads",
    emoji: "🏘️",
  },
  highway: {
    defaultWidth: 8,
    color: "#383838",
    description: "High-speed arterials",
    emoji: "🛣️",
  },
  dirt: {
    defaultWidth: 4,
    color: "#8B4513",
    description: "Unpaved rural roads",
    emoji: "🌾",
  },
  pedestrian: {
    defaultWidth: 2,
    color: "#606060",
    description: "Walking paths",
    emoji: "🚶",
  },
};

export const ROAD_TYPE_OPTIONS = [
  { value: "residential", label: "Residential Street" },
  { value: "highway", label: "Highway" },
  { value: "dirt", label: "Dirt Road" },
  { value: "pedestrian", label: "Pedestrian Path" },
];

/**
 * Calculate the total length of a road
 */
export function calculateRoadLength(points: RoadPoint[]): string {
  let totalLength = 0;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    if (p1.controlPoint) {
      // Approximate bezier curve length using multiple segments
      totalLength += approximateBezierLength(p1, p2, p1.controlPoint);
    } else {
      // Straight line distance
      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      totalLength += Math.sqrt(dx * dx + dz * dz);
    }
  }

  return totalLength.toFixed(1);
}

/**
 * Approximate the length of a bezier curve
 */
function approximateBezierLength(
  start: RoadPoint,
  end: RoadPoint,
  control: { x: number; z: number },
  segments: number = 10
): number {
  let length = 0;
  let prevPoint = start;

  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const point = getBezierPoint(start, end, control, t);

    const dx = point.x - prevPoint.x;
    const dz = point.z - prevPoint.z;
    length += Math.sqrt(dx * dx + dz * dz);

    prevPoint = point;
  }

  return length;
}

/**
 * Get a point on a quadratic bezier curve
 */
function getBezierPoint(
  start: RoadPoint,
  end: RoadPoint,
  control: { x: number; z: number },
  t: number
): RoadPoint {
  const x =
    (1 - t) * (1 - t) * start.x + 2 * (1 - t) * t * control.x + t * t * end.x;
  const z =
    (1 - t) * (1 - t) * start.z + 2 * (1 - t) * t * control.z + t * t * end.z;
  return { x, z };
}

/**
 * Create a control point for a curve between two points
 */
export function createControlPoint(
  point1: RoadPoint,
  point2: RoadPoint,
  offset: number = 2
): { x: number; z: number } {
  const midX = (point1.x + point2.x) / 2;
  const midZ = (point1.z + point2.z) / 2;

  // Calculate perpendicular offset
  const dx = point2.x - point1.x;
  const dz = point2.z - point1.z;
  const length = Math.sqrt(dx * dx + dz * dz);

  if (length === 0) {
    return { x: midX, z: midZ + offset };
  }

  // Perpendicular vector
  const perpX = -dz / length;
  const perpZ = dx / length;

  return {
    x: midX + perpX * offset,
    z: midZ + perpZ * offset,
  };
}

/**
 * Insert a point between two existing points
 */
export function createMidPoint(
  point1: RoadPoint,
  point2: RoadPoint
): RoadPoint {
  return {
    x: (point1.x + point2.x) / 2,
    z: (point1.z + point2.z) / 2,
  };
}

/**
 * Validate road points array
 */
export function validateRoadPoints(points: RoadPoint[]): boolean {
  if (!Array.isArray(points) || points.length < 2) {
    return false;
  }

  return points.every(
    (point) =>
      typeof point.x === "number" &&
      typeof point.z === "number" &&
      !isNaN(point.x) &&
      !isNaN(point.z)
  );
}

/**
 * Get road statistics
 */
export function getRoadStatistics(
  points: RoadPoint[],
  roadType: string,
  width: number
) {
  const config = ROAD_TYPE_CONFIGS[roadType] || ROAD_TYPE_CONFIGS.residential;

  return {
    pointCount: points.length,
    segmentCount: Math.max(0, points.length - 1),
    curveCount: points.filter((p) => p.controlPoint).length,
    totalLength: calculateRoadLength(points),
    roadType: roadType,
    width: width || config.defaultWidth,
    area: (
      parseFloat(calculateRoadLength(points)) * (width || config.defaultWidth)
    ).toFixed(1),
  };
}

/**
 * Reverse road direction
 */
export function reverseRoadDirection(points: RoadPoint[]): RoadPoint[] {
  const reversed = [...points].reverse();

  // Move control points to the previous segment
  return reversed.map((point, index) => {
    const nextIndex = index + 1;
    if (nextIndex < reversed.length) {
      // If the next point (which was the previous point) had a control point,
      // move it to this point
      const originalPrevPoint = points[points.length - 1 - nextIndex];
      if (originalPrevPoint?.controlPoint) {
        return {
          ...point,
          controlPoint: originalPrevPoint.controlPoint,
        };
      }
    }
    // Remove control point if it was the last point
    return {
      x: point.x,
      z: point.z,
    };
  });
}

/**
 * Clean up road points by removing duplicates and invalid points
 */
export function cleanupRoadPoints(
  points: RoadPoint[],
  tolerance: number = 0.1
): RoadPoint[] {
  if (points.length <= 1) return points;

  const cleaned: RoadPoint[] = [points[0]]; // Always keep first point

  for (let i = 1; i < points.length; i++) {
    const currentPoint = points[i];
    const lastPoint = cleaned[cleaned.length - 1];

    // Calculate distance to last point
    const dx = currentPoint.x - lastPoint.x;
    const dz = currentPoint.z - lastPoint.z;
    const distance = Math.sqrt(dx * dx + dz * dz);

    // Only add point if it's far enough from the last one
    if (distance > tolerance) {
      cleaned.push(currentPoint);
    }
  }

  return cleaned;
}
