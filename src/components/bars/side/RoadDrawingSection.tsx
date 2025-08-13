import React from "react";
import Section from "../../generic/Section";
import { useRoadDrawingControls } from "../../scene/SelectionAndPlacement";
import { useTool } from "@/contexts/ToolContext";

export default function RoadDrawingSection() {
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

  if (!isRoadTool && !isDrawingRoad) {
    return null;
  }

  const handleRoadTypeChange = (
    type: "residential" | "highway" | "dirt" | "pedestrian"
  ) => {
    setSelectedRoadType(type);
  };

  const handleWidthChange = (width: number) => {
    setRoadWidth(width);
  };

  return (
    <Section>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Road Drawing</h3>
          {isDrawingRoad && (
            <button
              onClick={cancelRoadDrawing}
              className="px-2 py-1 text-xs text-white transition-colors bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              title="Cancel road drawing (Esc)"
            >
              ✕ Cancel
            </button>
          )}
        </div>

        {/* Road Type Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Road Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["residential", "highway", "dirt", "pedestrian"] as const).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => handleRoadTypeChange(type)}
                  className={`px-3 py-2 text-sm rounded-md transition-all duration-200 font-medium ${
                    selectedRoadType === type
                      ? "bg-blue-500 text-white shadow-md shadow-blue-500/25 -translate-y-0.5"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:-translate-y-0.5 hover:shadow-sm"
                  }`}
                  disabled={isDrawingRoad}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              )
            )}
          </div>
        </div>

        {/* Road Width */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Width:{" "}
            <span className="font-semibold text-blue-600">{roadWidth}m</span>
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="2"
              max="12"
              step="0.5"
              value={roadWidth}
              onChange={(e) => handleWidthChange(parseFloat(e.target.value))}
              disabled={isDrawingRoad}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500
                       [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                       [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
                       [&::-webkit-slider-thumb]:hover:bg-blue-600 [&::-webkit-slider-thumb]:transition-colors
                       [&::-webkit-slider-thumb]:disabled:bg-gray-400 [&::-webkit-slider-thumb]:disabled:cursor-not-allowed"
            />
            <input
              type="number"
              min="2"
              max="12"
              step="0.5"
              value={roadWidth}
              onChange={(e) => handleWidthChange(parseFloat(e.target.value))}
              disabled={isDrawingRoad}
              className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* Drawing Status */}
        {isDrawingRoad && (
          <div className="p-3 border border-blue-200 rounded-lg bg-blue-50 animate-pulse">
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-800">
                {getInstructions()}
              </p>
              <p className="text-xs text-blue-600">
                Points placed:{" "}
                <span className="font-semibold">{tempRoadPoints.length}</span>
              </p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={undoLastRoadPoint}
                  disabled={tempRoadPoints.length === 0}
                  className="flex-1 px-3 py-2 text-xs text-white transition-colors bg-blue-500 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  title="Undo last point (Ctrl+U)"
                >
                  ↶ Undo Point
                </button>
                <button
                  onClick={cancelRoadDrawing}
                  className="flex-1 px-3 py-2 text-xs text-white transition-colors bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  title="Cancel drawing (Esc)"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Road Type Information */}
        <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="mb-2 text-sm font-medium text-gray-800">
            Road Types:
          </h4>
          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex justify-between">
              <span className="font-medium">Residential:</span>
              <span className="text-gray-500">6m wide, standard suburban</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Highway:</span>
              <span className="text-gray-500">
                8m wide, high-speed arterials
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Dirt:</span>
              <span className="text-gray-500">4m wide, unpaved rural</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Pedestrian:</span>
              <span className="text-gray-500">2m wide, walking paths</span>
            </div>
          </div>
        </div>

        {/* Drawing Tips */}
        <div className="p-3 border border-green-200 rounded-lg bg-green-50">
          <h4 className="mb-2 text-sm font-medium text-green-800">
            Drawing Tips:
          </h4>
          <ul className="space-y-1 text-xs text-green-700">
            <li className="flex items-start gap-2">
              <span className="font-bold text-green-500">•</span>
              <span>Click to place road points</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-green-500">•</span>
              <span>Double-click to finish the road</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-green-500">•</span>
              <span>Press Esc to cancel drawing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-green-500">•</span>
              <span>Press Ctrl+U to undo last point</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-green-500">•</span>
              <span>Grid snapping helps align roads</span>
            </li>
          </ul>
        </div>
      </div>
    </Section>
  );
}
