// src/components/build-objects/wall/enhancedWallDrawingBehavior.ts
import { WallObj } from "@/store/storeTypes";
import {
  EnhancedDrawingBehavior,
  DrawingPoint,
  DrawingPreview,
  ObjectGeometryResult,
  ObjectVisualConfig,
} from "../shared/types";
import * as THREE from "three";

export const ENHANCED_WALL_CONFIGS = {
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

export type EnhancedWallType = keyof typeof ENHANCED_WALL_CONFIGS;

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

// ============================================================================
// ENHANCED WATER DRAWING BEHAVIOR
// ============================================================================

import { WaterObj } from "@/store/storeTypes";
import { GenericDrawingUtils } from "../shared/genericDrawing";

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
