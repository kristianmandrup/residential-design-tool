import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { DrawingPoint } from "@/components/build-objects/shared/genericDrawing";

// Generic drawing state
export interface GenericDrawingState {
  isDrawingRoad: boolean;
  tempRoadPoints: DrawingPoint[];
  lastClickTime: number | null;
  selectedRoadType: string;
  roadWidth: number;
  snapToGrid: boolean;

  isDrawingWater: boolean;
  tempWaterPoints: DrawingPoint[];
  selectedWaterType: string;

  isDrawingWall: boolean;
  tempWallPoints: DrawingPoint[];
  selectedWallType: string;
}

// Generic drawing actions
export interface GenericDrawingActions {
  // Road actions
  setIsDrawingRoad: (isDrawing: boolean) => void;
  setTempRoadPoints: (points: DrawingPoint[]) => void;
  setSelectedRoadType: (type: string) => void;
  setRoadWidth: (width: number) => void;
  cancelRoadDrawing: () => void;
  undoLastRoadPoint: () => void;

  // Water actions
  setIsDrawingWater: (isDrawing: boolean) => void;
  setTempWaterPoints: (points: DrawingPoint[]) => void;
  setSelectedWaterType: (type: string) => void;
  cancelWaterDrawing: () => void;
  undoLastWaterPoint: () => void;

  // Wall actions
  setIsDrawingWall: (isDrawing: boolean) => void;
  setTempWallPoints: (points: DrawingPoint[]) => void;
  setSelectedWallType: (type: string) => void;
  cancelWallDrawing: () => void;
  undoLastWallPoint: () => void;

  // Shared actions
  setLastClickTime: (time: number | null) => void;
  setSnapToGrid: (snap: boolean) => void;
  getInstructions: (type: "road" | "water" | "wall") => string;
}

interface GenericDrawingContextValue
  extends GenericDrawingState,
    GenericDrawingActions {}

const GenericDrawingContext = createContext<GenericDrawingContextValue | null>(
  null
);

interface GenericDrawingProviderProps {
  children: ReactNode;
}

export function GenericDrawingProvider({
  children,
}: GenericDrawingProviderProps) {
  // Road state
  const [isDrawingRoad, setIsDrawingRoad] = useState(false);
  const [tempRoadPoints, setTempRoadPoints] = useState<DrawingPoint[]>([]);
  const [selectedRoadType, setSelectedRoadType] = useState("residential");
  const [roadWidth, setRoadWidth] = useState(6);

  // Water state
  const [isDrawingWater, setIsDrawingWater] = useState(false);
  const [tempWaterPoints, setTempWaterPoints] = useState<DrawingPoint[]>([]);
  const [selectedWaterType, setSelectedWaterType] = useState("pond");

  // Wall state
  const [isDrawingWall, setIsDrawingWall] = useState(false);
  const [tempWallPoints, setTempWallPoints] = useState<DrawingPoint[]>([]);
  const [selectedWallType, setSelectedWallType] = useState("concrete");

  // Shared state
  const [lastClickTime, setLastClickTime] = useState<number | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(true);

  // Actions
  const cancelRoadDrawing = useCallback(() => {
    setTempRoadPoints([]);
    setIsDrawingRoad(false);
    setLastClickTime(null);
  }, []);

  const undoLastRoadPoint = useCallback(() => {
    setTempRoadPoints((prev) => {
      const newPoints = prev.slice(0, -1);
      if (newPoints.length === 0) {
        setIsDrawingRoad(false);
      }
      return newPoints;
    });
  }, []);

  const cancelWaterDrawing = useCallback(() => {
    setTempWaterPoints([]);
    setIsDrawingWater(false);
    setLastClickTime(null);
  }, []);

  const undoLastWaterPoint = useCallback(() => {
    setTempWaterPoints((prev) => {
      const newPoints = prev.slice(0, -1);
      if (newPoints.length === 0) {
        setIsDrawingWater(false);
      }
      return newPoints;
    });
  }, []);

  const cancelWallDrawing = useCallback(() => {
    setTempWallPoints([]);
    setIsDrawingWall(false);
    setLastClickTime(null);
  }, []);

  const undoLastWallPoint = useCallback(() => {
    setTempWallPoints((prev) => {
      const newPoints = prev.slice(0, -1);
      if (newPoints.length === 0) {
        setIsDrawingWall(false);
      }
      return newPoints;
    });
  }, []);

  const getInstructions = useCallback(
    (type?: "road" | "water" | "wall") => {
      switch (type) {
        case "road":
          if (!isDrawingRoad) return "Click to start drawing a road";
          if (tempRoadPoints.length === 1)
            return "Click to add segments, double-click or Enter to finish";
          return `Road with ${tempRoadPoints.length} points - Double-click or Enter to finish`;

        case "water":
          if (!isDrawingWater) return "Click to place water body";
          if (tempWaterPoints.length === 1)
            return "Click again for rectangular water, or double-click for circular";
          return `Water with ${tempWaterPoints.length} points - Double-click or Enter to finish`;

        case "wall":
          if (!isDrawingWall) return "Click to start drawing walls";
          if (tempWallPoints.length === 1) return "Click to set wall end point";
          return `Wall with ${tempWallPoints.length} points - Double-click or Enter to finish`;

        default:
          return "Click to start drawing";
      }
    },
    [
      isDrawingRoad,
      tempRoadPoints.length,
      isDrawingWater,
      tempWaterPoints.length,
      isDrawingWall,
      tempWallPoints.length,
    ]
  );

  const contextValue: GenericDrawingContextValue = {
    // Road state
    isDrawingRoad,
    tempRoadPoints,
    selectedRoadType,
    roadWidth,

    // Water state
    isDrawingWater,
    tempWaterPoints,
    selectedWaterType,

    // Wall state
    isDrawingWall,
    tempWallPoints,
    selectedWallType,

    // Shared state
    lastClickTime,
    snapToGrid,

    // Road actions
    setIsDrawingRoad,
    setTempRoadPoints,
    setSelectedRoadType,
    setRoadWidth,
    cancelRoadDrawing,
    undoLastRoadPoint,

    // Water actions
    setIsDrawingWater,
    setTempWaterPoints,
    setSelectedWaterType,
    cancelWaterDrawing,
    undoLastWaterPoint,

    // Wall actions
    setIsDrawingWall,
    setTempWallPoints,
    setSelectedWallType,
    cancelWallDrawing,
    undoLastWallPoint,

    // Shared actions
    setLastClickTime,
    setSnapToGrid,
    getInstructions,
  };

  return (
    <GenericDrawingContext.Provider value={contextValue}>
      {children}
    </GenericDrawingContext.Provider>
  );
}

export function useGenericDrawingContext(): GenericDrawingContextValue {
  const context = useContext(GenericDrawingContext);
  if (!context) {
    throw new Error(
      "useGenericDrawingContext must be used within a GenericDrawingProvider"
    );
  }
  return context;
}
