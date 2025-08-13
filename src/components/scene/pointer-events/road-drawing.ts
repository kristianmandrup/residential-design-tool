import {
  PointerEventContext,
  StoreActions,
  PointerEventData,
  RoadDrawingState,
  RoadDrawingActions,
} from "./types";
import { RoadPoint } from "@/store/storeTypes";

const ROAD_DEFAULTS = {
  residential: { width: 6, color: "#404040" },
  highway: { width: 8, color: "#383838" },
  dirt: { width: 4, color: "#8B4513" },
  pedestrian: { width: 2, color: "#606060" },
};

export class RoadDrawingHandler {
  constructor(
    private context: PointerEventContext,
    private actions: StoreActions,
    private roadState: RoadDrawingState,
    private roadActions: RoadDrawingActions
  ) {}

  handleRoadDrawing(data: PointerEventData): boolean {
    const { tempRoadPoints, lastClickTime, selectedRoadType, roadWidth } =
      this.roadState;
    const { setIsDrawingRoad, setTempRoadPoints, setLastClickTime } =
      this.roadActions;
    const { addObject } = this.actions;

    const now = Date.now();
    const isDoubleClick = lastClickTime && now - lastClickTime < 350;

    // Create new road point
    const newPoint: RoadPoint = {
      x: Math.round(data.snappedPosition.x * 100) / 100,
      z: Math.round(data.snappedPosition.z * 100) / 100,
    };

    if (isDoubleClick) {
      // Finish the road - need at least 2 points
      if (tempRoadPoints.length >= 1) {
        const roadDefaults = ROAD_DEFAULTS[selectedRoadType];
        const finalPoints = [...tempRoadPoints];

        // Only add the new point if we don't have enough points yet
        if (finalPoints.length === 1) {
          finalPoints.push(newPoint);
        }

        if (finalPoints.length >= 2) {
          addObject({
            type: "road",
            roadType: selectedRoadType,
            points: finalPoints,
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            width: roadWidth || roadDefaults.width,
            color: roadDefaults.color,
            gridWidth:
              Math.max(...finalPoints.map((p) => Math.abs(p.x))) * 2 || 4,
            gridDepth:
              Math.max(...finalPoints.map((p) => Math.abs(p.z))) * 2 || 1,
            gridHeight: 0.1,
          });
        }
      }

      // Reset drawing state
      setTempRoadPoints([]);
      setIsDrawingRoad(false);
      setLastClickTime(null);
      return true;
    }

    // Add point to temporary road
    setIsDrawingRoad(true);
    setTempRoadPoints([...tempRoadPoints, newPoint]);
    setLastClickTime(now);
    return true;
  }

  cancelRoadDrawing(): void {
    const { setIsDrawingRoad, setTempRoadPoints, setLastClickTime } =
      this.roadActions;
    setTempRoadPoints([]);
    setIsDrawingRoad(false);
    setLastClickTime(null);
  }

  undoLastPoint(): void {
    const { tempRoadPoints } = this.roadState;
    const { setTempRoadPoints, setIsDrawingRoad } = this.roadActions;

    if (tempRoadPoints.length > 0) {
      const newPoints = tempRoadPoints.slice(0, -1);
      setTempRoadPoints(newPoints);
      if (newPoints.length === 0) {
        setIsDrawingRoad(false);
      }
    }
  }
}
