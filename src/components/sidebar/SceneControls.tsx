import React from "react";
import { useSceneStore } from "@/store/useSceneStore";
import { useGrid } from "@/contexts/GridContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
export function SceneControls() {
  const gridSize = useSceneStore((s) => s.gridSize);
  const snapEnabled = useSceneStore((s) => s.snapEnabled);
  const toggleSnap = useSceneStore((s) => s.toggleSnap);
  const undo = useSceneStore((s) => s.undo);
  const redo = useSceneStore((s) => s.redo);
  const { showGrid, toggleGrid } = useGrid();
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          ⚙️ Scene Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Grid Controls */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Grid Settings</Label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">Show Grid</span>
                <Badge variant="outline" className="text-xs">
                  {gridSize}m
                </Badge>
              </div>
              <Switch checked={showGrid} onCheckedChange={toggleGrid} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Snap to Grid</span>
              <Switch checked={snapEnabled} onCheckedChange={toggleSnap} />
            </div>
          </div>
        </div>
        {/* Action Controls */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Actions</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              className="text-xs"
            >
              ↶ Undo
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              className="text-xs"
            >
              ↷ Redo
            </Button>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Shortcuts</Label>
          <div className="space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1">
                <kbd className="bg-muted text-muted-foreground px-1 py-0.5 rounded text-xs">
                  S
                </kbd>
                <span>Select</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="bg-muted text-muted-foreground px-1 py-0.5 rounded text-xs">
                  R
                </kbd>
                <span>Road</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="bg-muted text-muted-foreground px-1 py-0.5 rounded text-xs">
                  B
                </kbd>
                <span>Building</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="bg-muted text-muted-foreground px-1 py-0.5 rounded text-xs">
                  T
                </kbd>
                <span>Tree</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="bg-muted text-muted-foreground px-1 py-0.5 rounded text-xs">
                  W
                </kbd>
                <span>Wall</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="bg-muted text-muted-foreground px-1 py-0.5 rounded text-xs">
                  A
                </kbd>
                <span>Water</span>
              </div>
            </div>
            <div className="pt-2 space-y-1 border-t">
              <div className="flex items-center gap-1">
                <kbd className="bg-muted text-muted-foreground px-1 py-0.5 rounded text-xs">
                  Esc
                </kbd>
                <span>Cancel/Deselect</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="bg-muted text-muted-foreground px-1 py-0.5 rounded text-xs">
                  Del
                </kbd>
                <span>Delete Selected</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
