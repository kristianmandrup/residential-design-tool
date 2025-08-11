"use client";
import React, { createContext, useContext, useState } from "react";

export type Tool =
  | "select"
  | "building"
  | "tree"
  | "wall"
  | "road"
  | "water"
  | null;

export interface ToolState {
  selectedTool: Tool;
  setSelectedTool: (tool: Tool) => void;
}

const ToolContext = createContext<ToolState | undefined>(undefined);

export const useTool = () => {
  const ctx = useContext(ToolContext);
  if (!ctx) throw new Error("useTool must be used inside ToolProvider");
  return ctx;
};

export const ToolProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedTool, setSelectedTool] = useState<Tool>("building");

  return (
    <ToolContext.Provider value={{ selectedTool, setSelectedTool }}>
      {children}
    </ToolContext.Provider>
  );
};
