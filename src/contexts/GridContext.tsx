"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type GridContextType = {
  showGrid: boolean;
  toggleGrid: () => void;
};

const GridContext = createContext<GridContextType | undefined>(undefined);

export const GridProvider = ({ children }: { children: ReactNode }) => {
  const [showGrid, setShowGrid] = useState(true);

  const toggleGrid = () => setShowGrid((prev) => !prev);

  return (
    <GridContext.Provider value={{ showGrid, toggleGrid }}>
      {children}
    </GridContext.Provider>
  );
};

export const useGrid = () => {
  const context = useContext(GridContext);
  if (!context) {
    throw new Error("useGrid must be used inside GridProvider");
  }
  return context;
};
