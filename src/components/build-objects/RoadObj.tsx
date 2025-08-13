// src/components/build-objects/RoadObj.tsx - Fixed Mesh
import React, { useMemo } from "react";
import * as THREE from "three";
import { useStore } from "@/store/useStore";
import { RoadObj } from "@/store/storeTypes";
import { generateRoadGeometry } from "./road/roadGeometry";
import { getRoadConfig } from "./road/roadConfig";
import { RoadMarkings } from "./road/RoadMarkings";
import { RoadSelectionIndicators } from "./road/RoadSelectionIndicators";

interface RoadComponentProps {
  data: RoadObj;
}

export function Road({ data }: RoadComponentProps) {
  const selectedId = useStore((s) => s.selectedId);
  const isSelected = selectedId === data.id;

  const roadConfig = getRoadConfig(data.roadType);
  const roadWidth = data.width || roadConfig.width;
  const roadColor = data.color || roadConfig.color;

  // Debug logging
  console.log("Road component rendering:", {
    id: data.id,
    points: data.points,
    roadType: data.roadType,
    width: roadWidth,
    color: roadColor,
  });

  // Move useMemo hooks before any early returns
  const geometries = useMemo(() => {
    console.log("Generating road geometry for points:", data.points);
    const result = generateRoadGeometry(data.points, roadWidth);
    console.log("Generated geometry:", {
      hasGeometry: !!result.roadGeometry,
      vertexCount: result.roadGeometry.attributes.position?.count || 0,
      pathLength: result.roadPath.length,
    });
    return result;
  }, [data.points, roadWidth]);

  const hasValidGeometry = useMemo(() => {
    const isValid =
      data.points.length >= 2 &&
      geometries.roadGeometry.attributes.position &&
      geometries.roadGeometry.attributes.position.count > 0;
    console.log("Road geometry validation:", {
      pointsLength: data.points.length,
      hasPosition: !!geometries.roadGeometry.attributes.position,
      vertexCount: geometries.roadGeometry.attributes.position?.count || 0,
      isValid,
    });
    return isValid;
  }, [data.points.length, geometries.roadGeometry]);

  // Early return after all hooks
  if (!hasValidGeometry) {
    console.log("Road not rendering - invalid geometry");
    return null;
  }

  console.log("Road rendering successfully");

  return (
    <group
      userData={{ objectId: data.id }}
      position={data.position}
      rotation={data.rotation}
      scale={data.scale}
    >
      {/* Road surface - FIXED: Complete mesh with geometry */}
      <mesh geometry={geometries.roadGeometry}>
        <meshStandardMaterial
          color="#ff00ff" // Bright magenta for debugging - change back to roadColor when working
          emissive={
            isSelected ? new THREE.Color(0x004400) : new THREE.Color(0x000000)
          }
          emissiveIntensity={isSelected ? 0.2 : 0}
          side={THREE.DoubleSide} // Ensure both sides render
          wireframe={false} // Set to true to see wireframe
        />
      </mesh>

      {/* Road markings (center line, side lines) */}
      <RoadMarkings
        centerLinePoints={geometries.centerLinePoints}
        roadPath={geometries.roadPath}
        roadConfig={roadConfig}
        roadWidth={roadWidth}
      />

      {/* Selection indicators */}
      <RoadSelectionIndicators points={data.points} isSelected={isSelected} />

      {/* Debug: Show bounding box if selected */}
      {isSelected && (
        <mesh>
          <boxGeometry args={[roadWidth, 0.1, 10]} />
          <meshStandardMaterial
            color="#ff0000"
            transparent
            opacity={0.2}
            wireframe
          />
        </mesh>
      )}
    </group>
  );
}

export default Road;
