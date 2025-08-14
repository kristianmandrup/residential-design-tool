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

// Generic object data for intersection detection
export interface GenericObjectData {
  id: string;
  type: string;
  points: DrawingPoint[];
  width?: number;
  elevation?: number;
  thickness?: number;
  variant?: string;
}

// Enhanced drawing state interface
export interface EnhancedGenericDrawingState<T extends string = string> {
  isDrawing: boolean;
  tempPoints: DrawingPoint[];
  lastClickTime: number | null;
  selectedType: T;
  snapToGrid: boolean;
  showPreview: boolean;
  showIntersections: boolean;
  autoOptimize: boolean;
}

// Enhanced drawing actions interface
export interface EnhancedGenericDrawingActions<T extends string = string> {
  setIsDrawing: (isDrawing: boolean) => void;
  setTempPoints: (points: DrawingPoint[]) => void;
  setLastClickTime: (time: number | null) => void;
  setSelectedType: (type: T) => void;
  setSnapToGrid: (snap: boolean) => void;
  setShowPreview: (show: boolean) => void;
  setShowIntersections: (show: boolean) => void;
  setAutoOptimize: (auto: boolean) => void;
  addObject: (object: SceneObj) => void;
  updateObject?: (id: string, object: Partial<SceneObj>) => void;
  removeObject?: (id: string) => void;
  getAllObjects?: () => SceneObj[];
  cancelDrawing: () => void;
  undoLastPoint: () => void;
  finishDrawing: () => boolean;
}

// Enhanced drawing result interface
export interface EnhancedDrawingResult<T extends SceneObj> {
  // Core drawing state
  isDrawing: boolean;
  tempPoints: DrawingPoint[];
  selectedType: string;
  snapToGrid: boolean;

  // Enhanced state
  showPreview: boolean;
  showIntersections: boolean;
  autoOptimize: boolean;

  // Core actions
  handleDrawingClick: (
    event: PointerEvent,
    worldPosition: { x: number; z: number }
  ) => boolean;
  finishDrawing: () => boolean;
  cancelDrawing: () => void;
  undoLastPoint: () => void;
  addCurveToLastSegment: () => void;

  // Enhanced actions
  setSelectedType: (type: string) => void;
  setSnapToGrid: (snap: boolean) => void;
  togglePreview: () => void;
  toggleIntersections: () => void;
  toggleAutoOptimize: () => void;

  // Visual data getters
  getPreview: () => DrawingPreview | null;
  getDrawingInstructions: () => string;
  getVisualConfig: () => ObjectVisualConfig | null;
  getCurrentGeometry: () => ObjectGeometryResult | null;

  // Intersection system
  getIntersections: () => GenericIntersection[];
  getOptimizedObjects: () => GenericObjectData[];
  canIntersectWith: (otherType: string) => boolean;
  getIntersectionRadius: () => number;

  // Config
  config: EnhancedDrawingBehavior<T>["config"];
  behavior: EnhancedDrawingBehavior<T>;
}
