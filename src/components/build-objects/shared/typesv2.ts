// src/components/build-objects/shared/types.ts
import * as THREE from "three";
import { SceneObj, RoadPoint } from "@/store/storeTypes";

// Re-export for consistency
export type DrawingPoint = RoadPoint;

// Generic marking configuration
export interface MarkingConfig {
  enabled: boolean;
  color: string;
  width: number;
  style: "solid" | "dashed" | "dotted";
  dashLength?: number;
  gapLength?: number;
  offset?: number; // Distance from object edge
}

// Generic object visual configuration
export interface ObjectVisualConfig {
  centerLine?: MarkingConfig;
  sideLines?: MarkingConfig;
  edges?: MarkingConfig;
  surfaces?: {
    color: string;
    roughness: number;
    metalness: number;
    emissive?: string;
    emissiveIntensity?: number;
  };
  curbs?: {
    enabled: boolean;
    height: number;
    width: number;
    color: string;
  };
}

// Generic preview data
export interface DrawingPreview {
  points: DrawingPoint[];
  type: string;
  color: string;
  elevation?: number;
  thickness?: number;
  width?: number;
  radius?: number;
  opacity?: number;
  visualConfig?: ObjectVisualConfig;
}

// Generic geometry result
export interface ObjectGeometryResult {
  mainGeometry: THREE.BufferGeometry;
  pathPoints: THREE.Vector3[];
  centerLinePoints: THREE.Vector3[];
  bounds?: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
    width: number;
    depth: number;
  };
}

// Generic intersection data
export interface GenericIntersection {
  id: string;
  position: { x: number; z: number };
  connectedObjects: string[];
  objectTypes: string[]; // ["road", "wall", "water"]
  type:
    | "T-junction"
    | "cross"
    | "Y-junction"
    | "multi-way"
    | "L-corner"
    | "end";
  angle: number;
  radius: number;
  elevation: number;
  visualConfig?: ObjectVisualConfig;
}

// Segment data for intersection detection
export interface ObjectSegment {
  objectId: string;
  objectType: string;
  startPoint: DrawingPoint;
  endPoint: DrawingPoint;
  controlPoint?: DrawingPoint;
  width: number;
  elevation: number;
}

// Generic drawing behavior extended with visual features
export interface EnhancedDrawingBehavior<T extends SceneObj = SceneObj> {
  config: {
    type: T["type"];
    name: string;
    minPoints: number;
    maxPoints?: number;
    allowCurves: boolean;
    allowIntersections: boolean;
    defaults: Partial<T>;
    variants?: Record<string, Partial<T>>;
    visualConfig?: ObjectVisualConfig;
  };

  validatePoints: (points: DrawingPoint[]) => boolean;

  createObject: (
    points: DrawingPoint[],
    variant?: string,
    customProps?: Partial<T>
  ) => T;

  getPreview: (
    points: DrawingPoint[],
    variant?: string
  ) => DrawingPreview | null;

  getInstructions: (pointCount: number) => string;

  isFinished: (
    points: DrawingPoint[],
    isDoubleClick: boolean,
    isEnterKey: boolean
  ) => boolean;

  // New geometry generation method
  generateGeometry?: (
    points: DrawingPoint[],
    variant?: string,
    elevation?: number
  ) => ObjectGeometryResult;

  // Visual configuration getter
  getVisualConfig?: (variant?: string) => ObjectVisualConfig;

  // Intersection handling
  getIntersectionRadius?: (variant?: string) => number;
  canIntersectWith?: (otherType: string) => boolean;
}

// Selection indicator configuration
export interface SelectionConfig {
  pointColor: {
    start: string;
    end: string;
    middle: string;
    control: string;
  };
  pointSize: number;
  controlPointSize: number;
  controlLineColor: string;
  boundingBoxColor: string;
  boundingBoxOpacity: number;
}

// Generic drawing context
export interface GenericDrawingContextData {
  // Drawing states for each object type
  isDrawingRoad: boolean;
  isDrawingWall: boolean;
  isDrawingWater: boolean;

  // Point arrays for each type
  tempRoadPoints: DrawingPoint[];
  tempWallPoints: DrawingPoint[];
  tempWaterPoints: DrawingPoint[];

  // Common drawing settings
  lastClickTime: number | null;
  snapToGrid: boolean;

  // Selected types/variants
  selectedRoadType: string;
  selectedWallType: string;
  selectedWaterType: string;

  // Actions
  setIsDrawingRoad: (isDrawing: boolean) => void;
  setIsDrawingWall: (isDrawing: boolean) => void;
  setIsDrawingWater: (isDrawing: boolean) => void;

  setTempRoadPoints: (points: DrawingPoint[]) => void;
  setTempWallPoints: (points: DrawingPoint[]) => void;
  setTempWaterPoints: (points: DrawingPoint[]) => void;

  setLastClickTime: (time: number | null) => void;
  setSnapToGrid: (snap: boolean) => void;

  setSelectedRoadType: (type: string) => void;
  setSelectedWallType: (type: string) => void;
  setSelectedWaterType: (type: string) => void;

  // Cancel/undo actions
  cancelRoadDrawing: () => void;
  cancelWallDrawing: () => void;
  cancelWaterDrawing: () => void;

  undoLastRoadPoint: () => void;
  undoLastWallPoint: () => void;
  undoLastWaterPoint: () => void;
}
