import * as THREE from "three";

export interface RoadBaseProps {
  pos: [number, number, number];
  len: number;
  angle: number;
  width: number;
  height?: number;
  color?: string;
}

export default function RoadBase({
  pos,
  len,
  angle,
  width,
  height = 0.05,
  color,
}: RoadBaseProps) {
  return (
    <mesh position={pos} rotation={[0, angle, 0]}>
      <boxGeometry args={[len, height, width]} />
      <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
    </mesh>
  );
}
