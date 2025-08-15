export const ROAD_CONFIGS = {
  residential: {
    width: 6,
    color: "#404040",
    elevation: 0.02,
    thickness: 0.08,
    visualConfig: {
      centerLine: {
        enabled: true,
        color: "#ffff00",
        width: 0.15,
        style: "dashed" as const,
        dashLength: 1.5,
        gapLength: 0.8,
      },
      sideLines: {
        enabled: true,
        color: "#ffffff",
        width: 0.1,
        style: "solid" as const,
        offset: 2.7,
      },
      surfaces: {
        color: "#404040",
        roughness: 0.8,
        metalness: 0.1,
      },
      curbs: {
        enabled: true,
        height: 0.12,
        width: 0.15,
        color: "#FF6B6B",
      },
    },
  },
  highway: {
    width: 8,
    color: "#383838",
    elevation: 0.03,
    thickness: 0.1,
    visualConfig: {
      centerLine: {
        enabled: true,
        color: "#ffff00",
        width: 0.2,
        style: "dashed" as const,
        dashLength: 2.0,
        gapLength: 1.0,
      },
      sideLines: {
        enabled: true,
        color: "#ffffff",
        width: 0.15,
        style: "solid" as const,
        offset: 3.6,
      },
      surfaces: {
        color: "#383838",
        roughness: 0.8,
        metalness: 0.1,
      },
      curbs: {
        enabled: true,
        height: 0.15,
        width: 0.18,
        color: "#FF6B6B",
      },
    },
  },
  dirt: {
    width: 4,
    color: "#8B4513",
    elevation: 0.01,
    thickness: 0.05,
    visualConfig: {
      centerLine: {
        enabled: false,
        color: "#000000",
        width: 0,
        style: "solid" as const,
      },
      sideLines: {
        enabled: false,
        color: "#000000",
        width: 0,
        style: "solid" as const,
      },
      surfaces: {
        color: "#8B4513",
        roughness: 0.95,
        metalness: 0.02,
      },
      curbs: {
        enabled: false,
        height: 0,
        width: 0,
        color: "#000000",
      },
    },
  },
  pedestrian: {
    width: 2,
    color: "#606060",
    elevation: 0.015,
    thickness: 0.04,
    visualConfig: {
      centerLine: {
        enabled: false,
        color: "#000000",
        width: 0,
        style: "solid" as const,
      },
      sideLines: {
        enabled: true,
        color: "#ffffff",
        width: 0.05,
        style: "solid" as const,
        offset: 0.9,
      },
      surfaces: {
        color: "#606060",
        roughness: 0.7,
        metalness: 0.2,
      },
      curbs: {
        enabled: true,
        height: 0.08,
        width: 0.1,
        color: "#888888",
      },
    },
  },
} as const;

export type RoadType = keyof typeof ROAD_CONFIGS;
