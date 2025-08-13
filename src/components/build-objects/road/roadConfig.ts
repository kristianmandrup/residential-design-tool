// src/components/build-objects/road/roadConfig.ts

export interface RoadConfig {
  width: number;
  color: string;
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
