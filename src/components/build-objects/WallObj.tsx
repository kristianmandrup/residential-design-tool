"use client";
import React, { useEffect, useRef } from "react";
import { WallObj } from "@/store/storeTypes";
import { useStore, StoreState } from "@/store";
import * as THREE from "three";

export default function Wall({ data }: { data: WallObj }) {
  const g = useRef<THREE.Group | null>(null);
  const selectedId = useStore((s: StoreState) => s.selectedId);
  useEffect(() => {
    if (!g.current) return;
    g.current.traverse((c) => {
      if (c instanceof THREE.Object3D) {
        c.userData.objectId = data.id;
      }
    });
  }, [data.id]);

  // Use grid dimensions if available, otherwise use defaults
  const gridWidth = data.gridWidth || 2; // Default 2x1 grid
  const gridDepth = data.gridDepth || 1; // Default 2x1 grid
  const gridHeight = data.gridHeight || 1; // Default 1 grid unit height

  // Convert grid units to actual world units (1 grid unit = 1.0 world unit)
  const gridSize = 1.0;
  const width = gridWidth * gridSize;
  const depth = gridDepth * gridSize;
  const height = gridHeight * gridSize;

  // Convert direction to rotation if direction is provided
  const rotation: [number, number, number] =
    data.direction !== undefined
      ? [0, (data.direction * Math.PI) / 180, 0]
      : data.rotation;

  return (
    <group
      ref={g}
      position={data.position}
      rotation={rotation}
      scale={[width, height, depth]}
    >
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, 0.12]} />
        <meshStandardMaterial color="#bfbfbf" />
      </mesh>
      {/* highlight bounding when selected */}
      {selectedId === data.id && (
        <mesh position={[0, height / 2, 0]}>
          <boxGeometry args={[width + 0.2, height + 0.2, 0.32]} />
          <meshBasicMaterial
            color="yellow"
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>
      )}
    </group>
  );
}
