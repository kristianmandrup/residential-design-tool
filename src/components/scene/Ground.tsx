import React, { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";
import { useElevation } from "@/contexts/ElevationContext";

interface GroundProps {
  gridSize?: number;
  segments?: number;
}

export function Ground({ gridSize = 100, segments = 100 }: GroundProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const { gridElevation } = useElevation();

  // Create elevation-based geometry
  const elevationGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(
      gridSize,
      gridSize,
      segments,
      segments
    );
    const positions = geometry.attributes.position.array as Float32Array;

    // Apply grid elevation to vertices
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];

      // Get grid elevation for this position
      const elevation = gridElevation[`${Math.round(x)},${Math.round(z)}`] || 0;
      positions[i + 1] = elevation; // Set y position
    }

    geometry.computeVertexNormals();
    return geometry;
  }, [gridSize, segments, gridElevation]);

  useEffect(() => {
    const createGrassTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      // Brighter grass colors
      const grassColor = "#5cb85c";
      const lightGrassColor = "#7fd27f";
      const darkGrassColor = "#4a944a";

      ctx.fillStyle = grassColor;
      ctx.fillRect(0, 0, 512, 512);

      for (let i = 0; i < 500; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 3 + 1;
        const colors = [lightGrassColor, darkGrassColor, grassColor];
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        ctx.fillRect(x, y, 1, 1);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(20, 20);
      texture.anisotropy = 16;
      return texture;
    };

    textureRef.current = createGrassTexture();
  }, []);

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <primitive object={elevationGeometry} />
      <meshStandardMaterial
        map={textureRef.current || undefined}
        color="#ffffff"
        roughness={0.8}
        metalness={0.1}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
