/* eslint-disable @typescript-eslint/no-explicit-any */
import { SceneObj } from "@/store/storeTypes";
import { nanoid } from "nanoid";
import { DrawingPoint } from "./types";

// Generic drawing state
export interface GenericDrawingState<T extends string = string> {
  isDrawing: boolean;
  tempPoints: DrawingPoint[];
  lastClickTime: number | null;
  selectedType: T;
  snapToGrid: boolean;
}

// Generic drawing actions
export interface GenericDrawingActions<T extends string = string> {
  setIsDrawing: (isDrawing: boolean) => void;
  setTempPoints: (points: DrawingPoint[]) => void;
  setLastClickTime: (time: number | null) => void;
  setSelectedType: (type: T) => void;
  setSnapToGrid: (snap: boolean) => void;
  addObject: (object: SceneObj) => void;
  cancelDrawing: () => void;
  undoLastPoint: () => void;
  finishDrawing: () => boolean;
}

// Object type configuration
export interface ObjectTypeConfig<T extends SceneObj = SceneObj> {
  type: T["type"];
  name: string;
  minPoints: number;
  maxPoints?: number;
  allowCurves: boolean;
  defaults: Partial<T>;
  variants?: Record<string, Partial<T>>;
}

// Drawing behavior interface
export interface DrawingBehavior<T extends SceneObj = SceneObj> {
  config: ObjectTypeConfig<T>;
  validatePoints: (points: DrawingPoint[]) => boolean;
  createObject: (
    points: DrawingPoint[],
    variant?: string,
    customProps?: Partial<T>
  ) => T;
  getPreview: (
    points: DrawingPoint[],
    variant?: string
  ) => {
    points: DrawingPoint[];
    type: string;
    color: string;
    elevation?: number;
    width?: number;
    radius?: number;
  } | null;
  getInstructions: (pointCount: number) => string;
  isFinished: (
    points: DrawingPoint[],
    isDoubleClick: boolean,
    isEnterKey: boolean
  ) => boolean;
}

// Utility functions
export class GenericDrawingUtils {
  static snapToGrid(
    x: number,
    z: number,
    gridSize: number,
    enabled: boolean
  ): { x: number; z: number } {
    if (!enabled) return { x, z };
    return {
      x: Math.round(x / gridSize) * gridSize,
      z: Math.round(z / gridSize) * gridSize,
    };
  }

  static validatePoints(points: DrawingPoint[]): boolean {
    return points.every(
      (p) =>
        typeof p.x === "number" &&
        typeof p.z === "number" &&
        !isNaN(p.x) &&
        !isNaN(p.z) &&
        isFinite(p.x) &&
        isFinite(p.z)
    );
  }

  static calculateBounds(points: DrawingPoint[]): {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
    width: number;
    depth: number;
  } {
    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    const minZ = Math.min(...points.map((p) => p.z));
    const maxZ = Math.max(...points.map((p) => p.z));

    return {
      minX,
      maxX,
      minZ,
      maxZ,
      width: maxX - minX,
      depth: maxZ - minZ,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static generateId(type: string = "default"): string {
    return nanoid();
  }
}

// Main generic drawing hook
export function useGenericDrawing<T extends SceneObj>(
  state: GenericDrawingState,
  actions: GenericDrawingActions,
  behavior: DrawingBehavior<T>,
  gridSize: number = 1
) {
  const { isDrawing, tempPoints, lastClickTime, selectedType, snapToGrid } =
    state;

  const {
    setIsDrawing,
    setTempPoints,
    setLastClickTime,
    addObject,
    cancelDrawing: baseCancelDrawing,
    undoLastPoint: baseUndoLastPoint,
  } = actions;

  // Handle drawing clicks
  const handleDrawingClick = (
    event: PointerEvent,
    worldPosition: { x: number; z: number }
  ) => {
    const now = Date.now();
    const isDoubleClick = Boolean(lastClickTime && now - lastClickTime < 350);
    const isEnterFinish = Boolean(
      event.type === "keydown" && (event as any).key === "Enter"
    );

    // Snap to grid if enabled
    const snappedPosition = GenericDrawingUtils.snapToGrid(
      worldPosition.x,
      worldPosition.z,
      gridSize,
      snapToGrid
    );

    console.log(`🎨 ${behavior.config.name} drawing click:`, {
      isDoubleClick,
      isEnterFinish,
      currentPoints: tempPoints.length,
      newPosition: snappedPosition,
    });

    // Check if we should finish
    if (behavior.isFinished(tempPoints, isDoubleClick, isEnterFinish)) {
      return finishDrawing();
    }

    // Don't add points on finish attempts
    if (isDoubleClick || isEnterFinish) {
      return false;
    }

    // Check if we've reached max points
    if (
      behavior.config.maxPoints &&
      tempPoints.length >= behavior.config.maxPoints
    ) {
      console.log(`⚠️ Max points (${behavior.config.maxPoints}) reached`);
      return finishDrawing();
    }

    // Add new point
    const newPoint: DrawingPoint = {
      x: Math.round(snappedPosition.x * 100) / 100,
      z: Math.round(snappedPosition.z * 100) / 100,
    };

    // Validate point
    if (!GenericDrawingUtils.validatePoints([newPoint])) {
      console.error("❌ Invalid point coordinates:", newPoint);
      return false;
    }

    const newPoints = [...tempPoints, newPoint];
    setTempPoints(newPoints);
    setIsDrawing(true);
    setLastClickTime(now);

    console.log("📍 Added point, total:", newPoints.length);
    return true;
  };

  // Finish drawing
  const finishDrawing = (): boolean => {
    if (tempPoints.length < behavior.config.minPoints) {
      console.log(
        `❌ Need at least ${behavior.config.minPoints} points to create ${behavior.config.name}`
      );
      return false;
    }

    if (!behavior.validatePoints(tempPoints)) {
      console.error("❌ Invalid points for", behavior.config.name);
      return false;
    }

    try {
      const objectData = behavior.createObject(tempPoints, selectedType);

      console.log(`🎨 Creating ${behavior.config.name}:`, objectData);
      addObject(objectData);

      // Reset state
      setTempPoints([]);
      setIsDrawing(false);
      setLastClickTime(null);

      console.log(`✅ ${behavior.config.name} created successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to create ${behavior.config.name}:`, error);
      return false;
    }
  };

  // Cancel drawing
  const cancelDrawing = () => {
    console.log(`❌ Cancelling ${behavior.config.name} drawing`);
    setTempPoints([]);
    setIsDrawing(false);
    setLastClickTime(null);
    baseCancelDrawing();
  };

  // Undo last point
  const undoLastPoint = () => {
    if (tempPoints.length > 0) {
      const newPoints = tempPoints.slice(0, -1);
      setTempPoints(newPoints);
      if (newPoints.length === 0) {
        setIsDrawing(false);
      }
      console.log("↶ Undid last point, remaining:", newPoints.length);
      baseUndoLastPoint();
    }
  };

  // Add curve to last segment (if supported)
  const addCurveToLastSegment = () => {
    if (!behavior.config.allowCurves || tempPoints.length < 2) return;

    const lastIndex = tempPoints.length - 2;
    const lastPoint = tempPoints[lastIndex];
    const currentPoint = tempPoints[lastIndex + 1];

    const midX = (lastPoint.x + currentPoint.x) / 2;
    const midZ = (lastPoint.z + currentPoint.z) / 2;
    const dx = currentPoint.x - lastPoint.x;
    const dz = currentPoint.z - lastPoint.z;
    const length = Math.sqrt(dx * dx + dz * dz);

    if (length > 0) {
      const perpX = -dz / length;
      const perpZ = dx / length;
      const offset = length * 0.3;

      const controlPoint = {
        x: midX + perpX * offset,
        z: midZ + perpZ * offset,
      };

      const newPoints = [...tempPoints];
      newPoints[lastIndex] = { ...lastPoint, controlPoint };
      setTempPoints(newPoints);
      console.log("🔄 Added curve to segment");
    }
  };

  // Get preview data
  const getPreview = () => {
    if (!isDrawing || tempPoints.length === 0) return null;
    return behavior.getPreview(tempPoints, selectedType);
  };

  // Get drawing instructions
  const getDrawingInstructions = (): string => {
    return behavior.getInstructions(tempPoints.length);
  };

  return {
    // State
    isDrawing,
    tempPoints,
    selectedType,
    snapToGrid,

    // Actions
    handleDrawingClick,
    finishDrawing,
    cancelDrawing,
    undoLastPoint,
    addCurveToLastSegment,

    // Getters
    getPreview,
    getDrawingInstructions,

    // Config
    config: behavior.config,
  };
}
