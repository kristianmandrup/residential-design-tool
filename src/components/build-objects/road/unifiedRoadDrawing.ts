import { RoadPoint, RoadObj } from "@/store/storeTypes";
import { nanoid } from "nanoid";

// Road configuration constants
export const ROAD_DEFAULTS = {
  residential: { width: 6, color: "#404040", elevation: 0.02, thickness: 0.08 },
  highway: { width: 8, color: "#383838", elevation: 0.03, thickness: 0.1 },
  dirt: { width: 4, color: "#8B4513", elevation: 0.01, thickness: 0.05 },
  pedestrian: { width: 2, color: "#606060", elevation: 0.015, thickness: 0.04 },
} as const;

export type RoadType = keyof typeof ROAD_DEFAULTS;

// Unified road drawing state interface
export interface UnifiedRoadDrawingState {
  isDrawingRoad: boolean;
  tempRoadPoints: RoadPoint[];
  lastClickTime: number | null;
  selectedRoadType: RoadType;
  roadWidth: number;
  snapToGrid: boolean;
}

// Unified road drawing actions interface
export interface UnifiedRoadDrawingActions {
  setIsDrawingRoad: (isDrawing: boolean) => void;
  setTempRoadPoints: (points: RoadPoint[]) => void;
  setLastClickTime: (time: number | null) => void;
  setSelectedRoadType: (type: RoadType) => void;
  setRoadWidth: (width: number) => void;
  setSnapToGrid: (snap: boolean) => void;
  addObject: (object: RoadObj) => void;
  cancelRoadDrawing: () => void;
  undoLastRoadPoint: () => void;
  finishRoad: () => boolean;
}

// Utility functions
export class RoadDrawingUtils {
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

  static validateRoadPoints(points: RoadPoint[]): boolean {
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

  static createRoadObject(
    points: RoadPoint[],
    roadType: RoadType,
    roadWidth?: number
  ): RoadObj {
    const roadDefaults = ROAD_DEFAULTS[roadType];
    const finalWidth = roadWidth || roadDefaults.width;

    // Calculate grid dimensions
    const minX = Math.min(...points.map((p) => p.x));
    const maxX = Math.max(...points.map((p) => p.x));
    const minZ = Math.min(...points.map((p) => p.z));
    const maxZ = Math.max(...points.map((p) => p.z));

    const gridWidth = Math.max(4, Math.ceil(maxX - minX + finalWidth));
    const gridDepth = Math.max(4, Math.ceil(maxZ - minZ + finalWidth));

    return {
      id: nanoid(),
      name: `Road ${Date.now().toString().slice(-4)}`,
      type: "road",
      roadType,
      points: points.map((p) => ({ ...p })), // Deep copy
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      width: finalWidth,
      color: roadDefaults.color,
      elevation: roadDefaults.elevation,
      thickness: roadDefaults.thickness,
      gridWidth,
      gridDepth,
      gridHeight: roadDefaults.thickness,
    };
  }
}

// Main unified road drawing logic
export function useUnifiedRoadDrawing(
  state: UnifiedRoadDrawingState,
  actions: UnifiedRoadDrawingActions,
  gridSize: number = 1
) {
  const {
    isDrawingRoad,
    tempRoadPoints,
    lastClickTime,
    selectedRoadType,
    roadWidth,
    snapToGrid,
  } = state;

  const {
    setIsDrawingRoad,
    setTempRoadPoints,
    setLastClickTime,
    addObject,
    cancelRoadDrawing: baseCancelRoadDrawing,
    undoLastRoadPoint: baseUndoLastRoadPoint,
  } = actions;

  // Handle road drawing clicks
  const handleRoadClick = (
    event: PointerEvent,
    worldPosition: { x: number; z: number }
  ) => {
    const now = Date.now();
    const isDoubleClick = lastClickTime && now - lastClickTime < 350;
    const isEnterFinish = event.type === 'keydown' && (event as any).key === 'Enter';

    // Snap to grid if enabled
    const snappedPosition = RoadDrawingUtils.snapToGrid(
      worldPosition.x,
      worldPosition.z,
      gridSize,
      snapToGrid
    );

    console.log("🛣️ Road drawing click:", {
      isDoubleClick,
      isEnterFinish,
      currentPoints: tempRoadPoints.length,
      newPosition: snappedPosition,
    });

    // Finish road if double-click or enter and we have enough points
    if ((isDoubleClick || isEnterFinish) && tempRoadPoints.length >= 2) {
      return finishRoad();
    }

    // Don't add points on double-click/enter attempts
    if (isDoubleClick || isEnterFinish) {
      return false;
    }

    // Add new point
    const newPoint: RoadPoint = {
      x: Math.round(snappedPosition.x * 100) / 100,
      z: Math.round(snappedPosition.z * 100) / 100,
    };

    // Validate point
    if (!RoadDrawingUtils.validateRoadPoints([newPoint])) {
      console.error("❌ Invalid point coordinates:", newPoint);
      return false;
    }

    const newPoints = [...tempRoadPoints, newPoint];
    setTempRoadPoints(newPoints);
    setIsDrawingRoad(true);
    setLastClickTime(now);

    console.log("📍 Added point, total:", newPoints.length);
    return true;
  };

  // Finish road creation
  const finishRoad = (): boolean => {
    if (tempRoadPoints.length < 2) {
      console.log("❌ Need at least 2 points to create road");
      return false;
    }

    if (!RoadDrawingUtils.validateRoadPoints(tempRoadPoints)) {
      console.error("❌ Invalid road points");
      return false;
    }

    try {
      const roadObject = RoadDrawingUtils.createRoadObject(
        tempRoadPoints,
        selectedRoadType,
        roadWidth
      );

      console.log("🛣️ Creating road:", roadObject);
      addObject(roadObject);

      // Reset state
      setTempRoadPoints([]);
      setIsDrawingRoad(false);
      setLastClickTime(null);

      console.log("✅ Road created successfully");
      return true;
    } catch (error) {
      console.error("❌ Failed to create road:", error);
      return false;
    }
  };

  // Cancel road drawing
  const cancelRoadDrawing = () => {
    console.log("❌ Cancelling road drawing");
    setTempRoadPoints([]);
    setIsDrawingRoad(false);
    setLastClickTime(null);
    baseCancelRoadDrawing();
  };

  // Undo last point
  const undoLastPoint = () => {
    if (tempRoadPoints.length > 0) {
      const newPoints = tempRoadPoints.slice(0, -1);
      setTempRoadPoints(newPoints);
      if (newPoints.length === 0) {
        setIsDrawingRoad(false);
      }
      console.log("↶ Undid last point, remaining:", newPoints.length);
      baseUndoLastRoadPoint();
    }
  };

  // Add curve to last segment
  const addCurveToLastSegment = () => {
    if (tempRoadPoints.length < 2) return;

    const lastIndex = tempRoadPoints.length - 2;
    const lastPoint = tempRoadPoints[lastIndex];
    const currentPoint = tempRoadPoints[lastIndex + 1];

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

      const newPoints = [...tempRoadPoints];
      newPoints[lastIndex] = { ...lastPoint, controlPoint };
      setTempRoadPoints(newPoints);
      console.log("🔄 Added curve to segment");
    }
  };

  // Get road preview data
  const getRoadPreview = () => {
    if (!isDrawingRoad || tempRoadPoints.length === 0) return null;

    const roadDefaults = ROAD_DEFAULTS[selectedRoadType];

    return {
      points: tempRoadPoints,
      roadType: selectedRoadType,
      width: roadWidth || roadDefaults.width,
      color: roadDefaults.color,
      elevation: roadDefaults.elevation,
    };
  };

  // Get drawing instructions
  const getDrawingInstructions = (): string => {
    if (!isDrawingRoad) {
      return "Click to start drawing a road";
    } else if (tempRoadPoints.length === 1) {
      return "Click to add points, double-click or Enter to finish";
    } else {
      return `Road with ${tempRoadPoints.length} points - Double-click or Enter to finish`;
    }
  };

  return {
    // State
    isDrawingRoad,
    tempRoadPoints,
    selectedRoadType,
    roadWidth,
    snapToGrid,
    
    // Actions
    handleRoadClick,
    finishRoad,
    cancelRoadDrawing,
    undoLastPoint,
    addCurveToLastSegment,
    
    // Getters
    getRoadPreview,
    getDrawingInstructions,
    
    // Constants
    ROAD_DEFAULTS,
  };
}

