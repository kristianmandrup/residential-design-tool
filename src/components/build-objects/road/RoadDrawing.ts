// src/components/build-objects/road/RoadDrawing.ts - Fixed Final with Elevation Support
import { RoadPoint } from "@/store/storeTypes";
import { RoadDrawingActions, RoadDrawingState } from "./types";

const ROAD_DEFAULTS = {
  residential: { width: 6, color: "#404040", elevation: 0.02, thickness: 0.08 },
  highway: { width: 8, color: "#383838", elevation: 0.03, thickness: 0.1 },
  dirt: { width: 4, color: "#8B4513", elevation: 0.01, thickness: 0.05 },
  pedestrian: { width: 2, color: "#606060", elevation: 0.015, thickness: 0.04 },
};

export function useEnhancedRoadDrawing(
  state: RoadDrawingState,
  actions: RoadDrawingActions,
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
    setSelectedRoadType,
    setRoadWidth,
    setSnapToGrid,
    addObject,
  } = actions;

  const snapToGridIfEnabled = (
    x: number,
    z: number
  ): { x: number; z: number } => {
    if (snapToGrid) {
      return {
        x: Math.round(x / gridSize) * gridSize,
        z: Math.round(z / gridSize) * gridSize,
      };
    }
    return { x, z };
  };

  const handleRoadDrawing = (
    e: PointerEvent,
    intersect: { x: number; z: number }
  ) => {
    const now = Date.now();
    const isDoubleClick = lastClickTime && now - lastClickTime < 350;

    const snappedPosition = snapToGridIfEnabled(intersect.x, intersect.z);

    console.log("Road drawing click:", {
      isDoubleClick,
      currentPoints: tempRoadPoints.length,
      newPosition: snappedPosition,
      timeGap: lastClickTime ? now - lastClickTime : "first-click",
    });

    // If double-clicking and we have at least 2 points, finish the road
    if (isDoubleClick && tempRoadPoints.length >= 2) {
      const roadDefaults = ROAD_DEFAULTS[selectedRoadType];

      // Create a copy of the points to avoid reference issues
      const finalPoints = tempRoadPoints.map((p) => ({
        x: p.x,
        z: p.z,
        ...(p.controlPoint && { controlPoint: { ...p.controlPoint } }),
      }));

      const roadObject = {
        type: "road" as const,
        roadType: selectedRoadType,
        points: finalPoints,
        position: [0, 0, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        scale: [1, 1, 1] as [number, number, number],
        width: roadWidth || roadDefaults.width,
        color: roadDefaults.color,
        elevation: roadDefaults.elevation,
        thickness: roadDefaults.thickness,
        gridWidth: Math.max(4, roadWidth || roadDefaults.width),
        gridDepth: Math.max(4, roadWidth || roadDefaults.width),
        gridHeight: roadDefaults.thickness,
      };

      console.log("🛣️ CREATING FINAL ROAD:", {
        points: finalPoints,
        roadType: selectedRoadType,
        width: roadObject.width,
        elevation: roadObject.elevation,
        thickness: roadObject.thickness,
      });

      // Validate points
      const validPoints = finalPoints.every(
        (p) =>
          typeof p.x === "number" &&
          typeof p.z === "number" &&
          !isNaN(p.x) &&
          !isNaN(p.z)
      );

      if (validPoints && finalPoints.length >= 2) {
        addObject(roadObject);
        console.log("✅ Road created successfully");

        // Reset state immediately to prevent duplicate creation
        setTempRoadPoints([]);
        setIsDrawingRoad(false);
        setLastClickTime(null);
      } else {
        console.error("❌ Invalid points, not creating road:", finalPoints);
      }

      return; // Important: return here to prevent adding another point
    }

    // Single click - add point to temporary road
    const newPoint: RoadPoint = {
      x: Math.round(snappedPosition.x * 100) / 100,
      z: Math.round(snappedPosition.z * 100) / 100,
    };

    console.log("➕ Adding point:", newPoint);

    const newPoints = [...tempRoadPoints, newPoint];
    setTempRoadPoints(newPoints);
    setIsDrawingRoad(true);
    setLastClickTime(now);

    console.log("📍 Current road points:", newPoints);
  };

  const cancelRoadDrawing = () => {
    console.log("❌ Cancelling road drawing");
    setTempRoadPoints([]);
    setIsDrawingRoad(false);
    setLastClickTime(null);
  };

  const undoLastPoint = () => {
    if (tempRoadPoints.length > 0) {
      const newPoints = tempRoadPoints.slice(0, -1);
      setTempRoadPoints(newPoints);
      if (newPoints.length === 0) {
        setIsDrawingRoad(false);
      }
      console.log("↶ Undid last point, remaining:", newPoints);
    }
  };

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
    }
  };

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

  const getDrawingInstructions = () => {
    if (!isDrawingRoad) {
      return "Click to start drawing a road";
    } else if (tempRoadPoints.length === 1) {
      return "Click to add more points, double-click to finish";
    } else {
      return `Road with ${tempRoadPoints.length} points - Double-click to finish`;
    }
  };

  return {
    isDrawingRoad,
    tempRoadPoints,
    selectedRoadType,
    roadWidth,
    snapToGrid,
    handleRoadDrawing,
    cancelRoadDrawing,
    undoLastPoint,
    addCurveToLastSegment,
    setSelectedRoadType,
    setRoadWidth,
    setSnapToGrid,
    getRoadPreview,
    getDrawingInstructions,
    ROAD_DEFAULTS,
  };
}
