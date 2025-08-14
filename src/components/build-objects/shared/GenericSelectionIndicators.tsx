// src/components/build-objects/shared/GenericSelectionIndicators.tsx
import React, { useMemo } from "react";
import * as THREE from "three";
import { DrawingPoint, SelectionConfig } from "./types";

interface GenericSelectionIndicatorsProps {
  points: DrawingPoint[];
  isSelected: boolean;
  objectElevation: number;
  objectThickness?: number;
  objectType: string;
  objectWidth?: number;
  objectDepth?: number;
  config?: Partial<SelectionConfig>;
}

const defaultSelectionConfig: SelectionConfig = {
  pointColor: {
    start: "#00ff00",
    end: "#ff0000",
    middle: "#0066ff",
    control: "#ffff00",
  },
  pointSize: 0.15,
  controlPointSize: 0.1,
  controlLineColor: "#ffff00",
  boundingBoxColor: "#00ff00",
  boundingBoxOpacity: 0.1,
};

export function GenericSelectionIndicators({
  points,
  isSelected,
  objectElevation,
  objectThickness = 0.1,
  objectType,
  objectWidth,
  objectDepth,
  config,
}: GenericSelectionIndicatorsProps) {
  const selectionConfig = useMemo(
    () => ({
      ...defaultSelectionConfig,
      ...config,
    }),
    [config]
  );

  const indicatorHeight = useMemo(() => {
    switch (objectType) {
      case "road":
        return objectElevation + objectThickness + 0.15;
      case "wall":
        return objectElevation + objectThickness + 0.2;
      case "water":
        return objectElevation + 0.1;
      default:
        return objectElevation + objectThickness + 0.15;
    }
  }, [objectElevation, objectThickness, objectType]);

  // Calculate bounding box for multi-point objects
  const boundingBox = useMemo(() => {
    if (points.length === 0) return null;

    const xs = points.map((p) => p.x);
    const zs = points.map((p) => p.z);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minZ = Math.min(...zs);
    const maxZ = Math.max(...zs);

    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;
    const width = objectWidth || Math.max(maxX - minX, 1);
    const depth = objectDepth || Math.max(maxZ - minZ, 1);

    return {
      center: { x: centerX, z: centerZ },
      size: { width, depth, height: objectThickness },
    };
  }, [points, objectWidth, objectDepth, objectThickness]);

  // Generate path lines between points
  const pathLines = useMemo(() => {
    if (points.length < 2) return [];

    const lines: Array<{
      start: THREE.Vector3;
      end: THREE.Vector3;
      isCurved: boolean;
    }> = [];

    for (let i = 0; i < points.length - 1; i++) {
      const start = new THREE.Vector3(
        points[i].x,
        indicatorHeight,
        points[i].z
      );
      const end = new THREE.Vector3(
        points[i + 1].x,
        indicatorHeight,
        points[i + 1].z
      );

      lines.push({
        start,
        end,
        isCurved: !!points[i].controlPoint,
      });
    }

    return lines;
  }, [points, indicatorHeight]);

  if (!isSelected) return null;

  return (
    <group>
      {/* Point indicators */}
      {points.map((point, index) => {
        const isStart = index === 0;
        const isEnd = index === points.length - 1;
        const isMiddle = !isStart && !isEnd;

        const color = isStart
          ? selectionConfig.pointColor.start
          : isEnd
          ? selectionConfig.pointColor.end
          : selectionConfig.pointColor.middle;

        return (
          <mesh
            key={`point-${index}`}
            position={[point.x, indicatorHeight, point.z]}
          >
            <sphereGeometry args={[selectionConfig.pointSize]} />
            <meshStandardMaterial
              color={color}
              transparent
              opacity={0.8}
              emissive={color}
              emissiveIntensity={0.2}
            />
          </mesh>
        );
      })}

      {/* Control points for curves */}
      {points.map(
        (point, index) =>
          point.controlPoint && (
            <group key={`control-${index}`}>
              {/* Control point indicator */}
              <mesh
                position={[
                  point.controlPoint.x,
                  indicatorHeight,
                  point.controlPoint.z,
                ]}
              >
                <boxGeometry
                  args={[
                    selectionConfig.controlPointSize * 1.5,
                    selectionConfig.controlPointSize,
                    selectionConfig.controlPointSize * 1.5,
                  ]}
                />
                <meshStandardMaterial
                  color={selectionConfig.pointColor.control}
                  transparent
                  opacity={0.7}
                  emissive={selectionConfig.pointColor.control}
                  emissiveIntensity={0.3}
                />
              </mesh>

              {/* Control line */}
              <line>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    args={[
                      new Float32Array([
                        point.x,
                        indicatorHeight,
                        point.z,
                        point.controlPoint.x,
                        indicatorHeight,
                        point.controlPoint.z,
                      ]),
                      3,
                    ]}
                  />
                </bufferGeometry>
                <lineBasicMaterial
                  color={selectionConfig.controlLineColor}
                  transparent
                  opacity={0.5}
                  linewidth={2}
                />
              </line>
            </group>
          )
      )}

      {/* Path lines between points */}
      {pathLines.map((line, index) => (
        <line key={`path-${index}`}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array([
                  line.start.x,
                  line.start.y,
                  line.start.z,
                  line.end.x,
                  line.end.y,
                  line.end.z,
                ]),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={line.isCurved ? "#ff9900" : "#00aaff"}
            transparent
            opacity={0.6}
            linewidth={line.isCurved ? 3 : 2}
            linecap="round"
          />
        </line>
      ))}

      {/* Bounding box for complex objects */}
      {boundingBox && points.length > 1 && (
        <mesh
          position={[
            boundingBox.center.x,
            objectElevation + boundingBox.size.height / 2,
            boundingBox.center.z,
          ]}
        >
          <boxGeometry
            args={[
              boundingBox.size.width + 0.2,
              boundingBox.size.height + 0.2,
              boundingBox.size.depth + 0.2,
            ]}
          />
          <meshBasicMaterial
            color={selectionConfig.boundingBoxColor}
            transparent
            opacity={selectionConfig.boundingBoxOpacity}
            wireframe
          />
        </mesh>
      )}

      {/* Object type indicator */}
      <mesh
        position={[points[0]?.x || 0, indicatorHeight + 0.3, points[0]?.z || 0]}
      >
        <sphereGeometry args={[0.05]} />
        <meshStandardMaterial
          color={
            objectType === "road"
              ? "#404040"
              : objectType === "wall"
              ? "#bfbfbf"
              : objectType === "water"
              ? "#4FC3F7"
              : "#ffffff"
          }
          emissive={
            objectType === "road"
              ? "#404040"
              : objectType === "wall"
              ? "#bfbfbf"
              : objectType === "water"
              ? "#4FC3F7"
              : "#ffffff"
          }
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Point count indicator for complex objects */}
      {points.length > 3 && (
        <mesh
          position={[
            boundingBox?.center.x || points[0].x,
            indicatorHeight + 0.5,
            boundingBox?.center.z || points[0].z,
          ]}
        >
          <sphereGeometry args={[0.08]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={0.3}
          />
        </mesh>
      )}

      {/* Direction indicators for linear objects */}
      {points.length >= 2 && objectType !== "water" && (
        <group>
          {/* Start direction arrow */}
          <mesh
            position={[points[0].x, indicatorHeight + 0.1, points[0].z]}
            lookAt={[points[1].x, indicatorHeight + 0.1, points[1].z]}
          >
            <coneGeometry args={[0.05, 0.15, 4]} />
            <meshStandardMaterial
              color={selectionConfig.pointColor.start}
              transparent
              opacity={0.7}
            />
          </mesh>

          {/* End direction arrow */}
          <mesh
            position={[
              points[points.length - 1].x,
              indicatorHeight + 0.1,
              points[points.length - 1].z,
            ]}
            lookAt={[
              points[points.length - 2].x,
              indicatorHeight + 0.1,
              points[points.length - 2].z,
            ]}
          >
            <coneGeometry args={[0.05, 0.15, 4]} />
            <meshStandardMaterial
              color={selectionConfig.pointColor.end}
              transparent
              opacity={0.7}
            />
          </mesh>
        </group>
      )}

      {/* Debug information in development */}
      {process.env.NODE_ENV === "development" && (
        <mesh
          position={[
            points[0]?.x || 0,
            indicatorHeight + 0.8,
            points[0]?.z || 0,
          ]}
        >
          <sphereGeometry args={[0.03]} />
          <meshStandardMaterial
            color="#ff00ff"
            emissive="#ff00ff"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}
    </group>
  );
}

export default GenericSelectionIndicators;
