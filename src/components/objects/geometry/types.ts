// src/components/objects/geometry/types.ts
import * as THREE from "three";

export interface GenericGeometryResult {
  mainGeometry: THREE.BufferGeometry;
  centerLinePoints: THREE.Vector3[];
  pathPoints: THREE.Vector3[];
  bounds?: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
    width: number;
    depth: number;
  };
}

export interface GeometryConfig {
  type: "road" | "water" | "wall";
  width?: number;
  height?: number;
  thickness?: number;
  elevation?: number;
  radius?: number;
  segments?: number;
  closedShape?: boolean;
  doubleSided?: boolean;
  transparent?: boolean;
  opacity?: number;
}
