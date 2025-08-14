import { WallObj } from "@/store/storeTypes";
import { DrawingBehavior, ObjectTypeConfig, DrawingPoint, GenericDrawingUtils } from "../shared/genericDrawing";

export const WALL_CONFIGS = {
  brick: { color: "#8B4513", thickness: 0.2, height: 2 },
  concrete: { color: "#CCCCCC", thickness: 0.25, height: 2.5 },
  wood: { color: "#D2691E", thickness: 0.15, height: 1.8 },
  stone: { color: "#696969", thickness: 0.3, height: 2.2 },
} as const;

export type WallType = keyof typeof WALL_CONFIGS;

const wallConfig: ObjectTypeConfig<WallObj> = {
  type: "wall",
  name: "Wall",
  minPoints: 2,
  allowCurves: false,
  defaults: {
    type: "wall",
    length: 4,
    height: 2,
    thickness: 0.2,
    color: "#CCCCCC",
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
  },
  variants: WALL_CONFIGS,
};

export const wallDrawingBehavior: DrawingBehavior<WallObj> = {
  config: wallConfig,

  validatePoints: (points: DrawingPoint[]) => {
    return GenericDrawingUtils.validatePoints(points) && points.length >= 2;
  },

  createObject: (points: DrawingPoint[], variant = "concrete") => {
    const wallDefaults = WALL_CONFIGS[variant as WallType] || WALL_CONFIGS.concrete;
    
    // For walls, we create individual wall segments between consecutive points
    const walls: WallObj[] = [];
    
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];
      
      const centerX = (start.x + end.x) / 2;
      const centerZ = (start.z + end.z) / 2;
      const length = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.z - start.z, 2));
      const angle = Math.atan2(end.z - start.z, end.x - start.x);
      
      walls.push({
        id: GenericDrawingUtils.generateId("wall"),
        name: `Wall ${Date.now().toString().slice(-4)}-${i}`,
        type: "wall",
        position: [centerX, 0, centerZ],
        rotation: [0, angle, 0],
        scale: [1, 1, 1],
        length: Math.max(0.5, length),
        height: wallDefaults.height,
        thickness: wallDefaults.thickness,
        color: wallDefaults.color,
        gridWidth: Math.ceil(length),
        gridDepth: Math.ceil(wallDefaults.thickness),
        gridHeight: Math.ceil(wallDefaults.height),
      });
    }
    
    // For the generic drawing system, return the first wall
    // In a real implementation, you might want to handle multiple walls differently
    return walls[0];
  },

  getPreview: (points: DrawingPoint[], variant = "concrete") => {
    const wallDefaults = WALL_CONFIGS[variant as WallType] || WALL_CONFIGS.concrete;
    return {
      points,
      type: variant,
      color: wallDefaults.color,
      width: wallDefaults.thickness,
    };
  },

  getInstructions: (pointCount: number) => {
    if (pointCount === 0) {
      return "Click to start drawing walls";
    } else if (pointCount === 1) {
      return "Click to set wall end point";
    } else {
      return `Wall with ${pointCount} points - Double-click or Enter to finish`;
    }
  },

  isFinished: (points: DrawingPoint[], isDoubleClick: boolean, isEnterKey: boolean) => {
    return (isDoubleClick || isEnterKey) && points.length >= 2;
  },
};

