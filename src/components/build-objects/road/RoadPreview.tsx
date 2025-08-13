// src/components/build-objects/road/RoadPreview.tsx - Fixed with Elevation
import React, { useMemo } from "react";
import { RoadPoint } from "@/store/storeTypes";
import { generatePreviewGeometry } from "./roadGeometry";

interface RoadPreviewProps {
  points: RoadPoint[];
  width: number;
  color: string;
  opacity?: number;
  elevation?: number;
}

export function RoadPreview({
  points,
  width,
  color,
  opacity = 0.5,
  elevation = 0.01,
}: RoadPreviewProps) {
  const geometries = useMemo(() => {
    return generatePreviewGeometry(points, width, elevation, 0.02);
  }, [points, width, elevation]);

  if (points.length === 0) return null;

  const previewHeight = elevation + 0.05; // Show preview slightly above final road

  return (
    <group>
      {/* Road surface preview */}
      {geometries.roadGeometry && (
        <mesh geometry={geometries.roadGeometry}>
          <meshStandardMaterial
            color={color}
            transparent
            opacity={opacity}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Simple point indicators - no large circles */}
      {points.map((point, index) => (
        <group key={index}>
          {/* Small point markers */}
          <mesh position={[point.x, previewHeight, point.z]}>
            <sphereGeometry args={[0.1]} />
            <meshStandardMaterial
              color={
                index === 0
                  ? "#00ff00" // Green for start
                  : index === points.length - 1
                  ? "#ff0000" // Red for end
                  : "#0066ff" // Blue for middle points
              }
              transparent
              opacity={0.8}
            />
          </mesh>

          {/* Control point indicators - only if they exist */}
          {point.controlPoint && (
            <>
              <mesh
                position={[point.controlPoint.x, previewHeight, point.controlPoint.z]}
              >
                <boxGeometry args={[0.15, 0.05, 0.15]} />
                <meshStandardMaterial
                  color="#ffff00"
                  transparent
                  opacity={0.6}
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
                        previewHeight,
                        point.z,
                        point.controlPoint.x,
                        previewHeight,
                        point.controlPoint.z,
                      ]),
                      3,
                    ]}
                  />
                </bufferGeometry>
                <lineBasicMaterial color="#ffff00" transparent opacity={0.4} />
              </line>
            </>
          )}
        </group>
      ))}

      {/* Center line preview for multi-point roads */}
      {points.length > 1 && geometries.centerLinePoints.length > 1 && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array(
                  geometries.centerLinePoints.flatMap((p) => [
                    p.x,
                    p.y + 0.005,
                    p.z,
                  ])
                ),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#ffff00"
            transparent
            opacity={opacity * 0.8}
            linewidth={1}
          />
        </line>
      )}
    </group>
  );
}

export default RoadPreview;

