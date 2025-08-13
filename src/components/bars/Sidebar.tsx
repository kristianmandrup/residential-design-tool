import React from "react";
import {
  PaletteSection,
  SelectedSection,
  TipsSection,
  RoadDrawingSection,
} from "./side";
import { useTool } from "@/contexts/ToolContext";

export default function Sidebar() {
  const { selectedTool } = useTool();
  const isRoadTool = selectedTool === "road";
  return (
    <div className="flex flex-col h-full p-1 space-y-5">
      <PaletteSection />
      {/* Show road drawing section when road tool is active */}
      {isRoadTool && <RoadDrawingSection />}
      <SelectedSection />
      <TipsSection />
    </div>
  );
}
