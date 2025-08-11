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
    <mesh position={[pos[0], 0.05, pos[2] + offset]} rotation={[0, angle, 0]}>
      <boxGeometry args={[len * 0.98, 0.1, 0.15]} />
      <meshStandardMaterial color="#999999" roughness={0.5} metalness={0.2} />
    </mesh>
  );
}
