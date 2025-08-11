"use client";
import React, { useEffect, useRef } from "react";
import { TreeObj } from "@/store/storeTypes";
import * as THREE from "three";

export default function Tree({ data }: { data: TreeObj }) {
  const groupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.traverse((c) => {
      if (c instanceof THREE.Object3D) {
        c.userData.objectId = data.id;
      }
    });
  }, [data.id]);

  // Use grid dimensions if available, otherwise use defaults
  const gridWidth = data.gridWidth || 1; // Default 1x1 grid
  const gridDepth = data.gridDepth || 1; // Default 1x1 grid
  const gridHeight = data.gridHeight || 1; // Default 1 grid unit height

  // Convert grid units to actual world units (1 grid unit = 1.5 world units for trees)
  const gridSize = 1.5;
  const width = gridWidth * gridSize;
  const depth = gridDepth * gridSize;
  const height = gridHeight * gridSize;

  return (
    <group
      ref={groupRef}
      position={data.position}
      rotation={data.rotation}
      scale={[width, height, depth]}
    >
      <mesh position={[0, height * 0.33, 0]}>
        <cylinderGeometry args={[0.08, 0.12, height * 0.67, 8]} />
        <meshStandardMaterial color="#8B5A2B" />
      </mesh>
      <mesh position={[0, height * 0.9, 0]}>
        <sphereGeometry args={[height * 0.4, 8, 8]} />
        <meshStandardMaterial color={data.foliageColor ?? "#2E8B57"} />
      </mesh>
      {/* highlight bounding when selected */}
      <mesh position={[0, height * 0.5, 0]}>
        <boxGeometry args={[width + 0.3, height + 0.3, depth + 0.3]} />
        <meshBasicMaterial color="yellow" wireframe transparent opacity={0.4} />
      </mesh>
    </group>
  );
}
