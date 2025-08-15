// File: src/components/panels/TreePanel.tsx
import React from "react";
import { TreeObj } from "@/store/storeTypes";
import { useSceneStore } from "@/store/useSceneStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
interface TreePanelProps {
  tree: TreeObj;
}
export function TreePanel({ tree }: TreePanelProps) {
  const updateObject = useSceneStore((s) => s.updateObject);
  const treeTypes = [
    {
      value: "oak",
      label: "🌳 Oak",
      color: "#2E8B57",
      description: "Large deciduous tree",
    },
    {
      value: "pine",
      label: "🌲 Pine",
      color: "#228B22",
      description: "Evergreen conifer",
    },
    {
      value: "maple",
      label: "🍁 Maple",
      color: "#FF6347",
      description: "Colorful autumn tree",
    },
    {
      value: "palm",
      label: "🌴 Palm",
      color: "#32CD32",
      description: "Tropical palm tree",
    },
  ];
  const treeType = tree.treeType || "oak";
  const currentType =
    treeTypes.find((t) => t.value === treeType) || treeTypes[0];
  const handleTypeChange = (value: string) => {
    const newType = treeTypes.find((t) => t.value === value);
    if (newType) {
      updateObject(tree.id, {
        treeType: value,
        foliageColor: newType.color,
      });
    }
  };
  const handleSizeChange = (value: number[]) => {
    const newSize = value[0];
    updateObject(tree.id, {
      gridWidth: newSize,
      gridDepth: newSize,
      gridHeight: newSize,
    });
  };
  const handleColorChange = (color: string) => {
    updateObject(tree.id, { foliageColor: color });
  };
  const getCurrentSize = () => {
    return Math.max(
      tree.gridWidth || 1,
      tree.gridDepth || 1,
      tree.gridHeight || 1
    );
  };
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          🌳 Tree Properties
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tree Type */}
        <div className="space-y-2">
          <Label htmlFor="tree-type" className="text-sm font-medium">
            Tree Type
          </Label>
          <Select value={treeType} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {treeTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex flex-col">
                    <span>{type.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {type.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Tree Size */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Size</Label>
            <Badge variant="outline" className="text-xs">
              {getCurrentSize()}x
            </Badge>
          </div>
          <Slider
            value={[getCurrentSize()]}
            onValueChange={handleSizeChange}
            min={0.5}
            max={3}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Small</span>
            <span>Large</span>
          </div>
        </div>

        {/* Foliage Color */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Foliage Color</Label>
          <div className="grid grid-cols-4 gap-2">
            {[
              "#2E8B57",
              "#228B22",
              "#32CD32",
              "#FF6347",
              "#FFD700",
              "#8B4513",
            ].map((color) => (
              <button
                key={color}
                className={`w-12 h-12 rounded-lg border-2 transition-all hover:scale-105 ${
                  tree.foliageColor === color
                    ? "border-primary"
                    : "border-muted"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => handleColorChange(color)}
              />
            ))}
          </div>
        </div>

        {/* Tree Statistics */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Statistics</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
              <span className="text-lg font-semibold text-primary">
                {(getCurrentSize() * 1.5).toFixed(1)}m
              </span>
              <span className="text-xs text-muted-foreground">Height</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
              <span className="text-lg font-semibold text-primary">
                {(Math.PI * Math.pow(getCurrentSize() * 0.6, 2)).toFixed(1)}m²
              </span>
              <span className="text-xs text-muted-foreground">Canopy Area</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Quick Actions</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTypeChange("oak")}
            >
              Reset Type
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSizeChange([1])}
            >
              Reset Size
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
