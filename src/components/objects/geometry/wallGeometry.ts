// src/components/objects/geometry/wallGeometry.ts
import * as THREE from "three";
import { GeometryConfig } from "./types";

/**
 * Generate wall geometry (extruded line with height)
 */
export function generateWallGeometry(
  path: THREE.Vector3[],
  config: GeometryConfig,
  elevation: number
): THREE.BufferGeometry {
  const thickness = config.thickness || 0.2;
  const height = config.height || 2;

  if (path.length < 2) {
    return new THREE.BufferGeometry();
  }

  const vertices: number[] = [];
  const indices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];

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

    // Wall corners
    const bottomLeft = point
      .clone()
      .add(perpendicular.clone().multiplyScalar(thickness / 2))
      .setY(elevation);
    const bottomRight = point
      .clone()
      .add(perpendicular.clone().multiplyScalar(-thickness / 2))
      .setY(elevation);
    const topLeft = bottomLeft.clone().add(new THREE.Vector3(0, height, 0));
    const topRight = bottomRight.clone().add(new THREE.Vector3(0, height, 0));

    // Vertices
    vertices.push(
      bottomLeft.x,
      bottomLeft.y,
      bottomLeft.z,
      bottomRight.x,
      bottomRight.y,
      bottomRight.z,
      topLeft.x,
      topLeft.y,
      topLeft.z,
      topRight.x,
      topRight.y,
      topRight.z
    );

    // Normals
    normals.push(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1);

    // UVs
    const u = i / (path.length - 1);
    uvs.push(0, u, 1, u, 0, u, 1, u);
  }

  // Generate indices
  for (let i = 0; i < path.length - 1; i++) {
    const baseIndex = i * 4;

    // Front face
    indices.push(baseIndex, baseIndex + 2, baseIndex + 1);
    indices.push(baseIndex + 1, baseIndex + 2, baseIndex + 3);

    // Back face
    indices.push(baseIndex + 1, baseIndex + 3, baseIndex);
    indices.push(baseIndex + 3, baseIndex + 2, baseIndex);

    // Top face
    indices.push(baseIndex + 2, baseIndex + 6, baseIndex + 3);
    indices.push(baseIndex + 3, baseIndex + 6, baseIndex + 7);

    // Bottom face
    indices.push(baseIndex, baseIndex + 4, baseIndex + 1);
    indices.push(baseIndex + 1, baseIndex + 4, baseIndex + 5);
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
