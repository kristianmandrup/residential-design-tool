"use client";

import * as THREE from "three";
import React from "react";

interface TransparentGridProps {
  size?: number;
  divisions?: number;
  color?: string;
}

export function TransparentGrid({
  size = 100,
  divisions = 100,
  color = "#888",
}: TransparentGridProps) {
  const grid = React.useMemo(
    () => new THREE.GridHelper(size, divisions, color, color),
    [size, divisions, color]
  );
  grid.material.transparent = true;
  grid.material.opacity = 0.6; // slightly more visible
  grid.material.depthWrite = false;
  return <primitive object={grid} position={[0, 0.001, 0]} />;
}
