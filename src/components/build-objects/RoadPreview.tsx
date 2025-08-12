import React, { useMemo } from "react";
import * as THREE from "three";
import { RoadPoint } from "@/store/storeTypes";

interface RoadPreviewProps {
  points: RoadPoint[];
  width: number;
  color: string;
  opacity?: number;
}

function generatePreviewGeometry(
  roadPoints: RoadPoint[],
  width: number
): {
  roadGeometry: THREE.BufferGeometry;
  centerLinePoints: THREE.Vector3[];
} {
  if (roadPoints.length < 1) {
    return {
      roadGeometry: new THREE.BufferGeometry(),
      centerLinePoints: [],
    };
  }

  if (roadPoints.length === 1) {
    // Single point - show a circle
    const point = roadPoints[0];
    const circleGeometry = new THREE.CircleGeometry(width / 2, 16);
    circleGeometry.rotateX(-Math.PI / 2);
    circleGeometry.translate(point.x, 0.001, point.z);

    return {
      roadGeometry: circleGeometry,
      centerLinePoints: [new THREE.Vector3(point.x, 0.001, point.z)],
    };
  }

  // Multiple points - create road segments
  const roadPath: THREE.Vector3[] = [];
  const roadVertices: number[] = [];
  const roadIndices: number[] = [];

  // Generate path points
  for (let i = 0; i < roadPoints.length - 1; i++) {
    const start = new THREE.Vector3(roadPoints[i].x, 0.001, roadPoints[i].z);
    const end = new THREE.Vector3(
      roadPoints[i + 1].x,
      0.001,
      roadPoints[i + 1].z
    );

    if (roadPoints[i].controlPoint) {
      const control = new THREE.Vector3(
        roadPoints[i].controlPoint!.x,
        0.001,
        roadPoints[i].controlPoint!.z
      );
      // Create bezier curve
      for (let t = 0; t <= 1; t += 0.05) {
        const point = new THREE.Vector3()
          .copy(start)
          .multiplyScalar((1 - t) * (1 - t))
          .add(control.clone().multiplyScalar(2 * (1 - t) * t))
          .add(end.clone().multiplyScalar(t * t));
        roadPath.push(point);
      }
    } else {
      if (i === 0) roadPath.push(start);
      roadPath.push(end);
    }
  }

  // Generate road geometry from path
  const halfWidth = width / 2;
  let vertexIndex = 0;

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

    const leftPoint = point
      .clone()
      .add(perpendicular.clone().multiplyScalar(halfWidth));
    const rightPoint = point
      .clone()
      .add(perpendicular.clone().multiplyScalar(-halfWidth));

    roadVertices.push(
      leftPoint.x,
      leftPoint.y,
      leftPoint.z,
      rightPoint.x,
      rightPoint.y,
      rightPoint.z
    );

    if (i > 0) {
      const baseIndex = vertexIndex - 2;
      roadIndices.push(
        baseIndex,
        baseIndex + 1,
        baseIndex + 2,
        baseIndex + 1,
        baseIndex + 3,
        baseIndex + 2
      );
    }

    vertexIndex += 2;
  }

  const roadGeometry = new THREE.BufferGeometry();
  roadGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(roadVertices, 3)
  );
  roadGeometry.setIndex(roadIndices);
  roadGeometry.computeVertexNormals();

  return {
    roadGeometry,
    centerLinePoints: roadPath,
  };
}

export function RoadPreview({
  points,
  width,
  color,
  opacity = 0.7,
}: RoadPreviewProps) {
  const geometries = useMemo(() => {
    return generatePreviewGeometry(points, width);
  }, [points, width]);

  const centerLineGeometry = useMemo(() => {
    if (geometries.centerLinePoints.length < 2) return null;

    const geometry = new THREE.BufferGeometry();
    const vertices = geometries.centerLinePoints.flatMap((p) => [
      p.x,
      p.y + 0.002,
      p.z,
    ]);
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    return geometry;
  }, [geometries.centerLinePoints]);

  if (points.length === 0) return null;

  return (
    <group>
      {/* Road surface preview */}
      <mesh geometry={geometries.roadGeometry}>
        <meshStandardMaterial
          color={color}
          transparent
          opacity={opacity}
          depthWrite={false}
        />
      </mesh>

      {/* Center line preview */}
      {centerLineGeometry && (
        <line>
          <bufferGeometry attach="geometry">
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array(
                  geometries.centerLinePoints.flatMap((p) => [
                    p.x,
                    p.y + 0.002,
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
            linewidth={2}
          />
        </line>
      )}

      {/* Point indicators */}
      {points.map((point, index) => (
        <group key={index}>
          {/* Main point */}
          <mesh position={[point.x, 0.02, point.z]}>
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
              opacity={0.9}
            />
          </mesh>

          {/* Control point */}
          {point.controlPoint && (
            <>
              <mesh
                position={[point.controlPoint.x, 0.02, point.controlPoint.z]}
              >
                <boxGeometry args={[0.2, 0.05, 0.2]} />
                <meshStandardMaterial
                  color="#ffff00"
                  transparent
                  opacity={0.8}
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
                        0.02,
                        point.z,
                        point.controlPoint.x,
                        0.02,
                        point.controlPoint.z,
                      ]),
                      3,
                    ]}
                  />
                </bufferGeometry>
                <lineBasicMaterial color="#ffff00" transparent opacity={0.6} />
              </line>
            </>
          )}

          {/* Point label */}
          <sprite position={[point.x, 0.5, point.z]} scale={[0.5, 0.25, 1]}>
            <spriteMaterial color="#ffffff" transparent opacity={0.9} />
          </sprite>
        </group>
      ))}

      {/* Drawing instructions */}
      {points.length > 0 && (
        <sprite
          position={[
            points[points.length - 1].x,
            1,
            points[points.length - 1].z,
          ]}
          scale={[2, 0.5, 1]}
        >
          <spriteMaterial color="#ffffff" transparent opacity={0.8} />
        </sprite>
      )}
    </group>
  );
}

export default RoadPreview;
