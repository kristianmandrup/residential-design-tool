"use client";
import React from "react";

export default function Roof({
  type = "flat",
  color = "#666",
  width = 2.4,
  depth = 2.4,
}: {
  type?: string;
  color?: string;
  width?: number;
  depth?: number;
}) {
  if (type === "gabled") {
    // two sloped boxes creating a ridge
    const slopeHeight = 0.7;
    return (
      <group>
        <mesh position={[0, slopeHeight / 2, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[width * 1.05, 0.15, depth * 1.05]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* ridge */}
        <mesh position={[0, slopeHeight / 2 + 0.05, 0]}>
          <coneGeometry args={[Math.max(width, depth) / 4, slopeHeight, 4]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    );
  }

  if (type === "hipped") {
    return (
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry
          args={[
            Math.max(width, depth) / 2,
            Math.max(width, depth) / 1.6,
            0.8,
            4,
          ]}
        />
        <meshStandardMaterial color={color} />
      </mesh>
    );
  }

  // flat
  return (
    <mesh position={[0, 0.08, 0]}>
      <boxGeometry args={[width * 1.02, 0.15, depth * 1.02]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
