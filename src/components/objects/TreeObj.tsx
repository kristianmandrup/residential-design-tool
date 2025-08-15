// File: src/components/objects/TreeObj.tsx
import React, { useEffect, useRef, useMemo } from "react";
import { TreeObj } from "@/store/storeTypes";
import { useSceneStore } from "@/store/useSceneStore";
import { useElevation } from "@/contexts/ElevationContext";
import * as THREE from "three";
interface TreeProps {
  data: TreeObj;
}
export function Tree({ data }: TreeProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const selectedId = useSceneStore((s) => s.selectedId);
  const { getGridElevation } = useElevation();
  const isSelected = selectedId === data.id;

  // Calculate final elevation: grid elevation + object elevation
  const gridElevation = useMemo(() => {
    return getGridElevation(data.position[0], data.position[2]);
  }, [data.position, getGridElevation]);

  const finalElevation = (data.elevation ?? 0) + gridElevation;
  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.traverse((c) => {
      if (c instanceof THREE.Object3D) {
        c.userData.objectId = data.id;
        c.userData.objectType = "tree";
        c.userData.selectable = true;
      }
    });
  }, [data.id]);
  const gridSize = 1.5;
  const width = (data.gridWidth || 1) * gridSize;
  const depth = (data.gridDepth || 1) * gridSize;
  const height = (data.gridHeight || 1) * gridSize;
  console.log("🌳 Rendering Tree:", {
    id: data.id,
    isSelected,
  });
  return (
    <group
      ref={groupRef}
      position={data.position}
      rotation={data.rotation}
      scale={[width, height, depth]}
      userData={{
        objectId: data.id,
        objectType: "tree",
        selectable: true,
      }}
    >
      <mesh
        position={[0, height * 0.33 + finalElevation, 0]}
        userData={{
          objectId: data.id,
          objectType: "tree",
          selectable: true,
        }}
      >
        <cylinderGeometry args={[0.08, 0.12, height * 0.67, 8]} />
        <meshStandardMaterial
          color="#8B5A2B"
          emissive={
            isSelected ? new THREE.Color(0x442200) : new THREE.Color(0x000000)
          }
          emissiveIntensity={isSelected ? 0.1 : 0}
        />
      </mesh>
      <mesh
        position={[0, height * 0.9 + finalElevation, 0]}
        userData={{
          objectId: data.id,
          objectType: "tree",
          selectable: true,
        }}
      >
        <sphereGeometry args={[height * 0.4, 8, 8]} />
        <meshStandardMaterial
          color={data.foliageColor ?? "#2E8B57"}
          emissive={
            isSelected ? new THREE.Color(0x002200) : new THREE.Color(0x000000)
          }
          emissiveIntensity={isSelected ? 0.1 : 0}
        />
      </mesh>
      {isSelected && (
        <mesh position={[0, height * 0.5 + finalElevation, 0]}>
          <boxGeometry args={[width + 0.3, height + 0.3, depth + 0.3]} />
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
