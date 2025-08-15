export const WALL_CONFIGS = {
  brick: {
    color: "#8B4513",
    thickness: 0.2,
    height: 2,
    visualConfig: {
      edges: {
        enabled: true,
        color: "#654321",
        width: 0.05,
        style: "solid" as const,
        offset: 0.1,
      },
      surfaces: {
        color: "#8B4513",
        roughness: 0.9,
        metalness: 0.05,
      },
    },
  },
  concrete: {
    color: "#CCCCCC",
    thickness: 0.25,
    height: 2.5,
    visualConfig: {
      edges: {
        enabled: true,
        color: "#999999",
        width: 0.08,
        style: "solid" as const,
        offset: 0.12,
      },
      surfaces: {
        color: "#CCCCCC",
        roughness: 0.8,
        metalness: 0.1,
      },
    },
  },
  wood: {
    color: "#D2691E",
    thickness: 0.15,
    height: 1.8,
    visualConfig: {
      edges: {
        enabled: true,
        color: "#8B4513",
        width: 0.04,
        style: "dashed" as const,
        dashLength: 0.3,
        gapLength: 0.2,
        offset: 0.08,
      },
      surfaces: {
        color: "#D2691E",
        roughness: 0.7,
        metalness: 0.02,
      },
    },
  },
  stone: {
    color: "#696969",
    thickness: 0.3,
    height: 2.2,
    visualConfig: {
      edges: {
        enabled: true,
        color: "#555555",
        width: 0.06,
        style: "solid" as const,
        offset: 0.15,
      },
      surfaces: {
        color: "#696969",
        roughness: 0.95,
        metalness: 0.08,
      },
    },
  },
} as const;

export type WallType = keyof typeof WALL_CONFIGS;
