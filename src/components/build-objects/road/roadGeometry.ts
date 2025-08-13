// src/components/build-objects/road/roadGeometry.ts - Fixed Final
import * as THREE from "three";
import { RoadPoint } from "@/store/storeTypes";

export interface RoadGeometryResult {
  roadGeometry: THREE.BufferGeometry;
  centerLinePoints: THREE.Vector3[];
  roadPath: THREE.Vector3[];
}

export function createBezierCurve(
  start: THREE.Vector3,
  end: THREE.Vector3,
  control: THREE.Vector3,
  segments = 20
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const point = new THREE.Vector3()
      .copy(start)
      .multiplyScalar((1 - t) * (1 - t))
      .add(control.clone().multiplyScalar(2 * (1 - t) * t))
      .add(end.clone().multiplyScalar(t * t));
    points.push(point);
  }
  return points;
}

export function generateRoadPath(roadPoints: RoadPoint[]): THREE.Vector3[] {
  console.log("🛤️ Generating road path from points:", roadPoints);

  if (roadPoints.length === 0) return [];

  if (roadPoints.length === 1) {
    return [new THREE.Vector3(roadPoints[0].x, 0, roadPoints[0].z)];
  }

  const roadPath: THREE.Vector3[] = [];

  // Always add the first point
  roadPath.push(new THREE.Vector3(roadPoints[0].x, 0, roadPoints[0].z));

  for (let i = 0; i < roadPoints.length - 1; i++) {
    const start = new THREE.Vector3(roadPoints[i].x, 0, roadPoints[i].z);
    const end = new THREE.Vector3(roadPoints[i + 1].x, 0, roadPoints[i + 1].z);

    if (roadPoints[i].controlPoint) {
      // Create curved segment
      const control = new THREE.Vector3(
        roadPoints[i].controlPoint!.x,
        0,
        roadPoints[i].controlPoint!.z
      );
      const curvePoints = createBezierCurve(start, end, control, 10);
      // Add curve points except the first one (to avoid duplication)
      roadPath.push(...curvePoints.slice(1));
    } else {
      // Straight segment - just add the end point
      roadPath.push(end);
    }
  }

  console.log("🛤️ Generated path with", roadPath.length, "points");
  return roadPath;
}

export function generateRoadGeometry(
  roadPoints: RoadPoint[],
  width: number
): RoadGeometryResult {
  const emptyResult: RoadGeometryResult = {
    roadGeometry: new THREE.BufferGeometry(),
    centerLinePoints: [],
    roadPath: [],
  };

  console.log("🏗️ Generating road geometry:", {
    pointCount: roadPoints.length,
    width,
  });

  if (roadPoints.length < 2) {
    console.log("❌ Not enough points for road geometry");
    return emptyResult;
  }

  const roadPath = generateRoadPath(roadPoints);
  if (roadPath.length < 2) {
    console.log("❌ Generated path too short");
    return emptyResult;
  }

  const vertices: number[] = [];
  const indices: number[] = [];
  const halfWidth = width / 2;

  console.log("🔧 Creating road strip with width:", width);

  // Generate road strip vertices
  for (let i = 0; i < roadPath.length; i++) {
    const point = roadPath[i];

    // Calculate direction vector for this point
    let direction: THREE.Vector3;

    if (i === 0) {
      // First point - use direction to next
      direction = roadPath[1].clone().sub(point).normalize();
    } else if (i === roadPath.length - 1) {
      // Last point - use direction from previous
      direction = point
        .clone()
        .sub(roadPath[i - 1])
        .normalize();
    } else {
      // Middle point - average of adjacent directions
      const prevDir = point
        .clone()
        .sub(roadPath[i - 1])
        .normalize();
      const nextDir = roadPath[i + 1].clone().sub(point).normalize();
      direction = prevDir.add(nextDir).normalize();

      // If the direction becomes zero (opposite directions), use perpendicular
      if (direction.length() < 0.1) {
        direction = roadPath[i + 1]
          .clone()
          .sub(roadPath[i - 1])
          .normalize();
      }
    }

    // Calculate perpendicular vector (rotate direction 90 degrees in XZ plane)
    const perpendicular = new THREE.Vector3(
      -direction.z,
      0,
      direction.x
    ).normalize();

    // Create left and right edge points
    const leftPoint = point
      .clone()
      .add(perpendicular.clone().multiplyScalar(halfWidth));
    const rightPoint = point
      .clone()
      .add(perpendicular.clone().multiplyScalar(-halfWidth));

    // Add vertices (left first, then right)
    vertices.push(leftPoint.x, leftPoint.y, leftPoint.z);
    vertices.push(rightPoint.x, rightPoint.y, rightPoint.z);
  }

  // Generate triangle indices for road surface
  for (let i = 0; i < roadPath.length - 1; i++) {
    const baseIndex = i * 2;

    // Create two triangles for each road segment
    // First triangle: bottom-left, top-left, bottom-right
    indices.push(baseIndex, baseIndex + 2, baseIndex + 1);
    // Second triangle: bottom-right, top-left, top-right
    indices.push(baseIndex + 1, baseIndex + 2, baseIndex + 3);
  }

  console.log("📐 Generated geometry:", {
    vertices: vertices.length / 3,
    triangles: indices.length / 3,
    pathPoints: roadPath.length,
  });

  const roadGeometry = new THREE.BufferGeometry();
  roadGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  roadGeometry.setIndex(indices);
  roadGeometry.computeVertexNormals();

  return {
    roadGeometry,
    centerLinePoints: roadPath,
    roadPath,
  };
}

// Simplified preview geometry for drawing mode
export function generatePreviewGeometry(
  roadPoints: RoadPoint[],
  width: number
): RoadGeometryResult {
  if (roadPoints.length === 0) {
    return {
      roadGeometry: new THREE.BufferGeometry(),
      centerLinePoints: [],
      roadPath: [],
    };
  }

  if (roadPoints.length === 1) {
    // Single point - small circle
    const point = roadPoints[0];
    const circleGeometry = new THREE.CircleGeometry(0.3, 8);
    circleGeometry.rotateX(-Math.PI / 2);
    circleGeometry.translate(point.x, 0.01, point.z);

    return {
      roadGeometry: circleGeometry,
      centerLinePoints: [new THREE.Vector3(point.x, 0.01, point.z)],
      roadPath: [new THREE.Vector3(point.x, 0.01, point.z)],
    };
  }

  // For multiple points in preview, use the same logic as final geometry
  return generateRoadGeometry(roadPoints, width);
}
