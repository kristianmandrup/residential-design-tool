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
