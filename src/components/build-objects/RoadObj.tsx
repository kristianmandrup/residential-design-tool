"use client";
import React, { useEffect, useMemo, useRef } from "react";
import { RoadObj } from "@/store";
import * as THREE from "three";
import { RoadBase, RoadCurb, RoadDetail, RoadLines } from "./road";

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
        <RoadBase
          key={`base-${idx}`}
          pos={s.pos}
          len={s.len}
          angle={s.angle}
          width={width}
          height={gridHeight}
          color={roadColor}
        />
      ))}

      {/* Road edges/curbs */}
      {segments.map((s, idx) => (
        <React.Fragment key={`curb-${idx}`}>
          <RoadCurb
            key={`curb-left-${idx}`}
            pos={s.pos}
            len={s.len}
            angle={s.angle}
            width={width}
            side="left"
          />
          <RoadCurb
            key={`curb-right-${idx}`}
            pos={s.pos}
            len={s.len}
            angle={s.angle}
            width={width}
            side="right"
          />
        </React.Fragment>
      ))}

      {/* Lane markings - dashed center lines */}
      {segments.map((s, idx) => (
        <RoadLines
          key={`lines-${idx}`}
          pos={s.pos}
          len={s.len}
          angle={s.angle}
          width={width}
          segments={segments.length}
        />
      ))}

      {/* Optional: Add some road texture detail */}
      {segments.map((s, idx) => (
        <RoadDetail
          key={`detail-${idx}`}
          pos={s.pos}
          len={s.len}
          angle={s.angle}
          width={width}
        />
      ))}
    </group>
  );
}
