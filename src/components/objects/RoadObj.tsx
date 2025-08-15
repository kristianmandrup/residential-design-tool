import React, { useMemo } from "react";
import * as THREE from "three";
import { useSceneStore } from "@/store/useSceneStore";
import { useElevation } from "@/contexts/ElevationContext";
import { RoadObj } from "@/store/storeTypes";
import { generateGenericGeometry, type GeometryConfig } from "./geometry";
import { GenericMarkings } from "./shared/GenericMarkings";
import { GenericSelectionIndicators } from "./shared/GenericSelectionIndicators";
import { ROAD_CONFIGS as ENHANCED_ROAD_CONFIGS } from "./configs";

export const Road = EnhancedRoad;
interface EnhancedRoadProps {
  data: RoadObj;
}

function EnhancedRoad({ data }: EnhancedRoadProps) {
  const selectedId = useSceneStore((s) => s.selectedId);
  const { getGridElevation } = useElevation();
  const isSelected = selectedId === data.id;
  const roadConfig = ENHANCED_ROAD_CONFIGS[data.roadType || "residential"];
  const roadWidth = data.width || roadConfig.width;
  const roadColor = data.color || roadConfig.color;
  const roadThickness = data.thickness ?? roadConfig.thickness;
  const visualConfig = roadConfig.visualConfig;

  // Calculate final elevation: grid elevation + object elevation
  const gridElevation = useMemo(() => {
    if (!data.points || data.points.length === 0) return 0;
    // Use the first point to get grid elevation
    const firstPoint = data.points[0];
    return getGridElevation(firstPoint.x, firstPoint.z);
  }, [data.points, getGridElevation]);

  const roadElevation = (data.elevation ?? 0) + gridElevation;
  console.log("🛣️ Rendering Enhanced Road:", {
    id: data.id,
    type: data.roadType,
    points: data.points?.length || 0,
    isSelected,
    width: roadWidth,
    color: roadColor,
  });
  const geometries = useMemo(() => {
    if (!data.points || data.points.length < 2) {
      console.warn("❌ Road insufficient points:", data.points);
      return {
        mainGeometry: new THREE.BufferGeometry(),
        centerLinePoints: [],
        pathPoints: [],
      };
    }
    try {
      // Use generic geometry system for roads
      const config: GeometryConfig = {
        type: "road",
        width: roadWidth,
        thickness: roadThickness,
        elevation: roadElevation,
        segments: 20,
      };

      const geometryResult = generateGenericGeometry(data.points, config);
      return {
        roadGeometry: geometryResult.mainGeometry,
        centerLinePoints: geometryResult.centerLinePoints,
        roadPath: geometryResult.pathPoints,
      };
    } catch (error) {
      console.error("❌ Road geometry error:", error);
      return {
        roadGeometry: new THREE.BufferGeometry(),
        centerLinePoints: [],
        roadPath: [],
      };
    }
  }, [data.points, roadWidth, roadElevation, roadThickness]);
  const hasValidGeometry = useMemo(() => {
    const positionAttribute = geometries.roadGeometry?.attributes.position;
    return !!(
      data.points.length >= 2 &&
      positionAttribute &&
      positionAttribute.count > 0 &&
      geometries.roadGeometry?.index &&
      geometries.roadGeometry.index.count > 0
    );
  }, [data.points.length, geometries.roadGeometry]);
  if (!hasValidGeometry) {
    console.warn("⚠️ Road invalid geometry, not rendering:", data.id);
    return null;
  }
  return (
    <group
      userData={{
        objectId: data.id,
        objectType: "road",
        selectable: true,
        roadType: data.roadType,
        pointCount: data.points.length,
      }}
      position={data.position}
      rotation={data.rotation}
      scale={data.scale}
    >
      <mesh
        geometry={geometries.roadGeometry}
        userData={{
          objectId: data.id,
          objectType: "road",
          selectable: true,
        }}
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
      </mesh>{" "}
      {geometries.centerLinePoints.length > 0 && (
        <GenericMarkings
          centerLinePoints={geometries.centerLinePoints}
          pathPoints={geometries.roadPath || []}
          visualConfig={visualConfig}
          objectWidth={roadWidth}
          objectElevation={roadElevation}
          objectThickness={roadThickness}
          objectType="road"
        />
      )}{" "}
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
          boundingBoxColor: "#00ff00",
          boundingBoxOpacity: 0.1,
        }}
      />{" "}
      {process.env.NODE_ENV === "development" && isSelected && (
        <mesh position={[0, roadElevation + roadThickness + 0.5, 0]}>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial
            color="#00ff00"
            emissive="#00ff00"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
    </group>
  );
}
