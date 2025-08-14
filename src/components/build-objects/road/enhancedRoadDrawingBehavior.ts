// src/components/build-objects/road/enhancedRoadDrawingBehavior.ts
import { RoadObj } from "@/store/storeTypes";
import {
  EnhancedDrawingBehavior,
  DrawingPoint,
  DrawingPreview,
  ObjectGeometryResult,
  ObjectVisualConfig,
} from "../shared/types";
import { generateRoadGeometry } from "./roadGeometry";
import * as THREE from "three";
import { GenericDrawingUtils } from "../shared/genericDrawing";

export const ENHANCED_ROAD_CONFIGS = {
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
        offset: 2.7, // 90% of half width (6/2 * 0.9)
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
        offset: 3.6, // 90% of half width (8/2 * 0.9)
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
        offset: 0.9, // 90% of half width (2/2 * 0.9)
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

export type EnhancedRoadType = keyof typeof ENHANCED_ROAD_CONFIGS;

export const enhancedRoadDrawingBehavior: EnhancedDrawingBehavior<RoadObj> = {
  config: {
    type: "road",
    name: "Road",
    minPoints: 2,
    allowCurves: true,
    allowIntersections: true,
    defaults: {
      type: "road",
      roadType: "residential",
      width: 6,
      color: "#404040",
      elevation: 0.02,
      thickness: 0.08,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    },
    variants: ENHANCED_ROAD_CONFIGS,
    visualConfig: ENHANCED_ROAD_CONFIGS.residential.visualConfig,
  },

  validatePoints: (points: DrawingPoint[]) => {
    return GenericDrawingUtils.validatePoints(points) && points.length >= 2;
  },

  createObject: (points: DrawingPoint[], variant = "residential") => {
    const roadDefaults =
      ENHANCED_ROAD_CONFIGS[variant as EnhancedRoadType] ||
      ENHANCED_ROAD_CONFIGS.residential;
    const bounds = GenericDrawingUtils.calculateBounds(points);

    const gridWidth = Math.max(4, Math.ceil(bounds.width + roadDefaults.width));
    const gridDepth = Math.max(4, Math.ceil(bounds.depth + roadDefaults.width));

    return {
      id: GenericDrawingUtils.generateId("road"),
      name: `${
        variant.charAt(0).toUpperCase() + variant.slice(1)
      } Road ${Date.now().toString().slice(-4)}`,
      type: "road",
      roadType: variant as EnhancedRoadType,
      points: points.map((p) => ({ ...p })),
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      width: roadDefaults.width,
      color: roadDefaults.color,
      elevation: roadDefaults.elevation,
      thickness: roadDefaults.thickness,
      gridWidth,
      gridDepth,
      gridHeight: roadDefaults.thickness,
    } as RoadObj;
  },

  getPreview: (
    points: DrawingPoint[],
    variant = "residential"
  ): DrawingPreview => {
    const roadDefaults =
      ENHANCED_ROAD_CONFIGS[variant as EnhancedRoadType] ||
      ENHANCED_ROAD_CONFIGS.residential;
    return {
      points,
      type: variant,
      width: roadDefaults.width,
      color: roadDefaults.color,
      elevation: roadDefaults.elevation,
      thickness: roadDefaults.thickness,
      opacity: 0.6,
      visualConfig: roadDefaults.visualConfig,
    };
  },

  getInstructions: (pointCount: number) => {
    if (pointCount === 0) {
      return "🛣️ Click to start drawing a road";
    } else if (pointCount === 1) {
      return "📍 Click to add segments • Double-click or Enter to finish • Press 'C' for curves";
    } else {
      return `🎯 Road with ${pointCount} points • Press 'C' for curves • Double-click or Enter to finish`;
    }
  },

  isFinished: (
    points: DrawingPoint[],
    isDoubleClick: boolean,
    isEnterKey: boolean
  ) => {
    return (isDoubleClick || isEnterKey) && points.length >= 2;
  },

  generateGeometry: (
    points: DrawingPoint[],
    variant = "residential",
    elevation?: number
  ): ObjectGeometryResult => {
    const roadDefaults =
      ENHANCED_ROAD_CONFIGS[variant as EnhancedRoadType] ||
      ENHANCED_ROAD_CONFIGS.residential;
    const finalElevation = elevation ?? roadDefaults.elevation;

    try {
      const result = generateRoadGeometry(
        points,
        roadDefaults.width,
        finalElevation,
        roadDefaults.thickness
      );

      return {
        mainGeometry: result.roadGeometry,
        pathPoints: result.roadPath,
        centerLinePoints: result.centerLinePoints,
        bounds: GenericDrawingUtils.calculateBounds(points),
      };
    } catch (error) {
      console.error("Failed to generate enhanced road geometry:", error);
      return {
        mainGeometry: new THREE.BufferGeometry(),
        pathPoints: [],
        centerLinePoints: [],
      };
    }
  },

  getVisualConfig: (variant = "residential"): ObjectVisualConfig => {
    const roadDefaults =
      ENHANCED_ROAD_CONFIGS[variant as EnhancedRoadType] ||
      ENHANCED_ROAD_CONFIGS.residential;
    return roadDefaults.visualConfig;
  },

  getIntersectionRadius: (variant = "residential"): number => {
    const roadDefaults =
      ENHANCED_ROAD_CONFIGS[variant as EnhancedRoadType] ||
      ENHANCED_ROAD_CONFIGS.residential;
    return roadDefaults.width / 2;
  },

  canIntersectWith: (otherType: string): boolean => {
    return ["road", "wall", "water"].includes(otherType);
  },
};
