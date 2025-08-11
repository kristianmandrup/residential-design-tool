export interface RoadDrawingState {
  isDrawingRoad: boolean;
  tempRoadPoints: [number, number][];
  lastClickTime: number | null;
}

export interface RoadDrawingActions {
  setIsDrawingRoad: (isDrawing: boolean) => void;
  setTempRoadPoints: (points: [number, number][]) => void;
  setLastClickTime: (time: number | null) => void;
  addObject: (object: unknown) => void;
}

export function useRoadDrawingLogic(
  state: RoadDrawingState,
  actions: RoadDrawingActions
) {
  const { isDrawingRoad, tempRoadPoints, lastClickTime } = state;
  const { setIsDrawingRoad, setTempRoadPoints, setLastClickTime, addObject } =
    actions;

  const handleRoadDrawing = (
    e: PointerEvent,
    intersect: { x: number; z: number }
  ) => {
    // double-click detection for finishing road
    const now = Date.now();
    const double = lastClickTime && now - lastClickTime < 350;

    // add point to temp
    setIsDrawingRoad(true);
    setTempRoadPoints([
      ...tempRoadPoints,
      [
        Math.round(intersect.x * 100) / 100,
        Math.round(intersect.z * 100) / 100,
      ],
    ]);

    if (double) {
      // finish - use the tempRoadPoints that already includes the new point
      if (tempRoadPoints.length >= 1) {
        // Need at least 2 points for a road
        addObject({
          type: "road",
          points: tempRoadPoints as [number, number][],
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
          width: 1,
          gridWidth: 1,
          gridDepth: 1,
          gridHeight: 0.1,
        });
      }
      setTempRoadPoints([]);
      setIsDrawingRoad(false);
    }
    setLastClickTime(now);
  };

  return {
    isDrawingRoad,
    tempRoadPoints,
    handleRoadDrawing,
  };
}
