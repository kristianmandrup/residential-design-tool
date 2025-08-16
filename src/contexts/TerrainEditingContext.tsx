// src/contexts/TerrainEditingContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import * as THREE from "three";

export interface BrushSettings {
  size: number; // Brush radius in world units
  strength: number; // Effect intensity (-1 to 1)
  falloff: number; // Softness of brush edges (0-1)
  shape: "circle" | "square" | "gradient";
}

export interface EditingMode {
  type: "raise" | "lower" | "flatten" | "smooth" | "erode";
  brush: BrushSettings;
  preview: boolean;
}

export interface EditingHistory {
  elevationData: { [key: string]: number };
  timestamp: number;
}

export interface TerrainEditingContextType {
  // Editing state
  isEditing: boolean;
  currentMode: EditingMode;
  brushPreview: {
    position: [number, number] | null;
    active: boolean;
  };

  // Visualization settings
  showSlopeVisualization: boolean;
  showContourLines: boolean;
  slopeVisualizationType: "color" | "contour" | "arrows" | "heatmap";

  // History management
  history: EditingHistory[];
  historyIndex: number;
  maxHistory: number;

  // Methods
  startEditing: (mode: EditingMode["type"], position: [number, number]) => void;
  stopEditing: () => void;
  updateBrushPosition: (position: [number, number]) => void;
  updateBrushSettings: (settings: Partial<BrushSettings>) => void;
  updateEditingMode: (mode: EditingMode["type"]) => void;

  // Elevation modification
  modifyElevation: (position: [number, number], elevation: number) => void;
  applyBrushEffect: (
    center: [number, number],
    effect: (distance: number, strength: number) => number
  ) => void;

  // Visualization controls
  toggleSlopeVisualization: () => void;
  toggleContourLines: () => void;
  setSlopeVisualizationType: (
    type: "color" | "contour" | "arrows" | "heatmap"
  ) => void;

  // History management
  saveState: () => void;
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;

  // Utility methods
  calculateSlope: (position: [number, number]) => {
    angle: number;
    direction: number;
  };
  getBrushInfluence: (
    position: [number, number],
    center: [number, number]
  ) => number;
}

const defaultBrushSettings: BrushSettings = {
  size: 5,
  strength: 0.5,
  falloff: 0.5,
  shape: "circle",
};

const defaultEditingMode: EditingMode = {
  type: "raise",
  brush: defaultBrushSettings,
  preview: true,
};

const TerrainEditingContext = createContext<
  TerrainEditingContextType | undefined
>(undefined);

interface TerrainEditingProviderProps {
  children: React.ReactNode;
  onElevationChange?: (x: number, z: number, elevation: number) => void;
}

export function TerrainEditingProvider({
  children,
  onElevationChange,
}: TerrainEditingProviderProps) {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentMode, setCurrentMode] =
    useState<EditingMode>(defaultEditingMode);
  const [brushPreview, setBrushPreview] = useState<{
    position: [number, number] | null;
    active: boolean;
  }>({ position: null, active: false });

  const [showSlopeVisualization, setShowSlopeVisualization] =
    useState<boolean>(false);
  const [showContourLines, setShowContourLines] = useState<boolean>(false);
  const [slopeVisualizationType, setSlopeVisualizationType] = useState<
    "color" | "contour" | "arrows" | "heatmap"
  >("color");

  const [history, setHistory] = useState<EditingHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const maxHistory = 50;

  const startEditing = useCallback(
    (mode: EditingMode["type"], position: [number, number]) => {
      setIsEditing(true);
      setCurrentMode((prev) => ({ ...prev, type: mode }));
      setBrushPreview({ position, active: true });
    },
    []
  );

  const stopEditing = useCallback(() => {
    setIsEditing(false);
    setBrushPreview({ position: null, active: false });
  }, []);

  const updateBrushPosition = useCallback(
    (position: [number, number]) => {
      if (isEditing) {
        setBrushPreview({ position, active: true });
      }
    },
    [isEditing]
  );

  const updateBrushSettings = useCallback(
    (settings: Partial<BrushSettings>) => {
      setCurrentMode((prev) => ({
        ...prev,
        brush: { ...prev.brush, ...settings },
      }));
    },
    []
  );

  const updateEditingMode = useCallback((mode: EditingMode["type"]) => {
    setCurrentMode((prev) => ({ ...prev, type: mode }));
  }, []);

  const modifyElevation = useCallback(
    (position: [number, number], elevation: number) => {
      if (onElevationChange) {
        onElevationChange(position[0], position[1], elevation);
      }
    },
    [onElevationChange]
  );

  const applyBrushEffect = useCallback(
    (
      center: [number, number],
      effect: (distance: number, strength: number) => number
    ) => {
      const [centerX, centerZ] = center;
      const { size, strength, falloff, shape } = currentMode.brush;

      // Calculate brush influence area
      const influenceRadius = size * (1 + falloff);

      // Sample points within brush area
      const sampleCount = Math.max(10, Math.floor(size * 2));
      const step = (size * 2) / sampleCount;

      for (let x = centerX - size; x <= centerX + size; x += step) {
        for (let z = centerZ - size; z <= centerZ + size; z += step) {
          const distance = Math.sqrt((x - centerX) ** 2 + (z - centerZ) ** 2);

          if (distance <= influenceRadius) {
            let influence = 1;

            // Calculate influence based on brush shape and falloff
            switch (shape) {
              case "circle":
                influence = Math.max(0, 1 - (distance / size) ** 2);
                break;
              case "square":
                influence = distance <= size ? 1 : 0;
                break;
              case "gradient":
                influence = Math.max(0, 1 - distance / influenceRadius);
                break;
            }

            // Apply falloff
            influence = Math.pow(influence, 1 + falloff);

            // Calculate elevation change
            const elevationChange = effect(distance, strength * influence);

            if (Math.abs(elevationChange) > 0.001) {
              modifyElevation([x, z], elevationChange);
            }
          }
        }
      }
    },
    [currentMode.brush, modifyElevation]
  );

  const toggleSlopeVisualization = useCallback(() => {
    setShowSlopeVisualization((prev) => !prev);
  }, []);

  const toggleContourLines = useCallback(() => {
    setShowContourLines((prev) => !prev);
  }, []);

  const setSlopeVisualizationTypeCallback = useCallback(
    (type: "color" | "contour" | "arrows" | "heatmap") => {
      setSlopeVisualizationType(type);
    },
    []
  );

  const saveState = useCallback(() => {
    // This would typically save the current elevation state
    // For now, we'll just add a placeholder to the history
    const newHistory = history.slice(0, historyIndex + 1);
    const newState: EditingHistory = {
      elevationData: {}, // Would contain actual elevation data
      timestamp: Date.now(),
    };

    newHistory.push(newState);

    if (newHistory.length > maxHistory) {
      newHistory.shift();
    }

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex, maxHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((prev) => prev - 1);
      // Would restore elevation state from history
    }
  }, [historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((prev) => prev + 1);
      // Would restore elevation state from history
    }
  }, [historyIndex, history.length]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  const calculateSlope = useCallback(
    (position: [number, number]): { angle: number; direction: number } => {
      // This would calculate actual slope from elevation data
      // For now, return placeholder values
      return {
        angle: Math.random() * 45, // 0-45 degrees
        direction: Math.random() * 360, // 0-360 degrees
      };
    },
    []
  );

  const getBrushInfluence = useCallback(
    (position: [number, number], center: [number, number]): number => {
      const [x, z] = position;
      const [centerX, centerZ] = center;
      const distance = Math.sqrt((x - centerX) ** 2 + (z - centerZ) ** 2);
      const { size, falloff, shape } = currentMode.brush;

      if (distance > size) return 0;

      let influence = 1;

      switch (shape) {
        case "circle":
          influence = Math.max(0, 1 - (distance / size) ** 2);
          break;
        case "square":
          influence = distance <= size ? 1 : 0;
          break;
        case "gradient":
          influence = Math.max(0, 1 - distance / size);
          break;
      }

      return Math.pow(influence, 1 + falloff);
    },
    [currentMode.brush]
  );

  const value: TerrainEditingContextType = {
    isEditing,
    currentMode,
    brushPreview,
    showSlopeVisualization,
    showContourLines,
    slopeVisualizationType,
    history,
    historyIndex,
    maxHistory,

    startEditing,
    stopEditing,
    updateBrushPosition,
    updateBrushSettings,
    updateEditingMode,

    modifyElevation,
    applyBrushEffect,

    toggleSlopeVisualization,
    toggleContourLines,
    setSlopeVisualizationType: setSlopeVisualizationTypeCallback,

    saveState,
    undo,
    redo,
    clearHistory,

    calculateSlope,
    getBrushInfluence,
  };

  return (
    <TerrainEditingContext.Provider value={value}>
      {children}
    </TerrainEditingContext.Provider>
  );
}

export function useTerrainEditing() {
  const context = useContext(TerrainEditingContext);
  if (context === undefined) {
    throw new Error(
      "useTerrainEditing must be used within a TerrainEditingProvider"
    );
  }
  return context;
}

// Helper functions for brush effects
export const brushEffects = {
  raise: (distance: number, strength: number): number =>
    strength * (1 - distance / 10),
  lower: (distance: number, strength: number): number =>
    -strength * (1 - distance / 10),
  flatten: (distance: number, strength: number): number => -strength * 0.1,
  smooth: (distance: number, strength: number): number =>
    strength * 0.05 * Math.sin(distance),
  erode: (distance: number, strength: number): number =>
    -strength * 0.2 * (1 - distance / 5),
};
