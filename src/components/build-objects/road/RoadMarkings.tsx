// src/components/build-objects/road/RoadMarkings.tsx
import React from "react";
import * as THREE from "three";
import { RoadConfig } from "./roadConfig";

interface RoadMarkingsProps {
  centerLinePoints: THREE.Vector3[];
  roadPath: THREE.Vector3[];
  roadConfig: RoadConfig;
  roadWidth: number;
}

export function RoadMarkings({
  centerLinePoints,
  roadPath,
  roadConfig,
  roadWidth,
}: RoadMarkingsProps) {
  // Center line geometry
  const centerLineGeometry = React.useMemo(() => {
    if (!roadConfig.centerLine || centerLinePoints.length === 0) {
      return null;
    }
    const geometry = new THREE.BufferGeometry();
    const vertices = centerLinePoints.flatMap((p) => [p.x, p.y + 0.001, p.z]);
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    return geometry;
  }, [centerLinePoints, roadConfig.centerLine]);

  // Side line geometries
  const sideLineGeometries = React.useMemo(() => {
    if (!roadConfig.sideLines || roadPath.length === 0) {
      return { left: null, right: null };
    }

    const halfWidth = roadWidth / 2;
    const leftPoints: THREE.Vector3[] = [];
    const rightPoints: THREE.Vector3[] = [];

    for (let i = 0; i < roadPath.length; i++) {
      const point = roadPath[i];
      let direction: THREE.Vector3;

      if (i === 0 && roadPath.length > 1) {
        direction = roadPath[i + 1].clone().sub(point).normalize();
      } else if (i === roadPath.length - 1) {
        direction = point
          .clone()
          .sub(roadPath[i - 1])
          .normalize();
      } else {
        const prev = roadPath[i - 1].clone().sub(point).normalize();
        const next = roadPath[i + 1].clone().sub(point).normalize();
        direction = prev.add(next).normalize();
      }

      const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x);
      leftPoints.push(
        point.clone().add(perpendicular.clone().multiplyScalar(halfWidth * 0.9))
      );
      rightPoints.push(
        point
          .clone()
          .add(perpendicular.clone().multiplyScalar(-halfWidth * 0.9))
      );
    }

    const leftGeometry = new THREE.BufferGeometry();
    const rightGeometry = new THREE.BufferGeometry();

    leftGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        leftPoints.flatMap((p) => [p.x, p.y + 0.001, p.z]),
        3
      )
    );
    rightGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        rightPoints.flatMap((p) => [p.x, p.y + 0.001, p.z]),
        3
      )
    );

    return { left: leftGeometry, right: rightGeometry };
  }, [roadPath, roadConfig.sideLines, roadWidth]);

  return (
    <group>
      {/* Center line */}
      {centerLineGeometry && (
        <line>
          <bufferGeometry attach="geometry">
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array(
                  centerLinePoints.flatMap((p) => [p.x, p.y + 0.001, p.z])
                ),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={roadConfig.centerLineColor}
            linewidth={roadConfig.centerLineWidth * 10}
          />
        </line>
      )}

      {/* Side lines */}
      {sideLineGeometries.left && (
        <line>
          <bufferGeometry attach="geometry">
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array(
                  sideLineGeometries.left.attributes.position.array
                ),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={roadConfig.sideLineColor}
            linewidth={roadConfig.sideLineWidth * 10}
          />
        </line>
      )}

      {sideLineGeometries.right && (
        <line>
          <bufferGeometry attach="geometry">
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array(
                  sideLineGeometries.right.attributes.position.array
                ),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={roadConfig.sideLineColor}
            linewidth={roadConfig.sideLineWidth * 10}
          />
        </line>
      )}
    </group>
  );
}
