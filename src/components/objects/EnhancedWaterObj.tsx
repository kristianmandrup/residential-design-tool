/* eslint-disable @typescript-eslint/no-explicit-any */
// File: src/components/objects/EnhancedWaterObj.tsx
import React, { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import { WaterObj } from "@/store/storeTypes";
import { useSceneStore } from "@/store/useSceneStore";
import { WATER_CONFIGS as ENHANCED_WATER_CONFIGS } from "./configs";
import { GenericMarkings } from "./shared/GenericMarkings";
import { GenericSelectionIndicators } from "./shared/GenericSelectionIndicators";
interface EnhancedWaterProps {
  data: WaterObj;
}
export function EnhancedWater({ data }: EnhancedWaterProps) {
  const groupRef = useRef<THREE.Group>(null);
  const selectedId = useSceneStore((s) => s.selectedId);
  const isSelected = selectedId === data.id;
  const waterType = (data as any).waterType || "pond";
  const waterConfig =
    ENHANCED_WATER_CONFIGS[waterType as keyof typeof ENHANCED_WATER_CONFIGS] ||
    ENHANCED_WATER_CONFIGS.pond;
  const visualConfig = waterConfig.visualConfig;
  const shape = data.shape || "circular";
  const width = data.width || 2;
  const depth = data.depth || 2;
  const radius = data.radius || Math.max(width, depth) / 2;
  const waterColor = data.color || waterConfig.color;
  const transparency = data.transparency ?? waterConfig.transparency;
  const waterHeight = 0.1;
  console.log("💧 Rendering Enhanced Water:", {
    id: data.id,
    type: waterType,
    shape,
    isSelected,
  });
  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Object3D) {
        child.userData.objectId = data.id;
        child.userData.objectType = "water";
        child.userData.selectable = true;
      }
    });
  }, [data.id]);
  const waterPoints = useMemo(() => {
    if (shape === "circular") {
      const numPoints = 8;
      const points = [];
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        points.push({
          x: data.position[0] + Math.cos(angle) * radius,
          z: data.position[2] + Math.sin(angle) * radius,
        });
      }
      return points;
    } else {
      const halfWidth = width / 2;
      const halfDepth = depth / 2;
      return [
        { x: data.position[0] - halfWidth, z: data.position[2] - halfDepth },
        { x: data.position[0] + halfWidth, z: data.position[2] - halfDepth },
        { x: data.position[0] + halfWidth, z: data.position[2] + halfDepth },
        { x: data.position[0] - halfWidth, z: data.position[2] + halfDepth },
      ];
    }
  }, [data.position, shape, width, depth, radius]);
  const waterGeometry = useMemo(() => {
    if (shape === "circular") {
      return new THREE.CircleGeometry(radius, 32);
    } else {
      return new THREE.PlaneGeometry(width, depth);
    }
  }, [shape, radius, width, depth]);
  return (
    <group
      ref={groupRef}
      position={data.position}
      rotation={data.rotation}
      scale={data.scale}
      userData={{
        objectId: data.id,
        objectType: "water",
        selectable: true,
        waterType: waterType,
      }}
    >
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={waterGeometry}
        userData={{
          objectId: data.id,
          objectType: "water",
          selectable: true,
        }}
        receiveShadow
      >
        <meshStandardMaterial
          color={waterColor}
          transparent={true}
          opacity={transparency}
          roughness={visualConfig.surfaces?.roughness || 0.1}
          metalness={visualConfig.surfaces?.metalness || 0.9}
          side={THREE.DoubleSide}
          emissive={
            isSelected ? new THREE.Color(0x004444) : new THREE.Color(0x000000)
          }
          emissiveIntensity={isSelected ? 0.15 : 0}
        />
      </mesh>
      <GenericMarkings
        centerLinePoints={[]}
        pathPoints={waterPoints.map(
          (p) => new THREE.Vector3(p.x, data.position[1], p.z)
        )}
        visualConfig={visualConfig}
        objectWidth={Math.max(width, depth)}
        objectElevation={data.position[1]}
        objectThickness={waterHeight}
        objectType="water"
      />

      <GenericSelectionIndicators
        points={waterPoints}
        isSelected={isSelected}
        objectElevation={data.position[1]}
        objectThickness={waterHeight}
        objectType="water"
        objectWidth={width}
        objectDepth={depth}
        config={{
          pointColor: {
            start: "#00ffff",
            end: "#0099cc",
            middle: "#0066aa",
            control: "#66ffff",
          },
          pointSize: 0.08,
          controlPointSize: 0.06,
          boundingBoxColor: "#00ccff",
          boundingBoxOpacity: 0.15,
        }}
      />
    </group>
  );
}
