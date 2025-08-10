import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function Ground() {
  const meshRef = useRef<THREE.Mesh>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    // Create a grass texture (small and tileable)
    const createGrassTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      // Create base grass color
      const grassColor = "#4a7c59";
      const lightGrassColor = "#5a8c69";
      const darkGrassColor = "#3a6c49";

      // Fill with base grass color
      ctx.fillStyle = grassColor;
      ctx.fillRect(0, 0, 512, 512);

      // Add grass blades with more variation
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

      // Add some texture variation
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        ctx.fillRect(x, y, 1, 1);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(20, 20); // More tiling for better coverage
      texture.anisotropy = 16; // Better texture quality
      return texture;
    };

    textureRef.current = createGrassTexture();

    // Update material when texture is created
    if (meshRef.current && textureRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      material.map = textureRef.current;
      material.needsUpdate = true;
      material.color = new THREE.Color("#4a7c59");
    }
  }, []);

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      {/* Fixed size plane */}
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial
        map={textureRef.current}
        color="#4a7c59"
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
}
