import React from "react";
import * as THREE from "three";
import { WaterObj } from "@/store/storeTypes";
import { useStore, StoreState } from "@/store";

interface WaterProps {
  data: WaterObj;
}

export default function Water({ data }: WaterProps) {
  const groupRef = React.useRef<THREE.Group>(null);
  const selectedId = useStore((s: StoreState) => s.selectedId);

  React.useEffect(() => {
    if (!groupRef.current) return;
    groupRef.current.traverse((child) => {
      if (child instanceof THREE.Object3D) {
        child.userData.objectId = data.id;
      }
    });
  }, [data.id]);

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

  // Convert direction to rotation if direction is provided
  const rotation: [number, number, number] =
    data.direction !== undefined
      ? [0, (data.direction * Math.PI) / 180, 0]
      : data.rotation;

  if (shape === "rectangular") {
    return (
      <group
        ref={groupRef}
        position={data.position}
        rotation={rotation}
        scale={[width, height, depth]}
      >
        {/* highlight bounding when selected */}
        {selectedId === data.id && (
          <mesh position={[0, height / 2, 0]}>
            <boxGeometry args={[width + 0.2, height + 0.2, depth + 0.2]} />
            <meshBasicMaterial
              color="yellow"
              wireframe
              transparent
              opacity={0.4}
            />
          </mesh>
        )}
        <mesh>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial color="#4FC3F7" transparent opacity={0.8} />
        </mesh>
      </group>
    );
  }

  // Default to circular - use radius from grid dimensions
  const radius = Math.max(width, depth) / 2;

  return (
    <group
      ref={groupRef}
      position={data.position}
      rotation={rotation}
      scale={[width, height, depth]}
    >
      {/* highlight bounding when selected */}
      {selectedId === data.id && (
        <mesh position={[0, height / 2, 0]}>
          <boxGeometry
            args={[radius * 2 + 0.2, height + 0.2, radius * 2 + 0.2]}
          />
          <meshBasicMaterial
            color="yellow"
            wireframe
            transparent
            opacity={0.4}
          />
        </mesh>
      )}
      <mesh>
        <cylinderGeometry args={[radius, radius, height, 32]} />
        <meshStandardMaterial color="#4FC3F7" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}
