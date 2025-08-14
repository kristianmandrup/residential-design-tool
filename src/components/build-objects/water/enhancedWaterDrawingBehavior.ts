import { WaterObj } from "@/store/storeTypes";
import { DrawingPoint, GenericDrawingUtils } from "../shared/genericDrawing";
import * as THREE from "three";
import {
  EnhancedDrawingBehavior,
  DrawingPreview,
  ObjectGeometryResult,
  ObjectVisualConfig,
} from "../shared";

export const ENHANCED_WATER_CONFIGS = {
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

export type EnhancedWaterType = keyof typeof ENHANCED_WATER_CONFIGS;

export const enhancedWaterDrawingBehavior: EnhancedDrawingBehavior<WaterObj> = {
  config: {
    type: "water",
    name: "Water",
    minPoints: 1,
    maxPoints: 4,
    allowCurves: false,
    allowIntersections: true,
    defaults: {
      type: "water",
      shape: "circular",
      transparency: 0.8,
      waveHeight: 0.1,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    },
    variants: ENHANCED_WATER_CONFIGS,
    visualConfig: ENHANCED_WATER_CONFIGS.pond.visualConfig,
  },

  validatePoints: (points: DrawingPoint[]) => {
    return GenericDrawingUtils.validatePoints(points) && points.length >= 1;
  },

  createObject: (points: DrawingPoint[], variant = "pond") => {
    const waterDefaults =
      ENHANCED_WATER_CONFIGS[variant as EnhancedWaterType] ||
      ENHANCED_WATER_CONFIGS.pond;

    if (points.length === 1) {
      // Single point - create circular water
      const radius = 2;
      return {
        id: GenericDrawingUtils.generateId("water"),
        name: `${
          variant.charAt(0).toUpperCase() + variant.slice(1)
        } ${Date.now().toString().slice(-4)}`,
        type: "water",
        position: [points[0].x, 0, points[0].z],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        shape: "circular",
        radius,
        width: radius * 2,
        depth: radius * 2,
        ...waterDefaults,
        gridWidth: Math.ceil(radius * 2),
        gridDepth: Math.ceil(radius * 2),
        gridHeight: 0.2,
      } as WaterObj;
    } else {
      // Multiple points - create rectangular water
      const bounds = GenericDrawingUtils.calculateBounds(points);
      const centerX = (bounds.minX + bounds.maxX) / 2;
      const centerZ = (bounds.minZ + bounds.maxZ) / 2;
      const width = Math.max(1, bounds.width);
      const depth = Math.max(1, bounds.depth);

      return {
        id: GenericDrawingUtils.generateId("water"),
        name: `${
          variant.charAt(0).toUpperCase() + variant.slice(1)
        } ${Date.now().toString().slice(-4)}`,
        type: "water",
        position: [centerX, 0, centerZ],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        shape: "rectangular",
        width,
        depth,
        ...waterDefaults,
        gridWidth: Math.ceil(width),
        gridDepth: Math.ceil(depth),
        gridHeight: 0.2,
      } as WaterObj;
    }
  },

  getPreview: (points: DrawingPoint[], variant = "pond"): DrawingPreview => {
    const waterDefaults =
      ENHANCED_WATER_CONFIGS[variant as EnhancedWaterType] ||
      ENHANCED_WATER_CONFIGS.pond;

    if (points.length === 1) {
      return {
        points,
        type: variant,
        color: waterDefaults.color,
        radius: 2,
        elevation: 0,
        opacity: waterDefaults.transparency,
        visualConfig: waterDefaults.visualConfig,
      };
    } else if (points.length >= 2) {
      const bounds = GenericDrawingUtils.calculateBounds(points);
      return {
        points,
        type: variant,
        color: waterDefaults.color,
        width: Math.max(1, bounds.width),
        elevation: 0,
        opacity: waterDefaults.transparency,
        visualConfig: waterDefaults.visualConfig,
      };
    }

    return {
      points,
      type: variant,
      color: waterDefaults.color,
      elevation: 0,
      opacity: waterDefaults.transparency,
      visualConfig: waterDefaults.visualConfig,
    };
  },

  getInstructions: (pointCount: number) => {
    if (pointCount === 0) {
      return "💧 Click to place water body";
    } else if (pointCount === 1) {
      return "🌊 Click again for rectangular water • Double-click for circular";
    } else {
      return `🏊 Water with ${pointCount} points • Double-click or Enter to finish`;
    }
  },

  isFinished: (
    points: DrawingPoint[],
    isDoubleClick: boolean,
    isEnterKey: boolean
  ) => {
    if (points.length === 1 && isDoubleClick) return true; // Circular water
    if (points.length >= 2 && (isDoubleClick || isEnterKey)) return true; // Rectangular water
    return false;
  },

  generateGeometry: (
    points: DrawingPoint[],
    variant = "pond",
    elevation = 0
  ): ObjectGeometryResult => {
    const waterDefaults =
      ENHANCED_WATER_CONFIGS[variant as EnhancedWaterType] ||
      ENHANCED_WATER_CONFIGS.pond;

    if (points.length === 0) {
      return {
        mainGeometry: new THREE.BufferGeometry(),
        pathPoints: [],
        centerLinePoints: [],
      };
    }

    if (points.length === 1) {
      // Circular water
      const radius = 2;
      const geometry = new THREE.CircleGeometry(radius, 32);
      geometry.rotateX(-Math.PI / 2);
      geometry.translate(points[0].x, elevation, points[0].z);

      const pathPoints = [
        new THREE.Vector3(points[0].x, elevation, points[0].z),
      ];

      return {
        mainGeometry: geometry,
        pathPoints,
        centerLinePoints: pathPoints,
      };
    } else {
      // Rectangular water
      const bounds = GenericDrawingUtils.calculateBounds(points);
      const centerX = (bounds.minX + bounds.maxX) / 2;
      const centerZ = (bounds.minZ + bounds.maxZ) / 2;
      const width = Math.max(1, bounds.width);
      const depth = Math.max(1, bounds.depth);

      const geometry = new THREE.PlaneGeometry(width, depth);
      geometry.rotateX(-Math.PI / 2);
      geometry.translate(centerX, elevation, centerZ);

      const pathPoints = points.map(
        (p) => new THREE.Vector3(p.x, elevation, p.z)
      );

      return {
        mainGeometry: geometry,
        pathPoints,
        centerLinePoints: pathPoints,
        bounds,
      };
    }
  },

  getVisualConfig: (variant = "pond"): ObjectVisualConfig => {
    const waterDefaults =
      ENHANCED_WATER_CONFIGS[variant as EnhancedWaterType] ||
      ENHANCED_WATER_CONFIGS.pond;
    return waterDefaults.visualConfig;
  },

  getIntersectionRadius: (variant = "pond"): number => {
    return 1; // Water intersections are typically smaller
  },

  canIntersectWith: (otherType: string): boolean => {
    return ["road", "water"].includes(otherType);
  },
};
