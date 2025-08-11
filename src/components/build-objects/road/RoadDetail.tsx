export interface RoadDetailProps {
  pos: [number, number, number];
  len: number;
  angle: number;
  width: number;
  color?: string;
}

export default function RoadDetail({
  pos,
  len,
  angle,
  width,
  color = "#7a7a7a",
}: RoadDetailProps) {
  return (
    <mesh position={pos} rotation={[0, angle, 0]}>
      <boxGeometry args={[len * 0.98, 0.001, width * 0.96]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.4}
        roughness={0.9}
        metalness={0}
      />
    </mesh>
  );
}
