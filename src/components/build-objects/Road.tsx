"use client";
import React, { useEffect, useMemo, useRef } from "react";
import { RoadObj } from "@/store/useStore";
import * as THREE from "three";

export default function Road({ data }: { data: RoadObj }) {
  const g = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!g.current) return;
    g.current.traverse((c) => {
      if (c instanceof THREE.Object3D) {
        c.userData.objectId = data.id;
      }
    });
  }, [data.id]);

  // Use grid dimensions if available, otherwise use defaults
  const gridWidth = data.gridWidth || 1; // Default 1 grid unit width
  const gridDepth = data.gridDepth || 1; // Default 1 grid unit depth
  const gridHeight = data.gridHeight || 0.1; // Default 0.1 grid unit height

  // Convert grid units to actual world units (1 grid unit = 1.0 world unit)
  const gridSize = 1.0;
  const width = gridWidth * gridSize;
  const roadColor = data.color ?? "#808080"; // Default medium gray

  // build geometry as series of boxes between points
  const segments = useMemo(() => {
    const points: [number, number][] = data.points ?? [];
    const segs: {
      pos: [number, number, number];
      len: number;
      angle: number;
    }[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const [x1, z1] = points[i];
      const [x2, z2] = points[i + 1];
      const dx = x2 - x1;
      const dz = z2 - z1;
      const len = Math.sqrt(dx * dx + dz * dz);
      const angle = Math.atan2(dx, dz);
      const midx = (x1 + x2) / 2;
      const midz = (z1 + z2) / 2;
      segs.push({ pos: [midx, 0.01, midz], len, angle });
    }
    return segs;
  }, [data.points]);

  return (
    <group ref={g} position={data.position} rotation={data.rotation}>
      {/* Road base - asphalt surface */}
      {segments.map((s, idx) => (
        <mesh key={`base-${idx}`} position={s.pos} rotation={[0, s.angle, 0]}>
          <boxGeometry args={[s.len, 0.05, width]} />
          <meshStandardMaterial
            color={roadColor}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* Road edges/curbs */}
      {segments.map((s, idx) => (
        <>
          <mesh
            key={`curb-left-${idx}`}
            position={[s.pos[0], 0.035, s.pos[2] - width / 2]}
            rotation={[0, s.angle, 0]}
          >
            <boxGeometry args={[s.len * 0.98, 0.08, 0.12]} />
            <meshStandardMaterial
              color="#666666"
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
          <mesh
            key={`curb-right-${idx}`}
            position={[s.pos[0], 0.035, s.pos[2] + width / 2]}
            rotation={[0, s.angle, 0]}
          >
            <boxGeometry args={[s.len * 0.98, 0.08, 0.12]} />
            <meshStandardMaterial
              color="#666666"
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
        </>
      ))}

      {/* Lane markings - dashed center lines */}
      {segments.map((s, idx) => (
        <React.Fragment key={`lines-${idx}`}>
          {/* Center dashed line */}
          {segments.length > 1 && (
            <mesh
              key={`center-${idx}`}
              position={[s.pos[0], 0.02, s.pos[2]]}
              rotation={[0, s.angle, 0]}
            >
              <boxGeometry args={[s.len * 0.9, 0.005, 0.06]} />
              <meshStandardMaterial
                color="#ffffff"
                roughness={0.9}
                metalness={0.1}
              />
            </mesh>
          )}

          {/* Side lane markings - fixed width regardless of road width */}
          <mesh
            key={`left-line-${idx}`}
            position={[s.pos[0], 0.02, s.pos[2] - width / 4]}
            rotation={[0, s.angle, 0]}
          >
            <boxGeometry args={[s.len * 0.85, 0.005, 0.06]} />
            <meshStandardMaterial
              color="#ffffff"
              roughness={0.9}
              metalness={0.1}
            />
          </mesh>
          <mesh
            key={`right-line-${idx}`}
            position={[s.pos[0], 0.02, s.pos[2] + width / 4]}
            rotation={[0, s.angle, 0]}
          >
            <boxGeometry args={[s.len * 0.85, 0.005, 0.06]} />
            <meshStandardMaterial
              color="#ffffff"
              roughness={0.9}
              metalness={0.1}
            />
          </mesh>
        </React.Fragment>
      ))}

      {/* Optional: Add some road texture detail */}
      {segments.map((s, idx) => (
        <mesh key={`detail-${idx}`} position={s.pos} rotation={[0, s.angle, 0]}>
          <boxGeometry args={[s.len * 0.98, 0.001, width * 0.96]} />
          <meshStandardMaterial
            color="#696969"
            transparent
            opacity={0.2}
            roughness={1}
            metalness={0}
          />
        </mesh>
      ))}
    </group>
  );
}
