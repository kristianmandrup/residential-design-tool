import { RoadObj } from "@/store/storeTypes";
import {
  ROAD_CONFIGS as ENHANCED_ROAD_CONFIGS,
  RoadType as EnhancedRoadType,
} from "../configs/roadConfigs";
import {
  EnhancedDrawingBehavior,
  DrawingPoint,
  DrawingPreview,
  ObjectGeometryResult,
  ObjectVisualConfig,
} from "../shared/types";
import { generateRoadGeometry } from "../geometry/roadGeometry";
import * as THREE from "three";
import { GenericDrawingUtils } from "../shared/genericDrawing";

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
