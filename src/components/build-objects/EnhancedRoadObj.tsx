// src/components/build-objects/EnhancedRoadObj.tsx
import React, { useMemo } from "react";
import * as THREE from "three";
import { useEditor, RoadObj } from "@/contexts/EditorContext";
import { generateRoadGeometry } from "./road/roadGeometry";
import { ENHANCED_ROAD_CONFIGS } from "./road/enhancedRoadDrawingBehavior";
import GenericMarkings from "./shared/GenericMarkings";
import GenericSelectionIndicators from "./shared/GenericSelectionIndicators";

interface EnhancedRoadComponentProps {
  data: RoadObj;
}

export function EnhancedRoad({ data }: EnhancedRoadComponentProps) {
  const { selectedId } = useEditor();
  const isSelected = selectedId === data.id;

  // Get enhanced road configuration
  const roadConfig = ENHANCED_ROAD_CONFIGS[data.roadType || "residential"];
  const roadWidth = data.width || roadConfig.width;
  const roadColor = data.color || roadConfig.color;
  const roadElevation = data.elevation ?? roadConfig.elevation;
  const roadThickness = data.thickness ?? roadConfig.thickness;
  const visualConfig = roadConfig.visualConfig;

  console.log("🛣️ Enhanced Road rendering:", {
    id: data.id,
    type: data.roadType,
    points: data.points?.length || 0,
    isSelected,
    visualFeatures: {
      centerLine: visualConfig.centerLine?.enabled,
      sideLines: visualConfig.sideLines?.enabled,
      curbs: visualConfig.curbs?.enabled,
    },
  });

  // Generate enhanced road geometry
  const geometries = useMemo(() => {
    if (!data.points || data.points.length < 2) {
      return {
        roadGeometry: new THREE.BufferGeometry(),
        centerLinePoints: [],
        roadPath: [],
      };
    }

    try {
      const result = generateRoadGeometry(
        data.points,
        roadWidth,
        roadElevation,
        roadThickness
      );
      return result;
    } catch (error) {
      console.error("❌ Enhanced road geometry error:", error);
      return {
        roadGeometry: new THREE.BufferGeometry(),
        centerLinePoints: [],
        roadPath: [],
      };
    }
  }, [data.points, roadWidth, roadElevation, roadThickness]);

  // Validate geometry
  const hasValidGeometry = useMemo(() => {
    const positionAttribute = geometries.roadGeometry.attributes.position;
    return !!(
      data.points.length >= 2 &&
      positionAttribute &&
      positionAttribute.count > 0 &&
      geometries.roadGeometry.index &&
      geometries.roadGeometry.index.count > 0
    );
  }, [data.points.length, geometries.roadGeometry]);

  if (!hasValidGeometry) {
    console.log("❌ Enhanced road skipped - invalid geometry");
    return null;
  }

  return (
    <group
      userData={{ objectId: data.id, objectType: "road" }}
      position={data.position}
      rotation={data.rotation}
      scale={data.scale}
    >
      {/* Enhanced road surface */}
      <mesh
        geometry={geometries.roadGeometry}
        userData={{ objectId: data.id, objectType: "road" }}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={roadColor}
          emissive={
            isSelected ? new THREE.Color(0x004400) : new THREE.Color(0x000000)
          }
          emissiveIntensity={isSelected ? 0.2 : 0}
          side={THREE.DoubleSide}
          roughness={visualConfig.surfaces?.roughness || 0.8}
          metalness={visualConfig.surfaces?.metalness || 0.1}
        />
      </mesh>

      {/* Enhanced markings */}
      {geometries.centerLinePoints.length > 0 && (
        <GenericMarkings
          centerLinePoints={geometries.centerLinePoints}
          pathPoints={geometries.roadPath}
          visualConfig={visualConfig}
          objectWidth={roadWidth}
          objectElevation={roadElevation}
          objectThickness={roadThickness}
          objectType="road"
        />
      )}

      {/* Enhanced selection indicators */}
      <GenericSelectionIndicators
        points={data.points}
        isSelected={isSelected}
        objectElevation={roadElevation}
        objectThickness={roadThickness}
        objectType="road"
        objectWidth={roadWidth}
        config={{
          pointColor: {
            start: "#00ff00",
            end: "#ff0000",
            middle: "#0066ff",
            control: "#ffff00",
          },
          pointSize: 0.12,
          controlPointSize: 0.08,
        }}
      />
    </group>
  );
}
