import * as THREE from "three";

export interface RoadSegmentProps {
  pos: [number, number, number];
  len: number;
  angle: number;
  color?: string;
}

export default function RoadSegment({
  pos,
  len,
  angle,
  color = "#808080",
}: RoadSegmentProps) {
  return (
    <group position={pos} rotation={[0, angle, 0]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[len, 0.05, 1]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.1} />
      </mesh>
    </group>
  );
}
