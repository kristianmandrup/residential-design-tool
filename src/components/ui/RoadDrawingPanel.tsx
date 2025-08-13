// src/components/ui/RoadDrawingPanel.tsx
import React from "react";
import { useRoadDrawingControls } from "@/components/scene/SelectionAndPlacement";
import { useTool } from "@/contexts/ToolContext";

interface RoadDrawingPanelProps {
  className?: string;
}

export function RoadDrawingPanel({ className = "" }: RoadDrawingPanelProps) {
  const { selectedTool } = useTool();
  const {
    isDrawingRoad,
    tempRoadPoints,
    selectedRoadType,
    roadWidth,
    setSelectedRoadType,
    setRoadWidth,
    cancelRoadDrawing,
    undoLastRoadPoint,
    getInstructions,
  } = useRoadDrawingControls();

  const isRoadTool = selectedTool === "road";

  const handleRoadTypeChange = (
    type: "residential" | "highway" | "dirt" | "pedestrian"
  ) => {
    setSelectedRoadType(type);
  };

  const handleWidthChange = (width: number) => {
    setRoadWidth(width);
  };

  if (!isRoadTool && !isDrawingRoad) {
    return null;
  }

  return (
    <div
      className={`bg-gray-900/95 backdrop-blur-md rounded-lg p-4 text-white font-sans min-w-72 max-w-80 shadow-xl border border-white/10 ${className}`}
    >
      <div className="flex items-center justify-between pb-2 mb-4 border-b border-white/20">
        <h3 className="text-lg font-semibold">Road Drawing</h3>
        {isDrawingRoad && (
          <button
            onClick={cancelRoadDrawing}
            className="px-2 py-1 text-xs transition-colors bg-red-500 rounded hover:bg-red-600"
            title="Cancel road drawing (Esc)"
          >
            ✕
          </button>
        )}
      </div>

      {/* Road Type Selection */}
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">Road Type:</label>
        <div className="grid grid-cols-2 gap-2">
          {(["residential", "highway", "dirt", "pedestrian"] as const).map(
            (type) => (
              <button
                key={type}
                onClick={() => handleRoadTypeChange(type)}
                className={`px-3 py-2 rounded transition-all duration-200 flex flex-col items-center gap-1 ${
                  selectedRoadType === type
                    ? "bg-green-500 border-green-500 shadow-lg shadow-green-500/40 -translate-y-0.5"
                    : "bg-white/10 border border-white/30 hover:bg-white/20"
                }`}
                disabled={isDrawingRoad}
              >
                <span className="text-xs font-medium capitalize">{type}</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Road Width */}
      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium">Width:</label>
        <div className="space-y-2">
          <input
            type="range"
            min="2"
            max="12"
            step="0.5"
            value={roadWidth}
            onChange={(e) => handleWidthChange(parseFloat(e.target.value))}
            disabled={isDrawingRoad}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                     [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 
                     [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white 
                     [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:hover:bg-blue-400 [&::-webkit-slider-thumb]:transition-colors
                     [&::-webkit-slider-track]:bg-white/20 [&::-webkit-slider-track]:rounded-lg [&::-webkit-slider-track]:h-1"
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="2"
              max="12"
              step="0.5"
              value={roadWidth}
              onChange={(e) => handleWidthChange(parseFloat(e.target.value))}
              disabled={isDrawingRoad}
              className="flex-1 px-2 py-1 text-sm text-white border rounded bg-white/10 border-white/30 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-xs text-white/70">m</span>
          </div>
        </div>
      </div>

      {/* Drawing Status */}
      {isDrawingRoad && (
        <div className="p-3 mb-4 border-green-500 rounded-lg bg-black/30 border-l-3">
          <div className="space-y-2">
            <p className="text-sm font-medium text-green-400">
              {getInstructions()}
            </p>
            <p className="text-xs text-white/80">
              Points: {tempRoadPoints.length}
            </p>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={undoLastRoadPoint}
              disabled={tempRoadPoints.length === 0}
              className="flex-1 px-3 py-2 text-xs transition-colors bg-blue-500 rounded hover:bg-blue-600 disabled:bg-white/10 disabled:cursor-not-allowed"
              title="Undo last point (Ctrl+U)"
            >
              ↶ Undo
            </button>
            <button
              onClick={cancelRoadDrawing}
              className="flex-1 px-3 py-2 text-xs transition-colors bg-red-500 rounded hover:bg-red-600"
              title="Cancel drawing (Esc)"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Road Type Presets Info */}
      <div className="mb-4">
        <h4 className="mb-2 text-sm font-medium">Road Types:</h4>
        <div className="space-y-1 text-xs text-white/80">
          <div className="flex justify-between">
            <span className="font-medium text-white">Residential:</span>
            <span>6m wide, standard suburban roads</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-white">Highway:</span>
            <span>8m wide, high-speed arterials</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-white">Dirt:</span>
            <span>4m wide, unpaved rural roads</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-white">Pedestrian:</span>
            <span>2m wide, walking paths</span>
          </div>
        </div>
      </div>

      {/* Drawing Tips */}
      <div className="text-xs text-white/70">
        <h4 className="mb-2 text-sm font-medium text-white">Tips:</h4>
        <ul className="pl-4 space-y-1">
          <li className="relative before:content-['•'] before:absolute before:-left-3 before:text-green-400">
            Click to place road points
          </li>
          <li className="relative before:content-['•'] before:absolute before:-left-3 before:text-green-400">
            Double-click to finish the road
          </li>
          <li className="relative before:content-['•'] before:absolute before:-left-3 before:text-green-400">
            Press Esc to cancel
          </li>
          <li className="relative before:content-['•'] before:absolute before:-left-3 before:text-green-400">
            Press Ctrl+U to undo last point
          </li>
          <li className="relative before:content-['•'] before:absolute before:-left-3 before:text-green-400">
            Grid snapping helps align roads
          </li>
        </ul>
      </div>
    </div>
  );
}
