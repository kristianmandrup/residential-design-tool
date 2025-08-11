"use client";
import React, { useRef, useEffect } from "react";
import { BuildingObj, useStore, StoreState } from "@/store";
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

  // Render windows for all 4 walls
  const renderWindowsForWall = (
    floorIndex: number,
    wall: "front" | "back" | "left" | "right"
  ) => {
    const floorProps = data.floorProperties[floorIndex];
    if (!floorProps?.windowsEnabled) return null;

    const windowWidth = 0.4;
    const windowHeight = 0.5;
    const wallWidth = width - 0.4; // Leave some margin
    const wallDepth = depth - 0.4; // Leave some margin

    // Calculate window positions based on wall
    const windowPositions: Array<[number, number, number]> = [];

    if (wall === "front" || wall === "back") {
      // Front and back walls (windows on Z axis)
      const numWindows = Math.floor(wallWidth / 0.8);
      const startX = -(numWindows * 0.8) / 2 + 0.4;

      for (let i = 0; i < numWindows; i++) {
        const x = startX + i * 0.8;
        const z = wall === "front" ? depth / 2 + 0.01 : -depth / 2 - 0.01;
        windowPositions.push([x, 0, z]);
      }
    } else {
      // Left and right walls (windows on X axis)
      const numWindows = Math.floor(wallDepth / 0.8);
      const startZ = -(numWindows * 0.8) / 2 + 0.4;

      for (let i = 0; i < numWindows; i++) {
        const x = wall === "right" ? width / 2 + 0.01 : -width / 2 - 0.01;
        const z = startZ + i * 0.8;
        windowPositions.push([x, 0, z]);
      }
    }

    return windowPositions.map((pos, i) => {
      // Apply wall rotation to window position
      const rotatedPos = new THREE.Vector3(pos[0], 0, pos[2]);
      rotatedPos.applyEuler(new THREE.Euler(0, data.rotation[1], 0));

      // Calculate window rotation based on wall type
      const windowRotation = [
        0,
        wall === "front" || wall === "back"
          ? data.rotation[1]
          : data.rotation[1] + Math.PI / 2,
        0,
      ] as [number, number, number];

      return (
        <mesh
          key={`${wall}-${floorIndex}-${i}`}
          position={[
            rotatedPos.x,
            floorIndex * floorH + floorH / 2,
            rotatedPos.z,
          ]}
          rotation={windowRotation}
        >
          <planeGeometry args={[windowWidth, windowHeight]} />
          <meshStandardMaterial
            color={data.windowColor || "#bfe9ff"}
            emissive={data.windowColor || "#bfe9ff"}
          />
        </mesh>
      );
    });
  };

  return (
    <group
      ref={groupRef}
      position={data.position}
      rotation={data.rotation}
      scale={data.scale}
    >
      {Array.from({ length: data.floors }).map((_, floorIndex) => {
        const floorProps = data.floorProperties[floorIndex];
        return (
          <group key={floorIndex}>
            {/* Floor mesh with individual properties */}
            <mesh
              position={[0, floorIndex * floorH + floorH / 2, 0]}
              castShadow
            >
              <boxGeometry args={[width, floorH, depth]} />
              <meshStandardMaterial
                color={floorProps?.wallColor || data.color}
                metalness={0.1}
                roughness={0.8}
              />
            </mesh>

            {/* Windows for all 4 walls */}
            {renderWindowsForWall(floorIndex, "front")}
            {renderWindowsForWall(floorIndex, "back")}
            {renderWindowsForWall(floorIndex, "left")}
            {renderWindowsForWall(floorIndex, "right")}
          </group>
        );
      })}

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
