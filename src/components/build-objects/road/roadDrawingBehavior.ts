import { RoadObj } from "@/store/storeTypes";
import { DrawingBehavior, ObjectTypeConfig, DrawingPoint, GenericDrawingUtils } from "../shared/genericDrawing";

export const ROAD_CONFIGS = {
  residential: { width: 6, color: "#404040", elevation: 0.02, thickness: 0.08 },
  highway: { width: 8, color: "#383838", elevation: 0.03, thickness: 0.1 },
  dirt: { width: 4, color: "#8B4513", elevation: 0.01, thickness: 0.05 },
  pedestrian: { width: 2, color: "#606060", elevation: 0.015, thickness: 0.04 },
} as const;

export type RoadType = keyof typeof ROAD_CONFIGS;

const roadConfig: ObjectTypeConfig<RoadObj> = {
  type: "road",
  name: "Road",
  minPoints: 2,
  allowCurves: true,
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
  variants: ROAD_CONFIGS,
};

export const roadDrawingBehavior: DrawingBehavior<RoadObj> = {
  config: roadConfig,

  validatePoints: (points: DrawingPoint[]) => {
    return GenericDrawingUtils.validatePoints(points) && points.length >= 2;
  },

  createObject: (points: DrawingPoint[], variant = "residential") => {
    const roadDefaults = ROAD_CONFIGS[variant as RoadType] || ROAD_CONFIGS.residential;
    const bounds = GenericDrawingUtils.calculateBounds(points);
    
    const gridWidth = Math.max(4, Math.ceil(bounds.width + roadDefaults.width));
    const gridDepth = Math.max(4, Math.ceil(bounds.depth + roadDefaults.width));

    return {
      id: GenericDrawingUtils.generateId("road"),
      name: `Road ${Date.now().toString().slice(-4)}`,
      type: "road",
      roadType: variant as RoadType,
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

  getPreview: (points: DrawingPoint[], variant = "residential") => {
    const roadDefaults = ROAD_CONFIGS[variant as RoadType] || ROAD_CONFIGS.residential;
    return {
      points,
      type: variant,
      width: roadDefaults.width,
      color: roadDefaults.color,
      elevation: roadDefaults.elevation,
    };
  },

  getInstructions: (pointCount: number) => {
    if (pointCount === 0) {
      return "Click to start drawing a road";
    } else if (pointCount === 1) {
      return "Click to add segments, double-click or Enter to finish";
    } else {
      return `Road with ${pointCount} points - Double-click or Enter to finish`;
    }
  },

  isFinished: (points: DrawingPoint[], isDoubleClick: boolean, isEnterKey: boolean) => {
    return (isDoubleClick || isEnterKey) && points.length >= 2;
  },
};

