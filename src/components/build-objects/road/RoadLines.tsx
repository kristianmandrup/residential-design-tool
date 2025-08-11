import React from "react";
import * as THREE from "three";

export interface RoadLinesProps {
  pos: [number, number, number];
  len: number;
  angle: number;
  width: number;
  segments: number;
}

export default function RoadLines({
  pos,
  len,
  angle,
  width,
  segments,
}: RoadLinesProps) {
  return (
    <React.Fragment>
      {/* Center dashed line */}
      {segments > 1 && (
        <mesh position={[pos[0], 0.02, pos[2]]} rotation={[0, angle, 0]}>
          <boxGeometry args={[len * 0.9, 0.005, 0.06]} />
          <meshStandardMaterial
            color="#ffffff"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
      )}

      {/* Side lane markings - fixed width regardless of road width */}
      <mesh
        position={[pos[0], 0.02, pos[2] - width / 4]}
        rotation={[0, angle, 0]}
      >
        <boxGeometry args={[len * 0.85, 0.005, 0.06]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh
        position={[pos[0], 0.02, pos[2] + width / 4]}
        rotation={[0, angle, 0]}
      >
        <boxGeometry args={[len * 0.85, 0.005, 0.06]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} metalness={0.1} />
      </mesh>
    </React.Fragment>
  );
}
