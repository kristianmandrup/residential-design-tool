import * as THREE from "three";

export interface RoadCurbProps {
  pos: [number, number, number];
  len: number;
  angle: number;
  width: number;
  side: "left" | "right";
}

export default function RoadCurb({
  pos,
  len,
  angle,
  width,
  side,
}: RoadCurbProps) {
  const offset = side === "left" ? -width / 2 : width / 2;

  return (
    <mesh position={[pos[0], 0.035, pos[2] + offset]} rotation={[0, angle, 0]}>
      <boxGeometry args={[len * 0.98, 0.08, 0.12]} />
      <meshStandardMaterial color="#666666" roughness={0.7} metalness={0.1} />
    </mesh>
  );
}
