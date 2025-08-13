import React from "react";
import Section from "../../generic/Section";
import { useRoadDrawingControls } from "@/contexts/RoadDrawingContext";
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

  // Check if road tool is selected (using consistent naming)
  const isRoadTool = selectedTool === "road";

  if (!isRoadTool && !isDrawingRoad) {
    return null;
  }

  const handleRoadTypeChange = (
    type: "residential" | "highway" | "dirt" | "pedestrian"
  ) => {
    console.log("UI: Changing road type to:", type);
    setSelectedRoadType(type);
  };

  const handleWidthChange = (width: number) => {
    console.log("UI: Changing road width to:", width);
    setRoadWidth(width);
  };

  // Road type configurations for UI display
  const roadTypeInfo = {
    residential: { description: "6m wide, standard suburban", defaultWidth: 6 },
    highway: { description: "8m wide, high-speed arterials", defaultWidth: 8 },
    dirt: { description: "4m wide, unpaved rural", defaultWidth: 4 },
    pedestrian: { description: "2m wide, walking paths", defaultWidth: 2 },
  };

  return (
    <Section>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Road Drawing</h3>
          {isDrawingRoad && (
            <button
              onClick={() => {
                console.log("UI: Canceling road drawing");
                cancelRoadDrawing();
              }}
              className="px-2 py-1 text-xs text-white transition-colors bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              title="Cancel road drawing (Esc)"
            >
              ✕ Cancel
            </button>
          )}
        </div>

        {/* Debug Display */}
        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <div><strong>Debug Info:</strong></div>
          <div>Selected Tool: {selectedTool}</div>
          <div>Road Type: {selectedRoadType}</div>
          <div>Width: {roadWidth}m</div>
          <div>Drawing: {isDrawingRoad ? 'Yes' : 'No'}</div>
          <div>Points: {tempRoadPoints.length}</div>
        </div>

        {/* Road Type Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Road Type: <span className="text-blue-600 font-semibold">{selectedRoadType}</span>
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
                  title={`Switch to ${type} road (${roadTypeInfo[type].defaultWidth}m default)`}
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
              onChange={(e) => {
                const newWidth = parseFloat(e.target.value);
                console.log("UI: Slider changed to:", newWidth);
                handleWidthChange(newWidth);
              }}
              disabled={isDrawingRoad}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500
                       [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                       [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
                       [&::-webkit-slider-thumb]:hover:bg-blue-600 [&::-webkit-slider-thumb]:transition-colors
                       [&::-webkit-slider-thumb]:disabled:bg-gray-400 [&::-webkit-slider-thumb]:disabled:cursor-not-allowed"
            />
            <div className="flex gap-2">
              <input
                type="number"
                min="2"
                max="12"
                step="0.5"
                value={roadWidth}
                onChange={(e) => {
                  const newWidth = parseFloat(e.target.value);
                  if (!isNaN(newWidth)) {
                    console.log("UI: Number input changed to:", newWidth);
                    handleWidthChange(newWidth);
                  }
                }}
                disabled={isDrawingRoad}
                className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={() => {
                  const defaultWidth = roadTypeInfo[selectedRoadType].defaultWidth;
                  console.log("UI: Resetting to default width:", defaultWidth);
                  handleWidthChange(defaultWidth);
                }}
                disabled={isDrawingRoad}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Reset to default width for this road type"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Drawing Status */}
        {isDrawingRoad && (
          <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
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
                  onClick={() => {
                    console.log("UI: Undoing last road point");
                    undoLastRoadPoint();
                  }}
                  disabled={tempRoadPoints.length === 0}
                  className="flex-1 px-3 py-2 text-xs text-white transition-colors bg-blue-500 rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  title="Undo last point (Ctrl+U)"
                >
                  ↶ Undo Point
                </button>
                <button
                  onClick={() => {
                    console.log("UI: Canceling road drawing from button");
                    cancelRoadDrawing();
                  }}
                  className="flex-1 px-3 py-2 text-xs text-white transition-colors bg-red-500 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/50"
                  title="Cancel drawing (Esc)"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Drawing Tips */}
        <div className="p-3 border border-green-200 rounded-lg bg-green-50">
          <h4 className="mb-2 text-sm font-medium text-green-800">
            Drawing Controls:
          </h4>
          <ul className="space-y-1 text-xs text-green-700">
            <li className="flex items-start gap-2">
              <span className="font-bold text-green-500">•</span>
              <span><strong>Click</strong> to place road points</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-green-500">•</span>
              <span><strong>Double-click</strong> to finish the road</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-green-500">•</span>
              <span><strong>Enter</strong> to finish the road (NEW!)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-green-500">•</span>
              <span><strong>Esc</strong> to cancel drawing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-green-500">•</span>
              <span><strong>Ctrl+U</strong> to undo last point</span>
            </li>
          </ul>
        </div>

        {/* Tool Shortcuts */}
        <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
          <h4 className="mb-2 text-sm font-medium text-blue-800">
            Tool Shortcuts:
          </h4>
          <div className="grid grid-cols-2 gap-1 text-xs text-blue-700">
            <div><strong>S</strong> - Select tool</div>
            <div><strong>R</strong> - Road tool</div>
            <div><strong>B</strong> - Building tool</div>
            <div><strong>T</strong> - Tree tool</div>
            <div><strong>W</strong> - Wall tool</div>
            <div><strong>A</strong> - Water tool</div>
          </div>
        </div>
      </div>
    </Section>
  );
}

