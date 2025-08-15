/* eslint-disable @typescript-eslint/no-explicit-any */
// File: src/components/objects/EnhancedWallObj.tsx
import React, { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import { WallObj } from "@/store/storeTypes";
import { useSceneStore } from "@/store/useSceneStore";
import { WALL_CONFIGS as ENHANCED_WALL_CONFIGS } from "./configs";
import { GenericMarkings } from "./shared/GenericMarkings";
import { GenericSelectionIndicators } from "./shared/GenericSelectionIndicators";
interface EnhancedWallProps {
  data: WallObj;
}
export function EnhancedWall({ data }: EnhancedWallProps) {
  const groupRef = useRef<THREE.Group>(null);
  const selectedId = useSceneStore((s) => s.selectedId);
  const isSelected = selectedId === data.id;
  const wallType = (data as any).wallType || "concrete";
  const wallConfig =
    ENHANCED_WALL_CONFIGS[wallType as keyof typeof ENHANCED_WALL_CONFIGS] ||
    ENHANCED_WALL_CONFIGS.concrete;
  const visualConfig = wallConfig.visualConfig;
  const wallLength = data.length || 2;
  const wallHeight = data.height || wallConfig.height;
  const wallThickness = data.thickness || wallConfig.thickness;
  const wallColor = data.color || wallConfig.color;
  console.log("🧱 Rendering Enhanced Wall:", {
    id: data.id,
    type: wallType,
    length: wallLength,
    height: wallHeight,
    isSelected,
  });
  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Object3D) {
        child.userData.objectId = data.id;
        child.userData.objectType = "wall";
        child.userData.selectable = true;
      }
    });
  }, [data.id]);
  const wallPoints = useMemo(() => {
    const angle = data.rotation[1];
    const centerX = data.position[0];
    const centerZ = data.position[2];
    const halfLength = wallLength / 2;
    return [
      {
        x: centerX - Math.cos(angle) * halfLength,
        z: centerZ - Math.sin(angle) * halfLength,
      },
      {
        x: centerX + Math.cos(angle) * halfLength,
        z: centerZ + Math.sin(angle) * halfLength,
      },
    ];
  }, [data.position, data.rotation, wallLength]);
  const pathPoints = useMemo(() => {
    return wallPoints.map((p) => new THREE.Vector3(p.x, wallHeight / 2, p.z));
  }, [wallPoints, wallHeight]);
  return (
    <group
      ref={groupRef}
      position={data.position}
      rotation={data.rotation}
      scale={data.scale}
      userData={{
        objectId: data.id,
        objectType: "wall",
        selectable: true,
        wallType: wallType,
      }}
    >
      <mesh
        position={[0, wallHeight / 2, 0]}
        userData={{
          objectId: data.id,
          objectType: "wall",
          selectable: true,
        }}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[wallLength, wallHeight, wallThickness]} />
        <meshStandardMaterial
          color={wallColor}
          emissive={
            isSelected ? new THREE.Color(0x444400) : new THREE.Color(0x000000)
          }
          emissiveIntensity={isSelected ? 0.15 : 0}
          roughness={visualConfig.surfaces?.roughness || 0.9}
          metalness={visualConfig.surfaces?.metalness || 0.05}
        />
      </mesh>{" "}
      <GenericMarkings
        centerLinePoints={pathPoints}
        pathPoints={pathPoints}
        visualConfig={visualConfig}
        objectWidth={wallThickness}
        objectElevation={0}
        objectThickness={wallHeight}
        objectType="wall"
      />{" "}
      <GenericSelectionIndicators
        points={wallPoints}
        isSelected={isSelected}
        objectElevation={0}
        objectThickness={wallHeight}
        objectType="wall"
        objectWidth={wallThickness}
        objectDepth={wallLength}
        config={{
          pointColor: {
            start: "#ffaa00",
            end: "#ff6600",
            middle: "#cc8800",
            control: "#ffff00",
          },
          pointSize: 0.1,
          controlPointSize: 0.08,
          boundingBoxColor: "#ffaa00",
          boundingBoxOpacity: 0.15,
        }}
      />
    </group>
  );
}
