import {
  WALL_CONFIGS as ENHANCED_WALL_CONFIGS,
  WallType as EnhancedWallType,
} from "../configs/wallConfigs";
import { WallObj } from "@/store/storeTypes";
import {
  EnhancedDrawingBehavior,
  DrawingPoint,
  DrawingPreview,
  ObjectGeometryResult,
  ObjectVisualConfig,
} from "../shared/types";
import * as THREE from "three";
import { GenericDrawingUtils } from "../shared";

export const enhancedWallDrawingBehavior: EnhancedDrawingBehavior<WallObj> = {
  config: {
    type: "wall",
    name: "Wall",
    minPoints: 2,
    allowCurves: false,
    allowIntersections: true,
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
    variants: ENHANCED_WALL_CONFIGS,
    visualConfig: ENHANCED_WALL_CONFIGS.concrete.visualConfig,
  },

  validatePoints: (points: DrawingPoint[]) => {
    return GenericDrawingUtils.validatePoints(points) && points.length >= 2;
  },

  createObject: (points: DrawingPoint[], variant = "concrete") => {
    const wallDefaults =
      ENHANCED_WALL_CONFIGS[variant as EnhancedWallType] ||
      ENHANCED_WALL_CONFIGS.concrete;

    // For walls, create individual wall segments between consecutive points
    const walls: WallObj[] = [];

    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];

      const centerX = (start.x + end.x) / 2;
      const centerZ = (start.z + end.z) / 2;
      const length = Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.z - start.z, 2)
      );
      const angle = Math.atan2(end.z - start.z, end.x - start.x);

      walls.push({
        id: GenericDrawingUtils.generateId("wall"),
        name: `${
          variant.charAt(0).toUpperCase() + variant.slice(1)
        } Wall ${Date.now().toString().slice(-4)}-${i}`,
        type: "wall",
        points: [start, end],
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

    // Return the first wall for the generic system
    return walls[0];
  },

  getPreview: (
    points: DrawingPoint[],
    variant = "concrete"
  ): DrawingPreview => {
    const wallDefaults =
      ENHANCED_WALL_CONFIGS[variant as EnhancedWallType] ||
      ENHANCED_WALL_CONFIGS.concrete;
    return {
      points,
      type: variant,
      color: wallDefaults.color,
      width: wallDefaults.thickness,
      elevation: 0,
      thickness: wallDefaults.height,
      opacity: 0.7,
      visualConfig: wallDefaults.visualConfig,
    };
  },

  getInstructions: (pointCount: number) => {
    if (pointCount === 0) {
      return "🧱 Click to start drawing walls";
    } else if (pointCount === 1) {
      return "📐 Click to set wall end point";
    } else {
      return `🏗️ Wall with ${pointCount} points • Double-click or Enter to finish`;
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
    variant = "concrete",
    elevation = 0
  ): ObjectGeometryResult => {
    const wallDefaults =
      ENHANCED_WALL_CONFIGS[variant as EnhancedWallType] ||
      ENHANCED_WALL_CONFIGS.concrete;

    if (points.length < 2) {
      return {
        mainGeometry: new THREE.BufferGeometry(),
        pathPoints: [],
        centerLinePoints: [],
      };
    }

    // Generate wall geometry along the path
    const pathPoints = points.map(
      (p) => new THREE.Vector3(p.x, elevation + wallDefaults.height / 2, p.z)
    );
    const vertices: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];

      const length = Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.z - start.z, 2)
      );
      const angle = Math.atan2(end.z - start.z, end.x - start.x);

      const centerX = (start.x + end.x) / 2;
      const centerZ = (start.z + end.z) / 2;

      // Create box geometry for each segment
      const segmentGeometry = new THREE.BoxGeometry(
        length,
        wallDefaults.height,
        wallDefaults.thickness
      );
      const matrix = new THREE.Matrix4();
      matrix.makeRotationY(angle);
      matrix.setPosition(centerX, elevation + wallDefaults.height / 2, centerZ);
      segmentGeometry.applyMatrix4(matrix);

      const segmentVertices = segmentGeometry.attributes.position.array;
      const segmentIndices = segmentGeometry.index?.array || [];

      const baseIndex = vertices.length / 3;

      // Add vertices
      for (let j = 0; j < segmentVertices.length; j++) {
        vertices.push(segmentVertices[j]);
      }

      // Add indices with offset
      for (let j = 0; j < segmentIndices.length; j++) {
        indices.push(segmentIndices[j] + baseIndex);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return {
      mainGeometry: geometry,
      pathPoints,
      centerLinePoints: pathPoints,
      bounds: GenericDrawingUtils.calculateBounds(points),
    };
  },

  getVisualConfig: (variant = "concrete"): ObjectVisualConfig => {
    const wallDefaults =
      ENHANCED_WALL_CONFIGS[variant as EnhancedWallType] ||
      ENHANCED_WALL_CONFIGS.concrete;
    return wallDefaults.visualConfig;
  },

  getIntersectionRadius: (variant = "concrete"): number => {
    const wallDefaults =
      ENHANCED_WALL_CONFIGS[variant as EnhancedWallType] ||
      ENHANCED_WALL_CONFIGS.concrete;
    return wallDefaults.thickness / 2;
  },

  canIntersectWith: (otherType: string): boolean => {
    return ["road", "wall"].includes(otherType);
  },
};
