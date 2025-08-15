// File: src/components/objects/BuildingObj.tsx
import React, { useRef, useEffect } from "react";
import { BuildingObj, useSceneStore } from "@/store";
import * as THREE from "three";
import { RoofObj } from "./RoofObj";
interface BuildingProps {
  data: BuildingObj;
}
export function Building({ data }: BuildingProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const selectedId = useSceneStore((s) => s.selectedId);
  const isSelected = selectedId === data.id;
  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Object3D) {
        child.userData.objectId = data.id;
        child.userData.objectType = "building";
        child.userData.selectable = true;
      }
    });
  }, [data.id, data.floors]);
  const gridSize = 1.0;
  const width = (data.gridWidth || 2) * gridSize;
  const depth = (data.gridDepth || 2) * gridSize;
  const floorH = (data.gridHeight || 1) * gridSize;
  console.log("🏢 Rendering Building:", {
    id: data.id,
    floors: data.floors,
    isSelected,
  });
  const renderWindowsForWall = (
    floorIndex: number,
    wall: "front" | "back" | "left" | "right"
  ) => {
    const floorProps = data.floorProperties[floorIndex];
    if (!floorProps?.windowsEnabled) return null;
    const windowWidth = 0.4;
    const windowHeight = 0.5;
    const wallWidth = width - 0.4;
    const wallDepth = depth - 0.4;
    const windowPositions: Array<[number, number, number]> = [];

    if (wall === "front" || wall === "back") {
      const numWindows = Math.floor(wallWidth / 0.8);
      const startX = -(numWindows * 0.8) / 2 + 0.4;

      for (let i = 0; i < numWindows; i++) {
        const x = startX + i * 0.8;
        const z = wall === "front" ? depth / 2 + 0.01 : -depth / 2 - 0.01;
        windowPositions.push([x, 0, z]);
      }
    } else {
      const numWindows = Math.floor(wallDepth / 0.8);
      const startZ = -(numWindows * 0.8) / 2 + 0.4;

      for (let i = 0; i < numWindows; i++) {
        const x = wall === "right" ? width / 2 + 0.01 : -width / 2 - 0.01;
        const z = startZ + i * 0.8;
        windowPositions.push([x, 0, z]);
      }
    }

    return windowPositions.map((pos, i) => {
      const rotatedPos = new THREE.Vector3(pos[0], 0, pos[2]);
      rotatedPos.applyEuler(new THREE.Euler(0, data.rotation[1], 0));

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
            emissiveIntensity={0.1}
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
      userData={{
        objectId: data.id,
        objectType: "building",
        selectable: true,
        floors: data.floors,
      }}
    >
      {Array.from({ length: data.floors }).map((_, floorIndex) => {
        const floorProps = data.floorProperties[floorIndex];
        return (
          <group key={floorIndex}>
            <mesh
              position={[0, floorIndex * floorH + floorH / 2, 0]}
              userData={{
                objectId: data.id,
                objectType: "building",
                selectable: true,
              }}
              castShadow
            >
              <boxGeometry args={[width, floorH, depth]} />
              <meshStandardMaterial
                color={floorProps?.wallColor || data.color}
                metalness={0.1}
                roughness={0.8}
                emissive={
                  isSelected
                    ? new THREE.Color(0x004400)
                    : new THREE.Color(0x000000)
                }
                emissiveIntensity={isSelected ? 0.1 : 0}
              />
            </mesh>
            {renderWindowsForWall(floorIndex, "front")}
            {renderWindowsForWall(floorIndex, "back")}
            {renderWindowsForWall(floorIndex, "left")}
            {renderWindowsForWall(floorIndex, "right")}
          </group>
        );
      })}

      <group position={[0, data.floors * floorH, 0]}>
        <RoofObj
          type={data.roofType}
          color={data.roofColor}
          width={width}
          depth={depth}
        />
      </group>

      {isSelected && (
        <mesh position={[0, (data.floors * floorH) / 2, 0]}>
          <boxGeometry
            args={[width + 0.2, data.floors * floorH + 0.2, depth + 0.2]}
          />
          <meshBasicMaterial
            color="#00ff00"
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>
      )}
    </group>
  );
}
