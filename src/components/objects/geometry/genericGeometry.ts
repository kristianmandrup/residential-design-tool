// src/components/objects/geometry/genericGeometry.ts
import * as THREE from "three";
import { RoadPoint } from "@/store/storeTypes";
import { GenericGeometryResult, GeometryConfig } from "./types";
import { generateGenericPath } from "./pathUtils";
import { calculateBounds } from "./boundsUtils";
import { generateRoadGeometry } from "./roadGeometry";
import { generateWaterGeometry } from "./waterGeometry";
import { generateWallGeometry } from "./wallGeometry";

/**
 * Generate generic geometry based on type and configuration
 */
export function generateGenericGeometry(
  points: RoadPoint[],
  config: GeometryConfig
): GenericGeometryResult {
  // Validate inputs
  if (
    !points ||
    points.length < (config.type === "water" && config.closedShape ? 2 : 1)
  ) {
    return {
      mainGeometry: new THREE.BufferGeometry(),
      centerLinePoints: [],
      pathPoints: [],
    };
  }

  const elevation = config.elevation || 0;
  const path = generateGenericPath(points, elevation, config);

  if (path.length === 0) {
    return {
      mainGeometry: new THREE.BufferGeometry(),
      centerLinePoints: [],
      pathPoints: [],
    };
  }

  let geometry: THREE.BufferGeometry;
  const centerLinePoints = [...path];
  const bounds = calculateBounds(path);

  switch (config.type) {
    case "road":
      geometry = generateRoadGeometry(path, config, elevation);
      break;
    case "water":
      geometry = generateWaterGeometry(path, config, elevation);
      break;
    case "wall":
      geometry = generateWallGeometry(path, config, elevation);
      break;
    default:
      geometry = new THREE.BufferGeometry();
  }

  return {
    mainGeometry: geometry,
    centerLinePoints,
    pathPoints: path,
    bounds,
  };
}

// Re-export utility functions for backward compatibility
export { createBezierCurve } from "./bezierUtils";
export { generateGenericPath } from "./pathUtils";
export { calculateBounds } from "./boundsUtils";
export { generateRoadGeometry } from "./roadGeometry";
export { generateWaterGeometry } from "./waterGeometry";
export { generateWallGeometry } from "./wallGeometry";
export { generatePreviewGeometry } from "./previewGeometry";
