import React, { useMemo } from "react";
import * as THREE from "three";
import { useEditor } from "@/contexts/EditorContext";
import { RoadObject } from "@/contexts/EditorContext";
import { generateRoadGeometry } from "./road/roadGeometry";
import { getRoadConfig } from "./road/roadConfig";
import { RoadMarkings } from "./road/RoadMarkings";
import { RoadSelectionIndicators } from "./road/RoadSelectionIndicators";

interface RoadComponentProps {
  data: RoadObject;
}

export function Road({ data }: RoadComponentProps) {
  const { selectedId } = useEditor();
  const isSelected = selectedId === data.id;

  const roadConfig = getRoadConfig(data.roadType);
  const roadWidth = data.width || roadConfig.width;
  const roadColor = data.color || roadConfig.color;
  const roadElevation = data.elevation || roadConfig.elevation;
  const roadThickness = data.thickness || roadConfig.thickness;

  // Debug logging
  console.log("Road component rendering:", {
    id: data.id,
    points: data.points,
    roadType: data.roadType,
    width: roadWidth,
    color: roadColor,
    elevation: roadElevation,
    thickness: roadThickness,
    isSelected,
  });

  // Move useMemo hooks before any early returns
  const geometries = useMemo(() => {
    console.log("Generating road geometry for points:", data.points);
    const result = generateRoadGeometry(data.points, roadWidth, roadElevation, roadThickness);
    console.log("Generated geometry:", {
      hasGeometry: !!result.roadGeometry,
      vertexCount: result.roadGeometry.attributes.position?.count || 0,
      pathLength: result.roadPath.length,
    });
    return result;
  }, [data.points, roadWidth, roadElevation, roadThickness]);

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

  console.log("Road rendering successfully with ID:", data.id);

  return (
    <group
      userData={{ objectId: data.id }}
      position={data.position}
      rotation={data.rotation}
      scale={data.scale}
    >
      {/* Road surface - FIXED: Complete mesh with geometry and elevation */}
      <mesh geometry={geometries.roadGeometry} userData={{ objectId: data.id }}>
        <meshStandardMaterial
          color={roadColor}
          emissive={
            isSelected ? new THREE.Color(0x004400) : new THREE.Color(0x000000)
          }
          emissiveIntensity={isSelected ? 0.2 : 0}
          side={THREE.DoubleSide}
          wireframe={false}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Road markings (center line, side lines, curbs) */}
      <RoadMarkings
        centerLinePoints={geometries.centerLinePoints}
        roadPath={geometries.roadPath}
        roadConfig={roadConfig}
        roadWidth={roadWidth}
        roadElevation={roadElevation}
      />

      {/* Selection indicators */}
      <RoadSelectionIndicators 
        points={data.points} 
        isSelected={isSelected}
        roadElevation={roadElevation}
      />

      {/* Debug: Show bounding box if selected */}
      {isSelected && (
        <mesh position={[0, roadElevation + roadThickness / 2, 0]}>
          <boxGeometry args={[roadWidth, roadThickness, 10]} />
          <meshStandardMaterial
            color="#ff0000"
            transparent
            opacity={0.1}
            wireframe
          />
        </mesh>
      )}
    </group>
  );
}

