// src/contexts/ElevationContext.tsx
import React, { createContext, useContext, useState, useCallback } from "react";

export interface ElevationContextType {
  gridElevation: { [key: string]: number }; // x,z -> elevation
  setGridElevation: (x: number, z: number, elevation: number) => void;
  getGridElevation: (x: number, z: number) => number;
  clearGridElevation: (x: number, z: number) => void;
  clearAllGridElevation: () => void;
  getGridElevationData: () => { [key: string]: number };
}

const ElevationContext = createContext<ElevationContextType | undefined>(
  undefined
);

interface ElevationProviderProps {
  children: React.ReactNode;
}

export function ElevationProvider({ children }: ElevationProviderProps) {
  const [gridElevation, setGridElevationState] = useState<{
    [key: string]: number;
  }>({});

  const setGridElevation = useCallback(
    (x: number, z: number, elevation: number) => {
      const key = `${x},${z}`;
      setGridElevationState((prev) => ({
        ...prev,
        [key]: elevation,
      }));
    },
    []
  );

  const getGridElevation = useCallback(
    (x: number, z: number) => {
      const key = `${x},${z}`;
      return gridElevation[key] || 0;
    },
    [gridElevation]
  );

  const clearGridElevation = useCallback((x: number, z: number) => {
    const key = `${x},${z}`;
    setGridElevationState((prev) => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  }, []);

  const clearAllGridElevation = useCallback(() => {
    setGridElevationState({});
  }, []);

  const getGridElevationData = useCallback(() => {
    return { ...gridElevation };
  }, [gridElevation]);

  const value: ElevationContextType = {
    gridElevation,
    setGridElevation,
    getGridElevation,
    clearGridElevation,
    clearAllGridElevation,
    getGridElevationData,
  };

  return (
    <ElevationContext.Provider value={value}>
      {children}
    </ElevationContext.Provider>
  );
}

export function useElevation() {
  const context = useContext(ElevationContext);
  if (context === undefined) {
    throw new Error("useElevation must be used within an ElevationProvider");
  }
  return context;
}
