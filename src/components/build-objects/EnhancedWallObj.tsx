/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/build-objects/EnhancedWallObj.tsx
import React, { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import { WallObj } from "@/store/storeTypes";
import { useStore, StoreState } from "@/store";
import { ENHANCED_WALL_CONFIGS } from "./wall/enhancedWallDrawingBehavior";
import GenericMarkings from "./shared/GenericMarkings";
import GenericSelectionIndicators from "./shared/GenericSelectionIndicators";

interface EnhancedWallComponentProps {
  data: WallObj;
}

export function EnhancedWall({ data }: EnhancedWallComponentProps) {
  const groupRef = useRef<THREE.Group>(null);
  const selectedId = useStore((s: StoreState) => s.selectedId);
  const isSelected = selectedId === data.id;

  // Get enhanced wall configuration
  const wallType = (data as any).wallType || "concrete";
  const wallConfig =
    ENHANCED_WALL_CONFIGS[wallType as keyof typeof ENHANCED_WALL_CONFIGS] ||
    ENHANCED_WALL_CONFIGS.concrete;
  const visualConfig = wallConfig.visualConfig;

  // Wall properties
  const wallLength = data.length || 2;
  const wallHeight = data.height || wallConfig.height;
  const wallThickness = data.thickness || wallConfig.thickness;
  const wallColor = data.color || wallConfig.color;

  console.log("🧱 Enhanced Wall rendering:", {
    id: data.id,
    type: wallType,
    length: wallLength,
    height: wallHeight,
    thickness: wallThickness,
    isSelected,
    visualFeatures: {
      edges: visualConfig.edges?.enabled,
      surfaces: !!visualConfig.surfaces,
    },
  });

  // Set userData for Three.js object identification
  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Object3D) {
        child.userData.objectId = data.id;
        child.userData.objectType = "wall";
      }
    });
  }, [data.id]);

  // Convert wall data to points for generic systems
  const wallPoints = useMemo(() => {
    // For walls, create points based on position and rotation
    const angle = data.rotation[1];
    const centerX = data.position[0];
    const centerZ = data.position[2];

    const halfLength = wallLength / 2;
    const startX = centerX - Math.cos(angle) * halfLength;
    const startZ = centerZ - Math.sin(angle) * halfLength;
    const endX = centerX + Math.cos(angle) * halfLength;
    const endZ = centerZ + Math.sin(angle) * halfLength;

    return [
      { x: startX, z: startZ },
      { x: endX, z: endZ },
    ];
  }, [data.position, data.rotation, wallLength]);

  // Generate path points for markings
  const pathPoints = useMemo(() => {
    return wallPoints.map((p) => new THREE.Vector3(p.x, wallHeight / 2, p.z));
  }, [wallPoints, wallHeight]);

  const centerLinePoints = useMemo(() => {
    return wallPoints.map((p) => new THREE.Vector3(p.x, wallHeight / 2, p.z));
  }, [wallPoints, wallHeight]);

  // Generate enhanced wall geometry
  const wallGeometry = useMemo(() => {
    return new THREE.BoxGeometry(wallLength, wallHeight, wallThickness);
  }, [wallLength, wallHeight, wallThickness]);

  return (
    <group
      ref={groupRef}
      position={data.position}
      rotation={data.rotation}
      scale={data.scale}
      userData={{ objectId: data.id, objectType: "wall" }}
    >
      {/* Main wall mesh with enhanced materials */}
      <mesh
        position={[0, wallHeight / 2, 0]}
        geometry={wallGeometry}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={wallColor}
          emissive={
            isSelected ? new THREE.Color(0x444400) : new THREE.Color(0x000000)
          }
          emissiveIntensity={isSelected ? 0.15 : 0}
          roughness={visualConfig.surfaces?.roughness || 0.9}
          metalness={visualConfig.surfaces?.metalness || 0.05}
        />
      </mesh>

      {/* Enhanced markings for walls */}
      <GenericMarkings
        centerLinePoints={centerLinePoints}
        pathPoints={pathPoints}
        visualConfig={visualConfig}
        objectWidth={wallThickness}
        objectElevation={0}
        objectThickness={wallHeight}
        objectType="wall"
      />

      {/* Enhanced selection indicators */}
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

      {/* Wall type indicator for debugging */}
      {process.env.NODE_ENV === "development" && isSelected && (
        <>
          {/* Wall material type indicator */}
          <mesh position={[0, wallHeight + 0.3, 0]}>
            <sphereGeometry args={[0.08]} />
            <meshStandardMaterial
              color={
                wallType === "concrete"
                  ? "#CCCCCC"
                  : wallType === "brick"
                  ? "#8B4513"
                  : wallType === "wood"
                  ? "#D2691E"
                  : wallType === "stone"
                  ? "#696969"
                  : "#888888"
              }
              emissive={
                wallType === "concrete"
                  ? "#CCCCCC"
                  : wallType === "brick"
                  ? "#8B4513"
                  : wallType === "wood"
                  ? "#D2691E"
                  : wallType === "stone"
                  ? "#696969"
                  : "#888888"
              }
              emissiveIntensity={0.3}
            />
          </mesh>

          {/* Visual config indicator */}
          <mesh position={[0, wallHeight + 0.5, 0]}>
            <boxGeometry args={[0.1, 0.05, 0.1]} />
            <meshStandardMaterial
              color={visualConfig.edges?.enabled ? "#00ff00" : "#666666"}
              emissive={visualConfig.edges?.enabled ? "#00ff00" : "#666666"}
              emissiveIntensity={0.3}
            />
          </mesh>

          {/* Wall dimensions display */}
          <mesh position={[wallLength / 2 + 0.2, wallHeight / 2, 0]}>
            <sphereGeometry args={[0.03]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.5}
            />
          </mesh>
        </>
      )}

      {/* Enhanced wall caps for better visual quality */}
      {isSelected && (
        <>
          {/* Start cap */}
          <mesh position={[-wallLength / 2, wallHeight / 2, 0]}>
            <boxGeometry args={[0.02, wallHeight + 0.1, wallThickness + 0.1]} />
            <meshStandardMaterial
              color="#ffaa00"
              transparent
              opacity={0.3}
              emissive="#ffaa00"
              emissiveIntensity={0.2}
            />
          </mesh>

          {/* End cap */}
          <mesh position={[wallLength / 2, wallHeight / 2, 0]}>
            <boxGeometry args={[0.02, wallHeight + 0.1, wallThickness + 0.1]} />
            <meshStandardMaterial
              color="#ff6600"
              transparent
              opacity={0.3}
              emissive="#ff6600"
              emissiveIntensity={0.2}
            />
          </mesh>
        </>
      )}

      {/* Material-specific surface details */}
      {wallType === "brick" && (
        <group>
          {/* Brick pattern overlay */}
          <mesh position={[0, wallHeight / 2, wallThickness / 2 + 0.001]}>
            <planeGeometry args={[wallLength, wallHeight]} />
            <meshStandardMaterial
              color="#654321"
              transparent
              opacity={0.3}
              roughness={0.95}
            />
          </mesh>
        </group>
      )}

      {wallType === "wood" && (
        <group>
          {/* Wood grain lines */}
          {Array.from({ length: Math.floor(wallHeight / 0.2) }, (_, i) => (
            <mesh
              key={i}
              position={[0, i * 0.2 + 0.1, wallThickness / 2 + 0.001]}
            >
              <planeGeometry args={[wallLength, 0.01]} />
              <meshStandardMaterial color="#8B4513" transparent opacity={0.4} />
            </mesh>
          ))}
        </group>
      )}

      {wallType === "stone" && (
        <group>
          {/* Stone texture indicators */}
          {Array.from({ length: 3 }, (_, i) => (
            <mesh
              key={i}
              position={[
                (Math.random() - 0.5) * wallLength * 0.8,
                wallHeight * 0.2 + i * wallHeight * 0.3,
                wallThickness / 2 + 0.001,
              ]}
            >
              <sphereGeometry args={[0.02]} />
              <meshStandardMaterial color="#555555" transparent opacity={0.6} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

export default EnhancedWall;
