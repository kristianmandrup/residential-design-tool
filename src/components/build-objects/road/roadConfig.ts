// src/components/build-objects/road/roadConfig.ts

export interface RoadConfig {
  width: number;
  color: string;
  elevation: number; // Height above ground
  thickness: number; // Road thickness/depth
  centerLine: boolean;
  centerLineDashed: boolean;
  sideLines: boolean;
  centerLineColor: string;
  sideLineColor: string;
  centerLineWidth: number;
  sideLineWidth: number;
}

export const ROAD_CONFIGS: Record<string, RoadConfig> = {
  residential: {
    width: 6,
    color: "#404040",
    elevation: 0.02,
    thickness: 0.08,
    centerLine: true,
    centerLineDashed: true,
    sideLines: true,
    centerLineColor: "#ffff00",
    sideLineColor: "#ffffff",
    centerLineWidth: 0.15,
    sideLineWidth: 0.1,
  },
  highway: {
    width: 8,
    color: "#383838",
    elevation: 0.03,
    thickness: 0.1,
    centerLine: true,
    centerLineDashed: true,
    sideLines: true,
    centerLineColor: "#ffff00",
    sideLineColor: "#ffffff",
    centerLineWidth: 0.2,
    sideLineWidth: 0.15,
  },
  dirt: {
    width: 4,
    color: "#8B4513",
    elevation: 0.01,
    thickness: 0.05,
    centerLine: false,
    centerLineDashed: false,
    sideLines: false,
    centerLineColor: "#000000",
    sideLineColor: "#000000",
    centerLineWidth: 0,
    sideLineWidth: 0,
  },
  pedestrian: {
    width: 2,
    color: "#606060",
    elevation: 0.015,
    thickness: 0.04,
    centerLine: false,
    centerLineDashed: false,
    sideLines: true,
    centerLineColor: "#000000",
    sideLineColor: "#ffffff",
    centerLineWidth: 0,
    sideLineWidth: 0.05,
  },
};

export function getRoadConfig(roadType: string): RoadConfig {
  return ROAD_CONFIGS[roadType] || ROAD_CONFIGS.residential;
}

