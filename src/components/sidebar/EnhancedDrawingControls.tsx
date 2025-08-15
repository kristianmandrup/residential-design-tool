// File: src/components/sidebar/EnhancedDrawingControls.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
interface DrawingState {
  isDrawing: boolean;
  tempPoints: Array<{ x: number; z: number }>;
  selectedType: string;
  showPreview?: boolean;
  showIntersections?: boolean;
  autoOptimize?: boolean;
}
interface DrawingActions {
  undoLastPoint: () => void;
  cancelDrawing: () => void;
  finishDrawing: () => void;
  togglePreview?: () => void;
  toggleIntersections?: () => void;
  toggleAutoOptimize?: () => void;
  setSelectedType: (type: string) => void;
}
interface EnhancedDrawingControlsProps {
  roadDrawing?: DrawingState & DrawingActions;
  wallDrawing?: DrawingState & DrawingActions;
  waterDrawing?: DrawingState & DrawingActions;
}
export function EnhancedDrawingControls({
  roadDrawing,
  wallDrawing,
  waterDrawing,
}: EnhancedDrawingControlsProps) {
  // Get current active drawing
  const activeDrawing = roadDrawing?.isDrawing
    ? roadDrawing
    : wallDrawing?.isDrawing
    ? wallDrawing
    : waterDrawing?.isDrawing
    ? waterDrawing
    : null;
  const getDrawingIcon = () => {
    if (roadDrawing?.isDrawing) return "🛣️";
    if (wallDrawing?.isDrawing) return "🧱";
    if (waterDrawing?.isDrawing) return "💧";
    return "🎨";
  };
  const getDrawingTypeName = () => {
    if (roadDrawing?.isDrawing) return "Road";
    if (wallDrawing?.isDrawing) return "Wall";
    if (waterDrawing?.isDrawing) return "Water";
    return "Object";
  };
  if (!activeDrawing) return null;
  return (
    <Card className="w-full border-primary/20 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <span>{getDrawingIcon()}</span>
            Enhanced Drawing {getDrawingTypeName()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={activeDrawing.cancelDrawing}
            className="text-xs h-7"
          >
            Cancel
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Type Selection */}
        <div className="space-y-2">
          <Label className="text-sm">Type</Label>
          <Select
            value={activeDrawing.selectedType}
            onValueChange={activeDrawing.setSelectedType}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {/* Road types */}
              {roadDrawing?.isDrawing && (
                <>
                  <SelectItem value="residential">🏘️ Residential</SelectItem>
                  <SelectItem value="highway">🛣️ Highway</SelectItem>
                  <SelectItem value="dirt">🌾 Dirt Road</SelectItem>
                  <SelectItem value="pedestrian">🚶 Pedestrian</SelectItem>
                </>
              )}

              {/* Wall types */}
              {wallDrawing?.isDrawing && (
                <>
                  <SelectItem value="concrete">🏗️ Concrete</SelectItem>
                  <SelectItem value="brick">🧱 Brick</SelectItem>
                  <SelectItem value="wood">🪵 Wood</SelectItem>
                  <SelectItem value="stone">🗿 Stone</SelectItem>
                </>
              )}

              {/* Water types */}
              {waterDrawing?.isDrawing && (
                <>
                  <SelectItem value="pond">🏞️ Pond</SelectItem>
                  <SelectItem value="lake">🏔️ Lake</SelectItem>
                  <SelectItem value="river">🌊 River</SelectItem>
                  <SelectItem value="pool">🏊 Pool</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Drawing Info */}
        <div className="flex items-center justify-between">
          <Label className="text-sm">Points</Label>
          <Badge variant="outline" className="text-xs">
            {activeDrawing.tempPoints.length}
          </Badge>
        </div>

        {/* Enhanced Features */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Enhanced Features</Label>

          {activeDrawing.togglePreview && (
            <div className="flex items-center justify-between">
              <Label htmlFor="preview" className="text-sm">
                Show Preview
              </Label>
              <Switch
                id="preview"
                checked={activeDrawing.showPreview || false}
                onCheckedChange={activeDrawing.togglePreview}
              />
            </div>
          )}

          {activeDrawing.toggleIntersections && (
            <div className="flex items-center justify-between">
              <Label htmlFor="intersections" className="text-sm">
                Detect Intersections
              </Label>
              <Switch
                id="intersections"
                checked={activeDrawing.showIntersections || false}
                onCheckedChange={activeDrawing.toggleIntersections}
              />
            </div>
          )}

          {activeDrawing.toggleAutoOptimize && (
            <div className="flex items-center justify-between">
              <Label htmlFor="optimize" className="text-sm">
                Auto Optimize
              </Label>
              <Switch
                id="optimize"
                checked={activeDrawing.autoOptimize || false}
                onCheckedChange={activeDrawing.toggleAutoOptimize}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={activeDrawing.undoLastPoint}
              disabled={activeDrawing.tempPoints.length === 0}
              className="text-xs"
            >
              ↶ Undo Point
            </Button>
            <Button
              variant="default"
              size="sm"
              disabled={activeDrawing.tempPoints.length < 2}
              onClick={activeDrawing.finishDrawing}
              className="text-xs"
            >
              ✓ Finish
            </Button>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="p-3 mt-4 text-xs rounded-lg bg-muted/50">
          <div className="mb-1 font-medium">⌨️ Shortcuts:</div>
          <div className="grid grid-cols-2 gap-1">
            <div className="flex justify-between">
              <kbd className="px-1 border rounded bg-background border-border">
                Enter
              </kbd>
              <span>Finish</span>
            </div>
            <div className="flex justify-between">
              <kbd className="px-1 border rounded bg-background border-border">
                Esc
              </kbd>
              <span>Cancel</span>
            </div>
            <div className="flex justify-between">
              <kbd className="px-1 border rounded bg-background border-border">
                Ctrl+Z
              </kbd>
              <span>Undo</span>
            </div>
            <div className="flex justify-between">
              <kbd className="px-1 border rounded bg-background border-border">
                P
              </kbd>
              <span>Preview</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
