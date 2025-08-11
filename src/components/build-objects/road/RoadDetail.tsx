import * as THREE from "three";

export interface RoadDetailProps {
  pos: [number, number, number];
  len: number;
  angle: number;
  width: number;
}

export default function RoadDetail({
  pos,
  len,
  angle,
  width,
}: RoadDetailProps) {
  return (
    <mesh position={pos} rotation={[0, angle, 0]}>
      <boxGeometry args={[len * 0.98, 0.001, width * 0.96]} />
      <meshStandardMaterial
        color="#696969"
        transparent
        opacity={0.2}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}
