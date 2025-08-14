import { WaterObj } from "@/store/storeTypes";
import { DrawingBehavior, ObjectTypeConfig, DrawingPoint, GenericDrawingUtils } from "../shared/genericDrawing";

export const WATER_CONFIGS = {
  pond: { color: "#4FC3F7", transparency: 0.8, waveHeight: 0.05 },
  lake: { color: "#2196F3", transparency: 0.7, waveHeight: 0.1 },
  river: { color: "#03A9F4", transparency: 0.6, waveHeight: 0.15 },
  pool: { color: "#00BCD4", transparency: 0.9, waveHeight: 0.02 },
} as const;

export type WaterType = keyof typeof WATER_CONFIGS;

const waterConfig: ObjectTypeConfig<WaterObj> = {
  type: "water",
  name: "Water",
  minPoints: 1,
  maxPoints: 4, // For rectangular water bodies
  allowCurves: false,
  defaults: {
    type: "water",
    shape: "circular",
    transparency: 0.8,
    waveHeight: 0.1,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  },
  variants: WATER_CONFIGS,
};

export const waterDrawingBehavior: DrawingBehavior<WaterObj> = {
  config: waterConfig,

  validatePoints: (points: DrawingPoint[]) => {
    return GenericDrawingUtils.validatePoints(points) && points.length >= 1;
  },

  createObject: (points: DrawingPoint[], variant = "pond") => {
    const waterDefaults = WATER_CONFIGS[variant as WaterType] || WATER_CONFIGS.pond;
    
    if (points.length === 1) {
      // Single point - create circular water
      const radius = 2; // Default radius
      return {
        id: GenericDrawingUtils.generateId("water"),
        name: `Water ${Date.now().toString().slice(-4)}`,
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
    } else if (points.length === 2) {
      // Two points - create rectangular water
      const bounds = GenericDrawingUtils.calculateBounds(points);
      const centerX = (bounds.minX + bounds.maxX) / 2;
      const centerZ = (bounds.minZ + bounds.maxZ) / 2;
      const width = Math.max(1, bounds.width);
      const depth = Math.max(1, bounds.depth);
      
      return {
        id: GenericDrawingUtils.generateId("water"),
        name: `Water ${Date.now().toString().slice(-4)}`,
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
    } else {
      // Multiple points - create polygon water (future feature)
      const bounds = GenericDrawingUtils.calculateBounds(points);
      const centerX = (bounds.minX + bounds.maxX) / 2;
      const centerZ = (bounds.minZ + bounds.maxZ) / 2;
      
      return {
        id: GenericDrawingUtils.generateId("water"),
        name: `Water ${Date.now().toString().slice(-4)}`,
        type: "water",
        position: [centerX, 0, centerZ],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
        shape: "rectangular",
        width: Math.max(2, bounds.width),
        depth: Math.max(2, bounds.depth),
        ...waterDefaults,
        gridWidth: Math.ceil(Math.max(2, bounds.width)),
        gridDepth: Math.ceil(Math.max(2, bounds.depth)),
        gridHeight: 0.2,
      } as WaterObj;
    }
  },

  getPreview: (points: DrawingPoint[], variant = "pond") => {
    const waterDefaults = WATER_CONFIGS[variant as WaterType] || WATER_CONFIGS.pond;
    
    if (points.length === 1) {
      return {
        points,
        type: variant,
        color: waterDefaults.color,
        radius: 2,
      };
    } else if (points.length >= 2) {
      const bounds = GenericDrawingUtils.calculateBounds(points);
      return {
        points,
        type: variant,
        color: waterDefaults.color,
        width: Math.max(1, bounds.width),
      };
    }
    
    return {
      points,
      type: variant,
      color: waterDefaults.color,
    };
  },

  getInstructions: (pointCount: number) => {
    if (pointCount === 0) {
      return "Click to place water body";
    } else if (pointCount === 1) {
      return "Click again for rectangular water, or double-click for circular";
    } else {
      return `Water with ${pointCount} points - Double-click or Enter to finish`;
    }
  },

  isFinished: (points: DrawingPoint[], isDoubleClick: boolean, isEnterKey: boolean) => {
    if (points.length === 1 && isDoubleClick) return true; // Circular water
    if (points.length >= 2 && (isDoubleClick || isEnterKey)) return true; // Rectangular water
    return false;
  },
};

