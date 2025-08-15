// src/components/objects/geometry/waterGeometry.ts
import * as THREE from "three";
import { GeometryConfig } from "./types";

/**
 * Generate water geometry (flat surface with optional depth)
 */
export function generateWaterGeometry(
  path: THREE.Vector3[],
  config: GeometryConfig,
  elevation: number
): THREE.BufferGeometry {
  const width = config.width || 2;
  const height = config.height || 2;
  const radius = config.radius || Math.max(width, height) / 2;
  const segments = config.segments || 32;

  // For single point, create circle
  if (path.length === 1) {
    const geometry = new THREE.CircleGeometry(radius, segments);
    geometry.rotateX(-Math.PI / 2);
    geometry.translate(path[0].x, elevation, path[0].z);
    return geometry;
  }

  // For closed shapes, create a filled shape
  if (config.closedShape && path.length > 2) {
    const shape = new THREE.Shape();
    const firstPoint = path[0];
    shape.moveTo(firstPoint.x - path[0].x, firstPoint.z - path[0].z);

    for (let i = 1; i < path.length; i++) {
      const point = path[i];
      shape.lineTo(point.x - path[0].x, point.z - path[0].z);
    }

    shape.lineTo(firstPoint.x - path[0].x, firstPoint.z - path[0].z);

    const geometry = new THREE.ShapeGeometry(shape);
    geometry.rotateX(-Math.PI / 2);
    geometry.translate(path[0].x, elevation, path[0].z);
    return geometry;
  }

  // For open paths, create a ribbon-like water surface
  const vertices: number[] = [];
  const indices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];

  const halfWidth = width / 2;

  for (let i = 0; i < path.length; i++) {
    const point = path[i];
    let direction: THREE.Vector3;

    if (i === 0) {
      direction = path[1].clone().sub(point).normalize();
    } else if (i === path.length - 1) {
      direction = point
        .clone()
        .sub(path[i - 1])
        .normalize();
    } else {
      const prevDir = point
        .clone()
        .sub(path[i - 1])
        .normalize();
      const nextDir = path[i + 1].clone().sub(point).normalize();
      direction = prevDir.add(nextDir).normalize();

      if (direction.length() < 0.1) {
        direction = path[i + 1]
          .clone()
          .sub(path[i - 1])
          .normalize();
      }
    }

    const perpendicular = new THREE.Vector3(
      -direction.z,
      0,
      direction.x
    ).normalize();

    // Water surface points
    const leftPoint = point
      .clone()
      .add(perpendicular.clone().multiplyScalar(halfWidth))
      .setY(elevation);
    const rightPoint = point
      .clone()
      .add(perpendicular.clone().multiplyScalar(-halfWidth))
      .setY(elevation);

    // Vertices
    vertices.push(
      leftPoint.x,
      leftPoint.y,
      leftPoint.z,
      rightPoint.x,
      rightPoint.y,
      rightPoint.z
    );

    // Normals (pointing up)
    normals.push(0, 1, 0, 0, 1, 0);

    // UVs
    const u = i / (path.length - 1);
    uvs.push(0, u, 1, u);
  }

  // Generate indices for ribbon
  for (let i = 0; i < path.length - 1; i++) {
    const baseIndex = i * 2;
    indices.push(baseIndex, baseIndex + 2, baseIndex + 1);
    indices.push(baseIndex + 1, baseIndex + 2, baseIndex + 3);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}
