// src/components/build-objects/shared/GenericPreview.tsx
import React, { useMemo } from "react";
import * as THREE from "three";
import { DrawingPoint, DrawingPreview, ObjectGeometryResult } from "./types";

interface GenericPreviewProps {
  preview: DrawingPreview;
  generateGeometry?: (
    points: DrawingPoint[],
    variant?: string,
    elevation?: number
  ) => ObjectGeometryResult;
}

export function GenericPreview({
  preview,
  generateGeometry,
}: GenericPreviewProps) {
  const {
    points,
    type,
    color,
    elevation = 0.01,
    opacity = 0.5,
    width,
    radius,
  } = preview;

  // Calculate preview elevation
  const previewElevation = useMemo(() => {
    switch (preview.type) {
      case "road":
      case "residential":
      case "highway":
      case "dirt":
      case "pedestrian":
        return elevation + 0.05; // Roads: preview above final surface
      case "wall":
      case "brick":
      case "concrete":
      case "wood":
      case "stone":
        return elevation + 0.02; // Walls: preview slightly above
      case "water":
      case "pond":
      case "lake":
      case "river":
      case "pool":
        return elevation - 0.005; // Water: preview slightly below surface
      default:
        return elevation + 0.01;
    }
  }, [preview.type, elevation]);

  // Generate preview geometry using provided function or fallback
  const geometries = useMemo(() => {
    if (generateGeometry && points.length >= 2) {
      try {
        return generateGeometry(points, type, previewElevation);
      } catch (error) {
        console.warn("Failed to generate preview geometry:", error);
      }
    }

    // Fallback geometry generation
    return generateFallbackGeometry(points, preview, previewElevation);
  }, [points, type, previewElevation, generateGeometry, preview]);

  if (points.length === 0) return null;

  return (
    <group>
      {/* Main object preview */}
      {geometries.mainGeometry && (
        <mesh geometry={geometries.mainGeometry}>
          <meshStandardMaterial
            color={color}
            transparent
            opacity={opacity}
            depthWrite={false}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      )}

      {/* Point indicators */}
      {points.map((point, index) => (
        <group key={index}>
          {/* Point markers */}
          <mesh position={[point.x, previewElevation + 0.05, point.z]}>
            <sphereGeometry args={[0.08]} />
            <meshStandardMaterial
              color={
                index === 0
                  ? "#00ff00" // Green for start
                  : index === points.length - 1
                  ? "#ff0000" // Red for end
                  : "#0066ff" // Blue for middle points
              }
              transparent
              opacity={0.9}
              emissive={
                index === 0
                  ? "#004400"
                  : index === points.length - 1
                  ? "#440000"
                  : "#000044"
              }
              emissiveIntensity={0.3}
            />
          </mesh>

          {/* Control point indicators */}
          {point.controlPoint && (
            <>
              <mesh
                position={[
                  point.controlPoint.x,
                  previewElevation + 0.05,
                  point.controlPoint.z,
                ]}
              >
                <boxGeometry args={[0.12, 0.04, 0.12]} />
                <meshStandardMaterial
                  color="#ffff00"
                  transparent
                  opacity={0.8}
                  emissive="#444400"
                  emissiveIntensity={0.2}
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
                        previewElevation + 0.05,
                        point.z,
                        point.controlPoint.x,
                        previewElevation + 0.05,
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
        </group>
      ))}

      {/* Center line preview for multi-point objects */}
      {points.length > 1 && geometries.centerLinePoints.length > 1 && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array(
                  geometries.centerLinePoints.flatMap((p) => [
                    p.x,
                    p.y + 0.01,
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
            opacity={opacity * 1.2}
            linewidth={2}
          />
        </line>
      )}

      {/* Ghost effect for single point objects */}
      {points.length === 1 && (
        <mesh position={[points[0].x, previewElevation, points[0].z]}>
          <cylinderGeometry
            args={[radius || width || 1, radius || width || 1, 0.02, 16]}
          />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={opacity * 0.3}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Construction guidelines */}
      {points.length > 1 && (
        <group>
          {/* Straight line guides between points */}
          {points.map((point, index) => {
            if (index === points.length - 1) return null;

            const nextPoint = points[index + 1];
            return (
              <line key={`guide-${index}`}>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    args={[
                      new Float32Array([
                        point.x,
                        previewElevation + 0.02,
                        point.z,
                        nextPoint.x,
                        previewElevation + 0.02,
                        nextPoint.z,
                      ]),
                      3,
                    ]}
                  />
                </bufferGeometry>
                <lineBasicMaterial
                  color="#ffffff"
                  transparent
                  opacity={0.3}
                  linewidth={1}
                />
              </line>
            );
          })}
        </group>
      )}
    </group>
  );
}

// Fallback geometry generation for when no custom generator is provided
function generateFallbackGeometry(
  points: DrawingPoint[],
  preview: DrawingPreview,
  elevation: number
): ObjectGeometryResult {
  const emptyResult: ObjectGeometryResult = {
    mainGeometry: new THREE.BufferGeometry(),
    pathPoints: [],
    centerLinePoints: [],
  };

  if (points.length === 0) return emptyResult;

  // Single point - create basic shape
  if (points.length === 1) {
    const point = points[0];
    const radius = preview.radius || preview.width || 1;

    let geometry: THREE.BufferGeometry;

    switch (preview.type) {
      case "water":
      case "pond":
      case "lake":
      case "river":
      case "pool":
        geometry = new THREE.CircleGeometry(radius, 16);
        break;
      case "wall":
      case "brick":
      case "concrete":
      case "wood":
      case "stone":
        geometry = new THREE.BoxGeometry(0.5, preview.thickness || 0.1, 0.5);
        break;
      default:
        geometry = new THREE.CircleGeometry(0.3, 8);
        break;
    }

    geometry.rotateX(-Math.PI / 2);
    geometry.translate(point.x, elevation, point.z);

    return {
      mainGeometry: geometry,
      pathPoints: [new THREE.Vector3(point.x, elevation, point.z)],
      centerLinePoints: [new THREE.Vector3(point.x, elevation, point.z)],
    };
  }

  // Multi-point - create path-based geometry
  const pathPoints = points.map((p) => new THREE.Vector3(p.x, elevation, p.z));
  const width = preview.width || 2;

  // Simple extruded path geometry
  const vertices: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i < pathPoints.length; i++) {
    const point = pathPoints[i];

    // Calculate direction for width extrusion
    let direction: THREE.Vector3;
    if (i === 0) {
      direction = pathPoints[1].clone().sub(point).normalize();
    } else if (i === pathPoints.length - 1) {
      direction = point
        .clone()
        .sub(pathPoints[i - 1])
        .normalize();
    } else {
      const prev = pathPoints[i - 1].clone().sub(point).normalize();
      const next = pathPoints[i + 1].clone().sub(point).normalize();
      direction = prev.add(next).normalize();
    }

    const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x);
    const halfWidth = width / 2;

    // Left and right vertices
    const left = point
      .clone()
      .add(perpendicular.clone().multiplyScalar(halfWidth));
    const right = point
      .clone()
      .add(perpendicular.clone().multiplyScalar(-halfWidth));

    vertices.push(left.x, left.y, left.z);
    vertices.push(right.x, right.y, right.z);

    // Create triangles
    if (i < pathPoints.length - 1) {
      const base = i * 2;
      indices.push(base, base + 2, base + 1);
      indices.push(base + 1, base + 2, base + 3);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return {
    mainGeometry: geometry,
    pathPoints,
    centerLinePoints: pathPoints,
  };
}

export default GenericPreview;
