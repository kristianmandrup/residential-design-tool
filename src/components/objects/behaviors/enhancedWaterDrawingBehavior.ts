import {
  WATER_CONFIGS as ENHANCED_WATER_CONFIGS,
  WaterType as EnhancedWaterType,
} from "../configs/waterConfigs";
import { WaterObj } from "@/store/storeTypes";
import { GenericDrawingUtils } from "../shared/genericDrawing";
import * as THREE from "three";
import {
  EnhancedDrawingBehavior,
  DrawingPreview,
  ObjectGeometryResult,
  ObjectVisualConfig,
  DrawingPoint,
} from "../shared";

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
        points: [points[0]], // Add missing points property
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
        points: [...points], // Add missing points property
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
