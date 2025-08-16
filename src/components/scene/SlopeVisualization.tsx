// src/components/scene/SlopeVisualization.tsx
import React, { useMemo, useCallback } from "react";
import * as THREE from "three";
import { useTerrainEditing } from "@/contexts/TerrainEditingContext";
import { useElevation } from "@/contexts/ElevationContext";

interface SlopeVisualizationProps {
  gridSize: number;
  segments: number;
  opacity?: number;
}

export function SlopeVisualization({
  gridSize,
  segments,
  opacity = 0.7,
}: SlopeVisualizationProps) {
  const {
    showSlopeVisualization,
    showContourLines,
    slopeVisualizationType,
    calculateSlope,
  } = useTerrainEditing();

  const { gridElevation } = useElevation();

  // Generate slope visualization geometry
  const slopeGeometry = useMemo(() => {
    if (!showSlopeVisualization) return null;

    const geometry = new THREE.PlaneGeometry(
      gridSize,
      gridSize,
      segments,
      segments
    );
    const positions = geometry.attributes.position.array as Float32Array;
    const colors: number[] = [];

    // Calculate slope for each vertex
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];
      const elevation = gridElevation[`${Math.round(x)},${Math.round(z)}`] || 0;

      // Calculate slope
      const slope = calculateSlope([x, z]);

      // Color based on slope angle
      let color: THREE.Color;
      switch (slopeVisualizationType) {
        case "color":
          color = getSlopeColor(slope.angle);
          break;
        case "heatmap":
          color = getHeatmapColor(slope.angle);
          break;
        case "arrows":
          color = new THREE.Color(0x00ff00); // Green for arrows
          break;
        default:
          color = new THREE.Color(0x00ff00);
      }

      colors.push(color.r, color.g, color.b);
    }

    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  }, [
    gridSize,
    segments,
    showSlopeVisualization,
    slopeVisualizationType,
    gridElevation,
    calculateSlope,
  ]);

  // Generate contour lines
  const contourLines = useMemo(() => {
    if (!showContourLines) return null;

    const lines: THREE.Group = new THREE.Group();
    const contourIntervals = [1, 2, 5, 10, 15, 20]; // Elevation intervals
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: opacity * 0.5,
    });

    // Generate contour lines for each elevation interval
    contourIntervals.forEach((interval) => {
      const points: THREE.Vector3[] = [];

      // Sample grid points at this elevation
      for (let x = -gridSize / 2; x <= gridSize / 2; x += 1) {
        for (let z = -gridSize / 2; z <= gridSize / 2; z += 1) {
          const elevation =
            gridElevation[`${Math.round(x)},${Math.round(z)}`] || 0;

          // Check if this point is close to the contour interval
          if (Math.abs(elevation - interval) < 0.5) {
            points.push(new THREE.Vector3(x, elevation + 0.01, z));
          }
        }
      }

      // Create line geometry from points
      if (points.length > 1) {
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMaterial);
        lines.add(line);
      }
    });

    return lines;
  }, [gridSize, showContourLines, gridElevation, opacity]);

  // Generate slope direction arrows
  const slopeArrows = useMemo(() => {
    if (slopeVisualizationType !== "arrows") return null;

    const arrows: THREE.Group = new THREE.Group();
    const arrowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: opacity,
    });

    // Sample points for arrows
    const sampleInterval = 5;
    for (let x = -gridSize / 2; x <= gridSize / 2; x += sampleInterval) {
      for (let z = -gridSize / 2; z <= gridSize / 2; z += sampleInterval) {
        const slope = calculateSlope([x, z]);

        // Only show arrows for significant slopes
        if (slope.angle > 5) {
          const arrowGeometry = new THREE.ConeGeometry(0.2, 0.5, 4);
          const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);

          // Position arrow
          arrow.position.set(x, slope.angle * 0.1 + 0.1, z);

          // Rotate arrow to show slope direction
          arrow.rotation.y = (slope.direction * Math.PI) / 180;
          arrow.rotation.x = -(slope.angle * Math.PI) / 180;

          arrows.add(arrow);
        }
      }
    }

    return arrows;
  }, [gridSize, slopeVisualizationType, calculateSlope, opacity]);

  if (!showSlopeVisualization && !showContourLines) return null;

  return (
    <group>
      {/* Slope color overlay */}
      {slopeGeometry && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <primitive object={slopeGeometry} />
          <meshStandardMaterial
            vertexColors
            transparent
            opacity={opacity * 0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Contour lines */}
      {contourLines && <primitive object={contourLines} />}

      {/* Slope direction arrows */}
      {slopeArrows && <primitive object={slopeArrows} />}
    </group>
  );
}

// Helper function to get slope color based on angle
function getSlopeColor(angle: number): THREE.Color {
  // Green (flat) -> Yellow (moderate) -> Red (steep)
  const normalizedAngle = Math.min(angle / 45, 1); // Normalize to 0-1

  if (normalizedAngle < 0.5) {
    // Green to Yellow
    const t = normalizedAngle * 2;
    return new THREE.Color().setHSL(0.33 - t * 0.17, 1, 0.5);
  } else {
    // Yellow to Red
    const t = (normalizedAngle - 0.5) * 2;
    return new THREE.Color().setHSL(0.17 - t * 0.17, 1, 0.5);
  }
}

// Helper function to get heatmap color
function getHeatmapColor(angle: number): THREE.Color {
  // Blue (flat) -> Green -> Yellow -> Red (steep)
  const normalizedAngle = Math.min(angle / 45, 1); // Normalize to 0-1

  if (normalizedAngle < 0.33) {
    // Blue to Green
    const t = normalizedAngle / 0.33;
    return new THREE.Color().setHSL(0.67 - t * 0.17, 1, 0.5);
  } else if (normalizedAngle < 0.66) {
    // Green to Yellow
    const t = (normalizedAngle - 0.33) / 0.33;
    return new THREE.Color().setHSL(0.5 - t * 0.17, 1, 0.5);
  } else {
    // Yellow to Red
    const t = (normalizedAngle - 0.66) / 0.34;
    return new THREE.Color().setHSL(0.33 - t * 0.17, 1, 0.5);
  }
}

// Brush preview component
interface BrushPreviewProps {
  position: [number, number] | null;
  size: number;
  strength: number;
  falloff: number;
  shape: "circle" | "square" | "gradient";
}

export function BrushPreview({
  position,
  size,
  strength,
  falloff,
  shape,
}: BrushPreviewProps) {
  if (!position) return null;

  const [x, z] = position;

  // Create brush preview geometry based on shape
  let geometry: THREE.BufferGeometry;

  switch (shape) {
    case "circle":
      geometry = new THREE.RingGeometry(size * 0.8, size, 32);
      break;
    case "square":
      geometry = new THREE.PlaneGeometry(size * 2, size * 2);
      break;
    case "gradient":
      geometry = new THREE.RingGeometry(size * 0.5, size, 32);
      break;
    default:
      geometry = new THREE.RingGeometry(size * 0.8, size, 32);
  }

  // Color based on strength (red for raise, blue for lower)
  const color = strength > 0 ? 0xff0000 : 0x0000ff;
  const opacity = Math.abs(strength) * 0.3;

  return (
    <mesh
      position={[x, 0.05, z]}
      rotation={[-Math.PI / 2, 0, 0]}
      userData={{ isBrushPreview: true }}
    >
      <primitive object={geometry} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
