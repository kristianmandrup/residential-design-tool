export const WATER_CONFIGS = {
  pond: {
    color: "#4FC3F7",
    transparency: 0.8,
    waveHeight: 0.05,
    visualConfig: {
      edges: {
        enabled: true,
        color: "#2196F3",
        width: 0.1,
        style: "solid" as const,
        offset: 0.05,
      },
      surfaces: {
        color: "#4FC3F7",
        roughness: 0.1,
        metalness: 0.9,
        emissive: "#003366",
        emissiveIntensity: 0.1,
      },
    },
  },
  lake: {
    color: "#2196F3",
    transparency: 0.7,
    waveHeight: 0.1,
    visualConfig: {
      edges: {
        enabled: true,
        color: "#1565C0",
        width: 0.12,
        style: "solid" as const,
        offset: 0.08,
      },
      surfaces: {
        color: "#2196F3",
        roughness: 0.05,
        metalness: 0.95,
        emissive: "#001133",
        emissiveIntensity: 0.15,
      },
    },
  },
  river: {
    color: "#03A9F4",
    transparency: 0.6,
    waveHeight: 0.15,
    visualConfig: {
      edges: {
        enabled: true,
        color: "#0277BD",
        width: 0.08,
        style: "dashed" as const,
        dashLength: 0.5,
        gapLength: 0.3,
        offset: 0.06,
      },
      centerLine: {
        enabled: true,
        color: "#00BCD4",
        width: 0.06,
        style: "dashed" as const,
        dashLength: 0.8,
        gapLength: 0.4,
      },
      surfaces: {
        color: "#03A9F4",
        roughness: 0.15,
        metalness: 0.85,
        emissive: "#002244",
        emissiveIntensity: 0.08,
      },
    },
  },
  pool: {
    color: "#00BCD4",
    transparency: 0.9,
    waveHeight: 0.02,
    visualConfig: {
      edges: {
        enabled: true,
        color: "#00838F",
        width: 0.15,
        style: "solid" as const,
        offset: 0.1,
      },
      surfaces: {
        color: "#00BCD4",
        roughness: 0.02,
        metalness: 0.98,
        emissive: "#004455",
        emissiveIntensity: 0.2,
      },
    },
  },
} as const;

export type WaterType = keyof typeof WATER_CONFIGS;
