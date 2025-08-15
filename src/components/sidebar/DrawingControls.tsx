import React from "react";
import { useGenericDrawingContext } from "@/contexts/GenericDrawingContext";
import { useTool } from "@/contexts/ToolContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export function DrawingControls() {
  const { selectedTool } = useTool();
  const drawingContext = useGenericDrawingContext();

  const isDrawingRoad = drawingContext.isDrawingRoad;
  const isDrawingWall = drawingContext.isDrawingWall;
  const isDrawingWater = drawingContext.isDrawingWater;

  const isAnyDrawing = isDrawingRoad || isDrawingWall || isDrawingWater;

  if (!isAnyDrawing) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <div className="text-3xl mb-2">✏️</div>
            <p className="text-sm">No active drawing</p>
            <p className="text-xs">Select a drawing tool to start</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getCurrentDrawingType = () => {
    if (isDrawingRoad) return "road";
    if (isDrawingWall) return "wall";
    if (isDrawingWater) return "water";
    return "unknown";
  };

  const getCurrentPoints = () => {
    if (isDrawingRoad) return drawingContext.tempRoadPoints;
    if (isDrawingWall) return drawingContext.tempWallPoints;
    if (isDrawingWater) return drawingContext.tempWaterPoints;
    return [];
  };

  const getCurrentCancel = () => {
    if (isDrawingRoad) return drawingContext.cancelRoadDrawing;
    if (isDrawingWall) return drawingContext.cancelWallDrawing;
    if (isDrawingWater) return drawingContext.cancelWaterDrawing;
    return () => {};
  };

  const getCurrentUndo = () => {
    if (isDrawingRoad) return drawingContext.undoLastRoadPoint;
    if (isDrawingWall) return drawingContext.undoLastWallPoint;
    if (isDrawingWater) return drawingContext.undoLastWaterPoint;
    return () => {};
  };

  const drawingType = getCurrentDrawingType();
  const points = getCurrentPoints();
  const cancelDrawing = getCurrentCancel();
  const undoLastPoint = getCurrentUndo();

  const getDrawingIcon = () => {
    switch (drawingType) {
      case "road": return "🛣️";
      case "wall": return "🧱";
      case "water": return "💧";
      default: return "✏️";
    }
  };

  const getProgress = () => {
    const minPoints = drawingType === "water" ? 1 : 2;
    const maxPoints = drawingType === "road" ? 10 : 5;
    return Math.min((points.length / maxPoints) * 100, 100);
  };

  const canFinish = () => {
    const minPoints = drawingType === "water" ? 1 : 2;
    return points.length >= minPoints;
  };

  return (
    <Card className="w-full border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <span>{getDrawingIcon()}</span>
            Drawing {drawingType.charAt(0).toUpperCase() + drawingType.slice(1)}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={cancelDrawing}
            className="text-xs h-7"
          >
            Cancel
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Progress</Label>
            <Badge variant="outline" className="text-xs">
              {points.length} points
            </Badge>
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>

        {/* Road-specific controls */}
        {isDrawingRoad && (
          <div className="space-y-3">
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm">Road Type</Label>
              <Select
                value={drawingContext.selectedRoadType}
                onValueChange={(value) => 
                  drawingContext.setSelectedRoadType(value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">🏘️ Residential</SelectItem>
                  <SelectItem value="highway">🛣️ Highway</SelectItem>
                  <SelectItem value="dirt">🌾 Dirt Road</SelectItem>
                  <SelectItem value="pedestrian">🚶 Pedestrian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Width</Label>
                <Badge variant="outline" className="text-xs">
                  {drawingContext.roadWidth}m
                </Badge>
              </div>
              <Slider
                value={[drawingContext.roadWidth]}
                onValueChange={(value) => drawingContext.setRoadWidth(value[0])}
                min={2}
                max={12}
                step={0.5}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Wall-specific controls */}
        {isDrawingWall && (
          <div className="space-y-3">
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm">Wall Type</Label>
              <Select
                value={drawingContext.selectedWallType || "concrete"}
                onValueChange={(value) => 
                  drawingContext.setSelectedWallType?.(value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concrete">🏗️ Concrete</SelectItem>
                  <SelectItem value="brick">🧱 Brick</SelectItem>
                  <SelectItem value="wood">🪵 Wood</SelectItem>
                  <SelectItem value="stone">🗿 Stone</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Water-specific controls */}
        {isDrawingWater && (
          <div className="space-y-3">
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm">Water Type</Label>
              <Select
                value={drawingContext.selectedWaterType || "pond"}
                onValueChange={(value) => 
                  drawingContext.setSelectedWaterType?.(value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pond">🏞️ Pond</SelectItem>
                  <SelectItem value="lake">🏔️ Lake</SelectItem>
                  <SelectItem value="river">🌊 River</SelectItem>
                  <SelectItem value="pool">🏊 Pool</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Actions */}
        <Separator />
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={undoLastPoint}
              disabled={points.length === 0}
              className="text-xs"
            >
              ↶ Undo Point
            </Button>
            <Button
              variant="default"
              size="sm"
              disabled={!canFinish()}
              onClick={() => {
                // Trigger finish drawing based on type
                if (isDrawingRoad) {
                  drawingContext.finishRoadDrawing?.();
                }
                // Add other types as needed
              }}
              className="text-xs"
            >
              ✓ Finish
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 rounded-lg bg-muted/50 text-xs">
          <div className="font-medium mb-1">💡 Instructions:</div>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Click to place points</li>
            <li>• Double-click or Enter to finish</li>
            <li>• Escape to cancel</li>
            <li>• Ctrl+Z to undo last point</li>
            {drawingType === "road" && (
              <li>• C to add curve to last segment</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

