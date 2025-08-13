// src/components/build-objects/road/RoadSelectionIndicators.tsx
import React from "react";
import { RoadPoint } from "@/store/storeTypes";

interface RoadSelectionIndicatorsProps {
  points: RoadPoint[];
  isSelected: boolean;
  roadElevation: number;
}

export function RoadSelectionIndicators({
  points,
  isSelected,
  roadElevation,
}: RoadSelectionIndicatorsProps) {
  if (!isSelected) return null;

  const indicatorHeight = roadElevation + 0.15; // Show indicators above road surface

  return (
    <group>
      {/* Point indicators */}
      {points.map((point, index) => (
        <mesh key={index} position={[point.x, indicatorHeight, point.z]}>
          <sphereGeometry args={[0.15]} />
          <meshStandardMaterial
            color={
              index === 0
                ? "#00ff00"
                : index === points.length - 1
                ? "#ff0000"
                : "#0066ff"
            }
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}

      {/* Control points for curves */}
      {points.map(
        (point, index) =>
          point.controlPoint && (
            <group key={`control-${index}`}>
              <mesh
                position={[point.controlPoint.x, indicatorHeight, point.controlPoint.z]}
              >
                <boxGeometry args={[0.2, 0.1, 0.2]} />
                <meshStandardMaterial
                  color="#ffff00"
                  transparent
                  opacity={0.7}
                />
              </mesh>
              {/* Control line */}
              <line>
                <bufferGeometry attach="geometry">
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
                <lineBasicMaterial color="#ffff00" />
              </line>
            </group>
          )
      )}
    </group>
  );
}

