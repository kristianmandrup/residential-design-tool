import React from "react";

export interface DashedLineProps {
  pos: [number, number, number];
  len: number;
  angle: number;
  color?: string;
}

export default function DashedLine({
  pos,
  len,
  angle,
  color = "#ffffff",
}: DashedLineProps) {
  return (
    <mesh position={[pos[0], 0.02, pos[2]]} rotation={[0, angle, 0]}>
      <boxGeometry args={[len * 0.75, 0.005, 0.06]} />
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.1} />
    </mesh>
  );
}
