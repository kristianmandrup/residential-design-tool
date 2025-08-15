// src/components/objects/geometry/boundsUtils.ts
import * as THREE from "three";

/**
 * Calculate bounds from path points
 */
export function calculateBounds(path: THREE.Vector3[]): {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  width: number;
  depth: number;
} {
  if (path.length === 0) {
    return { minX: 0, maxX: 0, minZ: 0, maxZ: 0, width: 0, depth: 0 };
  }

  const xs = path.map((p) => p.x);
  const zs = path.map((p) => p.z);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);

  return {
    minX,
    maxX,
    minZ,
    maxZ,
    width: maxX - minX,
    depth: maxZ - minZ,
  };
}
