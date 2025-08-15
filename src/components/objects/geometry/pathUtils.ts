// src/components/objects/geometry/pathUtils.ts
import * as THREE from "three";
import { RoadPoint } from "@/store/storeTypes";
import { GeometryConfig } from "./types";
import { createBezierCurve } from "./bezierUtils";

/**
 * Generate path from points with Bezier curve support
 */
export function generateGenericPath(
  points: RoadPoint[],
  elevation: number = 0,
  config: GeometryConfig
): THREE.Vector3[] {
  if (points.length === 0) return [];
  if (points.length === 1) {
    return [new THREE.Vector3(points[0].x, elevation, points[0].z)];
  }

  const path: THREE.Vector3[] = [];
  path.push(new THREE.Vector3(points[0].x, elevation, points[0].z));

  for (let i = 0; i < points.length - 1; i++) {
    const start = new THREE.Vector3(points[i].x, elevation, points[i].z);
    const end = new THREE.Vector3(points[i + 1].x, elevation, points[i + 1].z);

    if (points[i].controlPoint) {
      const control = new THREE.Vector3(
        points[i].controlPoint!.x,
        elevation,
        points[i].controlPoint!.z
      );
      const curvePoints = createBezierCurve(
        start,
        end,
        control,
        config.segments || 10
      );
      path.push(...curvePoints.slice(1));
    } else {
      path.push(end);
    }
  }

  // Close shape if requested and it's a water/pond
  if (config.closedShape && config.type === "water" && points.length > 2) {
    const first = path[0];
    const last = path[path.length - 1];
    const distance = first.distanceTo(last);

    if (distance > 0.1) {
      if (points[points.length - 1].controlPoint) {
        const control = new THREE.Vector3(
          points[points.length - 1].controlPoint!.x,
          elevation,
          points[points.length - 1].controlPoint!.z
        );
        const closingCurve = createBezierCurve(
          last,
          first,
          control,
          config.segments || 10
        );
        path.push(...closingCurve.slice(1, -1)); // Exclude first and last to avoid duplication
      } else {
        path.push(first);
      }
    }
  }

  return path;
}
