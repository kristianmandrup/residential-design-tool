import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { RoadPoint } from '@/store/storeTypes';

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
  setSelectedRoadType: (type: "residential" | "highway" | "dirt" | "pedestrian") => void;
  setRoadWidth: (width: number) => void;
  setSnapToGrid: (snap: boolean) => void;
  cancelRoadDrawing: () => void;
  undoLastRoadPoint: () => void;
  getInstructions: () => string;
}

interface RoadDrawingContextValue extends RoadDrawingState, RoadDrawingActions {}

const RoadDrawingContext = createContext<RoadDrawingContextValue | null>(null);

const ROAD_DEFAULTS = {
  residential: { width: 6, color: "#404040", elevation: 0.02, thickness: 0.08 },
  highway: { width: 8, color: "#383838", elevation: 0.03, thickness: 0.1 },
  dirt: { width: 4, color: "#8B4513", elevation: 0.01, thickness: 0.05 },
  pedestrian: { width: 2, color: "#606060", elevation: 0.015, thickness: 0.04 },
};

interface RoadDrawingProviderProps {
  children: ReactNode;
}

export function RoadDrawingProvider({ children }: RoadDrawingProviderProps) {
  // State
  const [isDrawingRoad, setIsDrawingRoad] = useState(false);
  const [tempRoadPoints, setTempRoadPoints] = useState<RoadPoint[]>([]);
  const [lastClickTime, setLastClickTime] = useState<number | null>(null);
  const [selectedRoadType, setSelectedRoadType] = useState<"residential" | "highway" | "dirt" | "pedestrian">("residential");
  const [roadWidth, setRoadWidth] = useState(6);
  const [snapToGrid, setSnapToGrid] = useState(true);

  // Actions
  const cancelRoadDrawing = useCallback(() => {
    console.log("❌ Cancelling road drawing");
    setTempRoadPoints([]);
    setIsDrawingRoad(false);
    setLastClickTime(null);
  }, []);

  const undoLastRoadPoint = useCallback(() => {
    if (tempRoadPoints.length > 0) {
      const newPoints = tempRoadPoints.slice(0, -1);
      setTempRoadPoints(newPoints);
      if (newPoints.length === 0) {
        setIsDrawingRoad(false);
      }
      console.log("↶ Undid last point, remaining:", newPoints);
    }
  }, [tempRoadPoints]);

  const getInstructions = useCallback(() => {
    if (!isDrawingRoad) {
      return "Click to start drawing a road";
    } else if (tempRoadPoints.length === 1) {
      return "Click to add segments, double-click or press Enter to finish";
    } else {
      return `Road with ${tempRoadPoints.length} points - Double-click or press Enter to finish`;
    }
  }, [isDrawingRoad, tempRoadPoints.length]);

  // Enhanced setters with logging
  const setSelectedRoadTypeWithLogging = useCallback((type: "residential" | "highway" | "dirt" | "pedestrian") => {
    console.log("🛣️ Road type changed to:", type);
    setSelectedRoadType(type);
    // Auto-update width to default for new road type
    const defaultWidth = ROAD_DEFAULTS[type].width;
    console.log("📏 Auto-updating width to default:", defaultWidth);
    setRoadWidth(defaultWidth);
  }, []);

  const setRoadWidthWithLogging = useCallback((width: number) => {
    console.log("📏 Road width changed to:", width);
    setRoadWidth(width);
  }, []);

  const contextValue: RoadDrawingContextValue = {
    // State
    isDrawingRoad,
    tempRoadPoints,
    lastClickTime,
    selectedRoadType,
    roadWidth,
    snapToGrid,
    // Actions
    setIsDrawingRoad,
    setTempRoadPoints,
    setLastClickTime,
    setSelectedRoadType: setSelectedRoadTypeWithLogging,
    setRoadWidth: setRoadWidthWithLogging,
    setSnapToGrid,
    cancelRoadDrawing,
    undoLastRoadPoint,
    getInstructions,
  };

  return (
    <RoadDrawingContext.Provider value={contextValue}>
      {children}
    </RoadDrawingContext.Provider>
  );
}

export function useRoadDrawing(): RoadDrawingContextValue {
  const context = useContext(RoadDrawingContext);
  if (!context) {
    throw new Error('useRoadDrawing must be used within a RoadDrawingProvider');
  }
  return context;
}

// Convenience hook for just the drawing controls (for UI components)
export function useRoadDrawingControls() {
  const context = useRoadDrawing();
  
  return {
    isDrawingRoad: context.isDrawingRoad,
    tempRoadPoints: context.tempRoadPoints,
    selectedRoadType: context.selectedRoadType,
    roadWidth: context.roadWidth,
    setSelectedRoadType: context.setSelectedRoadType,
    setRoadWidth: context.setRoadWidth,
    cancelRoadDrawing: context.cancelRoadDrawing,
    undoLastRoadPoint: context.undoLastRoadPoint,
    getInstructions: context.getInstructions,
  };
}

// Export road defaults for use in other components
export { ROAD_DEFAULTS };
