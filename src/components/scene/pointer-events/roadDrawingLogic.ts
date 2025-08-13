import { RoadPoint } from '@/store/storeTypes';
import { ROAD_DEFAULTS } from '@/contexts/RoadDrawingContext';

export interface RoadDrawingLogicProps {
  isDrawingRoad: boolean;
  tempRoadPoints: RoadPoint[];
  lastClickTime: number | null;
  selectedRoadType: "residential" | "highway" | "dirt" | "pedestrian";
  roadWidth: number;
  snapToGrid: boolean;
  gridSize: number;
  setIsDrawingRoad: (value: boolean) => void;
  setTempRoadPoints: (points: RoadPoint[]) => void;
  setLastClickTime: (time: number | null) => void;
  addObject: (object: any) => void;
}

export function useRoadDrawingLogic({
  isDrawingRoad,
  tempRoadPoints,
  lastClickTime,
  selectedRoadType,
  roadWidth,
  snapToGrid,
  gridSize,
  setIsDrawingRoad,
  setTempRoadPoints,
  setLastClickTime,
  addObject,
}: RoadDrawingLogicProps) {
  
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

  const finishRoad = () => {
    if (tempRoadPoints.length < 2) {
      console.log("❌ Need at least 2 points to create road");
      return;
    }

    const roadDefaults = ROAD_DEFAULTS[selectedRoadType];

    // Create a copy of the points to avoid reference issues
    const finalPoints = tempRoadPoints.map((p) => ({
      x: p.x,
      z: p.z,
      ...(p.controlPoint && { controlPoint: { ...p.controlPoint } }),
    }));

    // Generate unique ID
    const roadId = `road-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const roadObject = {
      id: roadId,
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
      id: roadId,
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
      try {
        addObject(roadObject);
        console.log("✅ Road created successfully with ID:", roadId);

        // Reset state immediately to prevent duplicate creation
        setTempRoadPoints([]);
        setIsDrawingRoad(false);
        setLastClickTime(null);
        
        return true; // Success
      } catch (error) {
        console.error("❌ Failed to create road:", error);
        return false; // Failure
      }
    } else {
      console.error("❌ Invalid points, not creating road:", finalPoints);
      return false; // Failure
    }
  };

  const handleRoadDrawing = (
    e: PointerEvent,
    intersect: { x: number; z: number }
  ) => {
    const now = Date.now();
    const isDoubleClick = lastClickTime && now - lastClickTime < 350;
    const isEnterKeyFinish = e.type === 'pointerdown' && e.pointerId === 1; // Our fake enter event

    const snappedPosition = snapToGridIfEnabled(intersect.x, intersect.z);

    console.log("Road drawing click:", {
      isDoubleClick,
      isEnterKeyFinish,
      currentPoints: tempRoadPoints.length,
      newPosition: snappedPosition,
      timeGap: lastClickTime ? now - lastClickTime : "first-click",
    });

    // If double-clicking, Enter key, or we have enough points, finish the road
    if ((isDoubleClick || isEnterKeyFinish) && tempRoadPoints.length >= 2) {
      const success = finishRoad();
      if (success) {
        return; // Don't add another point
      }
    }

    // Don't add points if this was meant to finish the road
    if (isDoubleClick || isEnterKeyFinish) {
      return;
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

  return {
    handleRoadDrawing,
    addCurveToLastSegment,
    getRoadPreview,
    finishRoad,
  };
}

