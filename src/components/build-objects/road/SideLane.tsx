import React from "react";

export interface SideLaneProps {
  pos: [number, number, number];
  len: number;
  angle: number;
  offset: number; // Distance from center (positive or negative)
  color?: string;
}

export default function SideLane({
  pos,
  len,
  angle,
  offset,
  color = "#ffffff",
}: SideLaneProps) {
  return (
    <mesh position={[pos[0], 0.02, pos[2] + offset]} rotation={[0, angle, 0]}>
      <boxGeometry args={[len * 0.8, 0.005, 0.06]} />
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
    </mesh>
  );
}
