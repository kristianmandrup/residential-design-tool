"use client";
import React, { useRef, useEffect } from "react";
import { BuildingObj, useStore, StoreState } from "@/store/useStore";
import * as THREE from "three";
import Roof from "./RoofObj";

export default function Building({ data }: { data: BuildingObj }) {
  const groupRef = useRef<THREE.Group | null>(null);
  const selectedId = useStore((s: StoreState) => s.selectedId);

  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Object3D) {
        child.userData.objectId = data.id;
      }
    });
  }, [data.id, data.floors]);

  // Use grid dimensions if available, otherwise use defaults
  const gridWidth = data.gridWidth || 2; // Default 2x2 grid
  const gridDepth = data.gridDepth || 2; // Default 2x2 grid
  const gridHeight = data.gridHeight || 1; // Default 1 grid unit height

  // Convert grid units to actual world units (1 grid unit = 1.2 world units)
  const gridSize = 1.0;
  const width = gridWidth * gridSize;
  const depth = gridDepth * gridSize;
  const floorH = gridHeight * gridSize;

  return (
    <group
      ref={groupRef}
      position={data.position}
      rotation={data.rotation}
      scale={data.scale}
    >
      {Array.from({ length: data.floors }).map((_, i) => (
        <mesh key={i} position={[0, i * floorH + floorH / 2, 0]} castShadow>
          <boxGeometry args={[width, floorH, depth]} />
          <meshStandardMaterial
            color={data.color}
            metalness={0.1}
            roughness={0.8}
          />
        </mesh>
      ))}

      {/* Windows (simple planes) */}
      {Array.from({ length: data.floors }).map((_, floor) => (
        <group
          key={`win-${floor}`}
          position={[0, floor * floorH + floorH / 2, depth / 2 + 0.01]}
        >
          <mesh position={[-0.65, 0, 0]}>
            <planeGeometry args={[0.5, 0.6]} />
            <meshStandardMaterial
              color={data.windowColor || "#bfe9ff"}
              emissive={data.windowColor || "#bfe9ff"}
            />
          </mesh>
          <mesh position={[0.65, 0, 0]}>
            <planeGeometry args={[0.5, 0.6]} />
            <meshStandardMaterial
              color={data.windowColor || "#bfe9ff"}
              emissive={data.windowColor || "#bfe9ff"}
            />
          </mesh>
        </group>
      ))}

      <group position={[0, data.floors * floorH, 0]}>
        <Roof
          type={data.roofType}
          color={data.roofColor}
          width={width}
          depth={depth}
        />
      </group>

      {/* highlight bounding when selected */}
      {selectedId === data.id && (
        <mesh position={[0, (data.floors * floorH) / 2, 0]}>
          <boxGeometry
            args={[width + 0.2, data.floors * floorH + 0.2, depth + 0.2]}
          />
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
