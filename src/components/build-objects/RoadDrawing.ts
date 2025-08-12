import { RoadPoint } from "@/store/storeTypes";

export interface RoadDrawingState {
  isDrawingRoad: boolean;
  tempRoadPoints: RoadPoint[];
  lastClickTime: number | null;
  selectedRoadType: "residential" | "highway" | "dirt" | "pedestrian";
  roadWidth: number;
  snapToGrid: boolean;
}

export interface RoadDrawingActions {
  setIsDrawingRoad: (isDrawing: boolean) => void;
  setTempRoadPoints: (points: RoadPoint[]) => void;
  setLastClickTime: (time: number | null) => void;
  setSelectedRoadType: (
    type: "residential" | "highway" | "dirt" | "pedestrian"
  ) => void;
  setRoadWidth: (width: number) => void;
  setSnapToGrid: (snap: boolean) => void;
  addObject: (object: unknown) => void;
}

const ROAD_DEFAULTS = {
  residential: { width: 6, color: "#404040" },
  highway: { width: 8, color: "#383838" },
  dirt: { width: 4, color: "#8B4513" },
  pedestrian: { width: 2, color: "#606060" },
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

    // If double-clicking, finish the road
    if (isDoubleClick) {
      if (tempRoadPoints.length >= 1) {
        const roadDefaults = ROAD_DEFAULTS[selectedRoadType];

        // Create the final road object
        addObject({
          type: "road",
          roadType: selectedRoadType,
          points: tempRoadPoints,
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          width: roadWidth || roadDefaults.width,
          color: roadDefaults.color,
          gridWidth:
            Math.max(...tempRoadPoints.map((p) => Math.abs(p.x))) * 2 || 2,
          gridDepth:
            Math.max(...tempRoadPoints.map((p) => Math.abs(p.z))) * 2 || 2,
          gridHeight: 0.1,
        });
      }

      // Reset drawing state
      setTempRoadPoints([]);
      setIsDrawingRoad(false);
      setLastClickTime(null);
      return;
    }

    // Add point to temporary road
    const newPoint: RoadPoint = {
      x: Math.round(snappedPosition.x * 100) / 100,
      z: Math.round(snappedPosition.z * 100) / 100,
    };

    setIsDrawingRoad(true);
    setTempRoadPoints([...tempRoadPoints, newPoint]);
    setLastClickTime(now);
  };

  const cancelRoadDrawing = () => {
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
    }
  };

  const addCurveToLastSegment = () => {
    if (tempRoadPoints.length < 2) return;

    const lastIndex = tempRoadPoints.length - 2;
    const lastPoint = tempRoadPoints[lastIndex];
    const currentPoint = tempRoadPoints[lastIndex + 1];

    // Calculate control point position (offset perpendicular to the line)
    const midX = (lastPoint.x + currentPoint.x) / 2;
    const midZ = (lastPoint.z + currentPoint.z) / 2;
    const dx = currentPoint.x - lastPoint.x;
    const dz = currentPoint.z - lastPoint.z;
    const length = Math.sqrt(dx * dx + dz * dz);

    if (length > 0) {
      const perpX = -dz / length;
      const perpZ = dx / length;
      const offset = length * 0.3; // 30% of segment length

      const controlPoint = {
        x: midX + perpX * offset,
        z: midZ + perpZ * offset,
      };

      const newPoints = [...tempRoadPoints];
      newPoints[lastIndex] = { ...lastPoint, controlPoint };
      setTempRoadPoints(newPoints);
    }
  };

  const detectAndCreateIntersections = (
    newRoadPoints: RoadPoint[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _existingRoads: any[]
  ) => {
    // This would analyze the new road against existing roads to find intersections
    // For now, return the points as-is
    // TODO: Implement intersection detection algorithm
    return newRoadPoints;
  };

  const getRoadPreview = () => {
    if (!isDrawingRoad || tempRoadPoints.length === 0) return null;

    return {
      points: tempRoadPoints,
      roadType: selectedRoadType,
      width: roadWidth || ROAD_DEFAULTS[selectedRoadType].width,
      color: ROAD_DEFAULTS[selectedRoadType].color,
    };
  };

  const getDrawingInstructions = () => {
    if (!isDrawingRoad) {
      return "Click to start drawing a road";
    } else if (tempRoadPoints.length === 1) {
      return "Click to add road segments, double-click to finish";
    } else {
      return `Road with ${tempRoadPoints.length} points - Double-click to finish, 'C' for curve, 'U' to undo`;
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
    handleRoadDrawing,
    cancelRoadDrawing,
    undoLastPoint,
    addCurveToLastSegment,
    setSelectedRoadType,
    setRoadWidth,
    setSnapToGrid,

    // Utilities
    getRoadPreview,
    getDrawingInstructions,
    detectAndCreateIntersections,

    // Constants
    ROAD_DEFAULTS,
  };
}
