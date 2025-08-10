import React from "react";
import { WaterObj } from "@/store/useStore";

interface WaterProps {
  data: WaterObj;
}

export default function Water({ data }: WaterProps) {
  // Use grid dimensions if available, otherwise use defaults
  const gridWidth = data.gridWidth || 2; // Default 2x2 grid
  const gridDepth = data.gridDepth || 2; // Default 2x2 grid
  const gridHeight = data.gridHeight || 0.1; // Default 0.1 grid unit height

  // Convert grid units to actual world units (1 grid unit = 1.0 world unit)
  const gridSize = 1.0;
  const width = gridWidth * gridSize;
  const depth = gridDepth * gridSize;
  const height = gridHeight * gridSize;

  const shape = data.shape || "circular";
  const direction = data.direction || 0;

  if (shape === "rectangular") {
    return (
      <mesh
        position={data.position}
        rotation={[0, direction, 0]}
        scale={[width, height, depth]}
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color="#4FC3F7" transparent opacity={0.8} />
      </mesh>
    );
  }

  // Default to circular - use radius from grid dimensions
  const radius = Math.max(width, depth) / 2;

  return (
    <mesh
      position={data.position}
      rotation={data.rotation}
      scale={[width, height, depth]}
    >
      <cylinderGeometry args={[radius, radius, height, 32]} />
      <meshStandardMaterial color="#4FC3F7" transparent opacity={0.8} />
    </mesh>
  );
}
