import React, { useMemo } from "react";
import * as THREE from "three";
import { useEditor, RoadObj } from "@/contexts/EditorContext";
import { generateRoadGeometry } from "./road/roadGeometry";
import { getRoadConfig } from "./road/roadConfig";
import { RoadMarkings } from "./road/RoadMarkings";
import { RoadSelectionIndicators } from "./road/RoadSelectionIndicators";

interface RoadComponentProps {
  data: RoadObj;
}

export function Road({ data }: RoadComponentProps) {
  const { selectedId } = useEditor();
  const isSelected = selectedId === data.id;

  // Get road configuration with proper defaults
  const roadConfig = getRoadConfig(data.roadType || "residential");
  const roadWidth = data.width || roadConfig.width;
  const roadColor = data.color || roadConfig.color;
  const roadElevation = data.elevation ?? roadConfig.elevation;
  const roadThickness = data.thickness ?? roadConfig.thickness;

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

  // Generate road geometry
  const geometries = useMemo(() => {
    if (!data.points || data.points.length < 2) {
      console.log("❌ Not enough points for road:", data.points);
      return {
        roadGeometry: new THREE.BufferGeometry(),
        centerLinePoints: [],
        roadPath: [],
      };
    }

    console.log("🏗️ Generating road geometry for points:", data.points);
    try {
      const result = generateRoadGeometry(
        data.points,
        roadWidth,
        roadElevation,
        roadThickness
      );
      console.log("✅ Generated geometry:", {
        hasGeometry: !!result.roadGeometry,
        vertexCount: result.roadGeometry.attributes.position?.count || 0,
        pathLength: result.roadPath.length,
        indexCount: result.roadGeometry.index?.count || 0,
      });
      return result;
    } catch (error) {
      console.error("❌ Error generating road geometry:", error);
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
    const hasPosition = !!positionAttribute;
    const hasVertices = positionAttribute ? positionAttribute.count > 0 : false;
    const hasIndex = !!geometries.roadGeometry.index;
    const hasTriangles = hasIndex
      ? (geometries.roadGeometry.index?.count || 0) > 0
      : false;

    const isValid =
      data.points.length >= 2 && hasPosition && hasVertices && hasTriangles;

    console.log("Road geometry validation:", {
      pointsLength: data.points.length,
      hasPosition,
      hasVertices,
      vertexCount: positionAttribute?.count || 0,
      hasIndex,
      hasTriangles,
      triangleCount: hasIndex
        ? (geometries.roadGeometry.index?.count || 0) / 3
        : 0,
      isValid,
    });

    return isValid;
  }, [data.points.length, geometries.roadGeometry]);

  // Early return if invalid geometry
  if (!hasValidGeometry) {
    console.log("❌ Road not rendering - invalid geometry for road:", data.id);

    // Fallback simple road for debugging
    if (data.points.length >= 2) {
      const start = data.points[0];
      const end = data.points[data.points.length - 1];
      const distance = Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.z - start.z, 2)
      );

      return (
        <group
          userData={{ objectId: data.id }}
          position={data.position}
          rotation={data.rotation}
          scale={data.scale}
        >
          {/* Fallback simple road surface */}
          <mesh
            position={[
              (start.x + end.x) / 2,
              roadElevation + roadThickness / 2,
              (start.z + end.z) / 2,
            ]}
            userData={{ objectId: data.id }}
          >
            <boxGeometry args={[distance, roadThickness, roadWidth]} />
            <meshStandardMaterial
              color={roadColor}
              emissive={
                isSelected
                  ? new THREE.Color(0x004400)
                  : new THREE.Color(0x000000)
              }
              emissiveIntensity={isSelected ? 0.2 : 0}
            />
          </mesh>

          {/* Debug indicator */}
          <mesh
            position={[
              (start.x + end.x) / 2,
              roadElevation + roadThickness + 0.1,
              (start.z + end.z) / 2,
            ]}
          >
            <sphereGeometry args={[0.2]} />
            <meshStandardMaterial color="#ff0000" />
          </mesh>
        </group>
      );
    }

    return null;
  }

  console.log("✅ Road rendering successfully with ID:", data.id);

  return (
    <group
      userData={{ objectId: data.id }}
      position={data.position}
      rotation={data.rotation}
      scale={data.scale}
    >
      {/* Main road surface */}
      <mesh
        geometry={geometries.roadGeometry}
        userData={{ objectId: data.id }}
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
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Road markings (center line, side lines, curbs) */}
      {geometries.centerLinePoints.length > 0 && (
        <RoadMarkings
          centerLinePoints={geometries.centerLinePoints}
          roadPath={geometries.roadPath}
          roadConfig={roadConfig}
          roadWidth={roadWidth}
          roadElevation={roadElevation}
        />
      )}

      {/* Selection indicators */}
      <RoadSelectionIndicators
        points={data.points}
        isSelected={isSelected}
        roadElevation={roadElevation}
      />

      {/* Debug info for selected roads */}
      {isSelected && (
        <>
          {/* Bounding box */}
          <mesh position={[0, roadElevation + roadThickness / 2, 0]}>
            <boxGeometry args={[roadWidth * 2, roadThickness, roadWidth * 2]} />
            <meshStandardMaterial
              color="#00ff00"
              transparent
              opacity={0.1}
              wireframe
            />
          </mesh>

          {/* Point indicators */}
          {data.points.map((point, index) => (
            <mesh
              key={index}
              position={[point.x, roadElevation + roadThickness + 0.2, point.z]}
            >
              <sphereGeometry args={[0.1]} />
              <meshStandardMaterial
                color={
                  index === 0
                    ? "#00ff00"
                    : index === data.points.length - 1
                    ? "#ff0000"
                    : "#0000ff"
                }
              />
            </mesh>
          ))}
        </>
      )}

      {/* Success indicator for debugging */}
      {process.env.NODE_ENV === "development" && (
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
