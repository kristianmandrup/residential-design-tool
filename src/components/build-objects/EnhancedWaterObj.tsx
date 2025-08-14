/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/build-objects/EnhancedWaterObj.tsx
import React, { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";
import { WaterObj } from "@/store/storeTypes";
import { useStore, StoreState } from "@/store";
import { ENHANCED_WATER_CONFIGS } from "./wall/enhancedWallDrawingBehavior";
import GenericMarkings from "./shared/GenericMarkings";
import GenericSelectionIndicators from "./shared/GenericSelectionIndicators";

interface EnhancedWaterComponentProps {
  data: WaterObj;
}

export function EnhancedWater({ data }: EnhancedWaterComponentProps) {
  const groupRef = useRef<THREE.Group>(null);
  const selectedId = useStore((s: StoreState) => s.selectedId);
  const isSelected = selectedId === data.id;

  // Get enhanced water configuration
  const waterType = (data as any).waterType || "pond";
  const waterConfig =
    ENHANCED_WATER_CONFIGS[waterType as keyof typeof ENHANCED_WATER_CONFIGS] ||
    ENHANCED_WATER_CONFIGS.pond;
  const visualConfig = waterConfig.visualConfig;

  // Water properties
  const shape = data.shape || "circular";
  const width = data.width || 2;
  const depth = data.depth || 2;
  const radius = data.radius || Math.max(width, depth) / 2;
  const waterColor = data.color || waterConfig.color;
  const transparency = data.transparency ?? waterConfig.transparency;
  const waterHeight = 0.1; // Thin water surface

  console.log("💧 Enhanced Water rendering:", {
    id: data.id,
    type: waterType,
    shape,
    width,
    depth,
    radius,
    transparency,
    isSelected,
    visualFeatures: {
      edges: visualConfig.edges?.enabled,
      centerLine: (visualConfig as any).centerLine?.enabled,
      surfaces: !!visualConfig.surfaces,
    },
  });

  // Set userData for Three.js object identification
  useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Object3D) {
        child.userData.objectId = data.id;
        child.userData.objectType = "water";
      }
    });
  }, [data.id]);

  // Generate points for water body based on shape
  const waterPoints = useMemo(() => {
    if (shape === "circular") {
      // For circular water, create points around the circumference
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
      // For rectangular water, create corner points
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

  // Generate path points for markings
  const pathPoints = useMemo(() => {
    return waterPoints.map(
      (p) => new THREE.Vector3(p.x, data.position[1], p.z)
    );
  }, [waterPoints, data.position]);

  const centerLinePoints = useMemo(() => {
    if (waterType === "river" && (visualConfig as any).centerLine?.enabled) {
      // Rivers have center lines for flow direction
      return pathPoints;
    }
    return []; // Other water types don't have center lines
  }, [pathPoints, waterType, visualConfig]);

  // Generate enhanced water geometry
  const waterGeometry = useMemo(() => {
    if (shape === "circular") {
      return new THREE.CircleGeometry(radius, 32);
    } else {
      return new THREE.PlaneGeometry(width, depth);
    }
  }, [shape, radius, width, depth]);

  // Water surface material with enhanced properties
  const waterMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: waterColor,
      transparent: true,
      opacity: transparency,
      roughness: visualConfig.surfaces?.roughness || 0.1,
      metalness: visualConfig.surfaces?.metalness || 0.9,
      ...(visualConfig.surfaces?.emissive && {
        emissive: visualConfig.surfaces.emissive,
        emissiveIntensity: visualConfig.surfaces.emissiveIntensity || 0.1,
      }),
      side: THREE.DoubleSide,
    });
  }, [waterColor, transparency, visualConfig.surfaces]);

  // Enhanced selection material
  const selectionMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#00ccff",
      transparent: true,
      opacity: 0.3,
      emissive: "#00ccff",
      emissiveIntensity: isSelected ? 0.2 : 0,
      side: THREE.DoubleSide,
    });
  }, [isSelected]);

  return (
    <group
      ref={groupRef}
      position={data.position}
      rotation={data.rotation}
      scale={data.scale}
      userData={{ objectId: data.id, objectType: "water" }}
    >
      {/* Main water surface */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        geometry={waterGeometry}
        material={waterMaterial}
        receiveShadow
      />

      {/* Enhanced markings for water */}
      <GenericMarkings
        centerLinePoints={centerLinePoints}
        pathPoints={pathPoints}
        visualConfig={visualConfig}
        objectWidth={Math.max(width, depth)}
        objectElevation={data.position[1]}
        objectThickness={waterHeight}
        objectType="water"
      />

      {/* Enhanced selection indicators */}
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

      {/* Water-specific visual effects */}
      {isSelected && (
        <group>
          {/* Water surface highlight */}
          <mesh
            position={[0, 0.005, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            geometry={waterGeometry}
            material={selectionMaterial}
          />

          {/* Wave effect indicators */}
          <mesh position={[0, 0.05, 0]}>
            <sphereGeometry args={[0.1]} />
            <meshStandardMaterial
              color="#00ffff"
              emissive="#0088aa"
              emissiveIntensity={0.5}
              transparent
              opacity={0.7}
            />
          </mesh>

          {/* Water type indicator */}
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.06]} />
            <meshStandardMaterial
              color={
                waterType === "pond"
                  ? "#4FC3F7"
                  : waterType === "lake"
                  ? "#2196F3"
                  : waterType === "river"
                  ? "#03A9F4"
                  : waterType === "pool"
                  ? "#00BCD4"
                  : "#4FC3F7"
              }
              emissive={
                waterType === "pond"
                  ? "#4FC3F7"
                  : waterType === "lake"
                  ? "#2196F3"
                  : waterType === "river"
                  ? "#03A9F4"
                  : waterType === "pool"
                  ? "#00BCD4"
                  : "#4FC3F7"
              }
              emissiveIntensity={0.4}
            />
          </mesh>
        </group>
      )}

      {/* Type-specific visual effects */}
      {waterType === "river" && (
        <group>
          {/* Flow direction indicators */}
          {pathPoints.length > 1 &&
            pathPoints.map((point, index) => {
              if (index === pathPoints.length - 1) return null;

              const nextPoint = pathPoints[index + 1];
              const direction = nextPoint.clone().sub(point).normalize();
              const midPoint = point.clone().add(nextPoint).multiplyScalar(0.5);

              return (
                <mesh
                  key={index}
                  position={[midPoint.x, midPoint.y + 0.02, midPoint.z]}
                  lookAt={nextPoint}
                >
                  <coneGeometry args={[0.05, 0.15, 4]} />
                  <meshStandardMaterial
                    color="#0277BD"
                    transparent
                    opacity={0.7}
                    emissive="#0277BD"
                    emissiveIntensity={0.3}
                  />
                </mesh>
              );
            })}
        </group>
      )}

      {waterType === "pool" && (
        <group>
          {/* Pool edges/tiles */}
          <mesh
            position={[0, -0.02, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            geometry={waterGeometry}
          >
            <meshStandardMaterial
              color="#00838F"
              roughness={0.1}
              metalness={0.8}
            />
          </mesh>

          {/* Pool ladder indicator (for rectangular pools) */}
          {shape === "rectangular" && (
            <mesh position={[width / 2 - 0.1, 0.05, 0]}>
              <boxGeometry args={[0.05, 0.1, 0.3]} />
              <meshStandardMaterial
                color="#CCCCCC"
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          )}
        </group>
      )}

      {waterType === "pond" && (
        <group>
          {/* Lily pad decorations for ponds */}
          {Array.from({ length: Math.min(3, Math.floor(radius)) }, (_, i) => {
            const angle = (i / 3) * Math.PI * 2;
            const distance = radius * 0.6;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * distance,
                  0.01,
                  Math.sin(angle) * distance,
                ]}
                rotation={[-Math.PI / 2, 0, angle]}
              >
                <circleGeometry args={[0.1, 8]} />
                <meshStandardMaterial
                  color="#228B22"
                  transparent
                  opacity={0.8}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {waterType === "lake" && (
        <group>
          {/* Gentle wave rings for lakes */}
          {Array.from({ length: 3 }, (_, i) => (
            <mesh
              key={i}
              position={[0, 0.001 + i * 0.002, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <ringGeometry
                args={[
                  radius * 0.3 + i * radius * 0.2,
                  radius * 0.35 + i * radius * 0.2,
                  32,
                ]}
              />
              <meshStandardMaterial
                color="#1565C0"
                transparent
                opacity={0.2 - i * 0.05}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Development debugging features */}
      {process.env.NODE_ENV === "development" && isSelected && (
        <>
          {/* Shape type indicator */}
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry
              args={shape === "circular" ? [0.1, 0.05, 0.1] : [0.15, 0.05, 0.1]}
            />
            <meshStandardMaterial
              color={shape === "circular" ? "#ff9900" : "#9900ff"}
              emissive={shape === "circular" ? "#ff9900" : "#9900ff"}
              emissiveIntensity={0.3}
            />
          </mesh>

          {/* Visual config indicator */}
          <mesh position={[0, 0.6, 0]}>
            <sphereGeometry args={[0.04]} />
            <meshStandardMaterial
              color={visualConfig.edges?.enabled ? "#00ff00" : "#666666"}
              emissive={visualConfig.edges?.enabled ? "#00ff00" : "#666666"}
              emissiveIntensity={0.4}
            />
          </mesh>

          {/* Transparency indicator */}
          <mesh position={[0, 0.8, 0]}>
            <cylinderGeometry args={[0.03, 0.03, transparency, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              transparent
              opacity={transparency}
            />
          </mesh>
        </>
      )}

      {/* Subtle water animation (rotation for visual interest) */}
      <mesh
        position={[0, -0.001, 0]}
        rotation={[-Math.PI / 2, 0, Date.now() * 0.0001]}
        geometry={waterGeometry}
      >
        <meshStandardMaterial
          color={waterColor}
          transparent
          opacity={transparency * 0.3}
          roughness={0.05}
          metalness={0.95}
        />
      </mesh>
    </group>
  );
}

export default EnhancedWater;
