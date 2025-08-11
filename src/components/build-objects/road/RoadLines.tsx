import React from "react";
import DashedLine from "./DashedLine";
import SideLane from "./SideLane";

export interface RoadLinesProps {
  pos: [number, number, number];
  len: number;
  angle: number;
  width: number;
  segments: number;
  centerLineColor?: string;
  sideLineColor?: string;
}

export default function RoadLines({
  pos,
  len,
  angle,
  width,
  segments,
  centerLineColor = "#ffffff",
  sideLineColor = "#ffffff",
}: RoadLinesProps) {
  return (
    <React.Fragment>
      {/* Center dashed line - shorter for better dash effect */}
      {segments > 1 && (
        <DashedLine pos={pos} len={len} angle={angle} color={centerLineColor} />
      )}

      {/* Side lane markings - positioned at 1/4 and 3/4 of road width */}
      <SideLane
        pos={pos}
        len={len}
        angle={angle}
        offset={-width / 4}
        color={sideLineColor}
      />
      <SideLane
        pos={pos}
        len={len}
        angle={angle}
        offset={width / 4}
        color={sideLineColor}
      />
    </React.Fragment>
  );
}
