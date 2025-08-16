// src/components/scene/TerrainEditingControls.tsx
import React from "react";
import { useTerrainEditing } from "@/contexts/TerrainEditingContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TerrainEditingControlsProps {
  onModeChange?: (mode: string) => void;
}

export function TerrainEditingControls({
  onModeChange,
}: TerrainEditingControlsProps) {
  const {
    isEditing,
    currentMode,
    brushPreview,
    slopeVisualizationType,
    startEditing,
    stopEditing,
    updateBrushSettings,
    toggleSlopeVisualization,
    toggleContourLines,
    setSlopeVisualizationType,
    undo,
    redo,
    clearHistory,
  } = useTerrainEditing();

  const editingModes = [
    { id: "raise", label: "Raise", icon: "⬆️", color: "bg-green-500" },
    { id: "lower", label: "Lower", icon: "⬇️", color: "bg-blue-500" },
    { id: "flatten", label: "Flatten", icon: "⬜", color: "bg-gray-500" },
    { id: "smooth", label: "Smooth", icon: "〰️", color: "bg-purple-500" },
    { id: "erode", label: "Erode", icon: "🌊", color: "bg-cyan-500" },
  ];

  const visualizationTypes = [
    { id: "color", label: "Color Gradient" },
    { id: "contour", label: "Contour Lines" },
    { id: "arrows", label: "Slope Arrows" },
    { id: "heatmap", label: "Heat Map" },
  ];

  const handleModeSelect = (mode: string) => {
    if (isEditing) {
      stopEditing();
    }
    if (onModeChange) {
      onModeChange(mode);
    }
  };

  const handleBrushSizeChange = (value: number[]) => {
    updateBrushSettings({ size: value[0] });
  };

  const handleBrushStrengthChange = (value: number[]) => {
    updateBrushSettings({ strength: value[0] });
  };

  const handleBrushFalloffChange = (value: number[]) => {
    updateBrushSettings({ falloff: value[0] });
  };

  const handleBrushShapeChange = (shape: "circle" | "square" | "gradient") => {
    updateBrushSettings({ shape });
  };

  return (
    <div className="terrain-editing-controls">
      {/* Mode Selection */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">Terrain Editing Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2 mb-4">
            {editingModes.map((mode) => (
              <Button
                key={mode.id}
                variant={currentMode.type === mode.id ? "default" : "outline"}
                className={`${mode.color} text-white`}
                onClick={() => handleModeSelect(mode.id)}
                title={mode.label}
              >
                {mode.icon}
              </Button>
            ))}
          </div>

          {/* Brush Settings */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">
                Brush Size: {currentMode.brush.size.toFixed(1)}
              </Label>
              <Slider
                value={[currentMode.brush.size]}
                onValueChange={handleBrushSizeChange}
                min={1}
                max={20}
                step={0.5}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">
                Brush Strength: {currentMode.brush.strength.toFixed(2)}
              </Label>
              <Slider
                value={[currentMode.brush.strength]}
                onValueChange={handleBrushStrengthChange}
                min={0.1}
                max={2}
                step={0.1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">
                Brush Falloff: {currentMode.brush.falloff.toFixed(2)}
              </Label>
              <Slider
                value={[currentMode.brush.falloff]}
                onValueChange={handleBrushFalloffChange}
                min={0}
                max={1}
                step={0.1}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Brush Shape</Label>
              <div className="flex gap-2 mt-2">
                {(["circle", "square", "gradient"] as const).map((shape) => (
                  <Button
                    key={shape}
                    variant={
                      currentMode.brush.shape === shape ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleBrushShapeChange(shape)}
                  >
                    {shape.charAt(0).toUpperCase() + shape.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visualization Controls */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">Slope Visualization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Show Slope Visualization
              </Label>
              <Button
                variant={isEditing ? "default" : "outline"}
                size="sm"
                onClick={toggleSlopeVisualization}
              >
                {isEditing ? "Hide" : "Show"}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Show Contour Lines</Label>
              <Button
                variant={isEditing ? "default" : "outline"}
                size="sm"
                onClick={toggleContourLines}
              >
                {isEditing ? "Hide" : "Show"}
              </Button>
            </div>

            <div>
              <Label className="text-sm font-medium">Visualization Type</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {visualizationTypes.map((type) => (
                  <Button
                    key={type.id}
                    variant={
                      slopeVisualizationType === type.id ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setSlopeVisualizationType(
                        type.id as "color" | "contour" | "arrows" | "heatmap"
                      )
                    }
                  >
                    {type.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={false} // Would check history state
            >
              Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={false} // Would check history state
            >
              Redo
            </Button>
            <Button variant="outline" size="sm" onClick={clearHistory}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      {isEditing && (
        <div className="p-3 mt-4 bg-blue-100 border border-blue-300 rounded-lg">
          <p className="text-sm text-blue-800">
            Editing Mode: {currentMode.type} | Brush: {currentMode.brush.shape}{" "}
            | Size: {currentMode.brush.size.toFixed(1)}
          </p>
          {brushPreview.position && (
            <p className="mt-1 text-xs text-blue-600">
              Position: ({brushPreview.position[0].toFixed(1)},{" "}
              {brushPreview.position[1].toFixed(1)})
            </p>
          )}
        </div>
      )}

      <style jsx>{`
        .terrain-editing-controls {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 300px;
          max-height: 80vh;
          overflow-y: auto;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
