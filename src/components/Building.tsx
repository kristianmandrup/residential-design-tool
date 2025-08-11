"use client";
import React, { useRef, useEffect } from "react";
import { useStore } from "@/store/useStore";
import * as THREE from "three";
import { Roof } from "@/components/build-objects";
import { BuildingObj, StoreState } from "@/store/storeTypes";

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

  const floorH = 1.8;
  const width = 2.4;
  const depth = 2.4;

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
