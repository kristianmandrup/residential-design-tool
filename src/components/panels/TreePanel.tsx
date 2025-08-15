// File: src/components/panels/TreePanel.tsx
import React from "react";
import { TreeObj } from "@/store/storeTypes";
import { useSceneStore } from "@/store/useSceneStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ElevationControl,
  QuickActions,
  StatisticsGrid,
  ColorPalette,
  TypeSelector,
  DimensionSlider,
} from "./shared";
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
  const handleSizeChange = (newSize: number) => {
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
        <TypeSelector
          options={treeTypes}
          value={treeType}
          onValueChange={handleTypeChange}
          label="Tree Type"
        />

        {/* Tree Size */}
        <DimensionSlider
          value={getCurrentSize()}
          onValueChange={handleSizeChange}
          label="Size"
          min={0.5}
          max={3}
          step={0.5}
          showRangeLabels
          formatValue={(value) => `${value}x`}
        />

        {/* Tree Elevation */}
        <ElevationControl objectId={tree.id} elevation={tree.elevation} />

        {/* Foliage Color */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Foliage Color</Label>
          <ColorPalette
            colors={[
              { value: "#2E8B57" },
              { value: "#228B22" },
              { value: "#32CD32" },
              { value: "#FF6347" },
              { value: "#FFD700" },
              { value: "#8B4513" },
            ]}
            selectedColor={tree.foliageColor}
            onColorChange={handleColorChange}
          />
        </div>

        {/* Tree Statistics */}
        <StatisticsGrid
          statistics={[
            {
              label: "Height",
              value: (getCurrentSize() * 1.5).toFixed(1),
              unit: "m",
            },
            {
              label: "Canopy Area",
              value: (Math.PI * Math.pow(getCurrentSize() * 0.6, 2)).toFixed(1),
              unit: "m²",
            },
          ]}
        />

        {/* Quick Actions */}
        <QuickActions
          actions={[
            {
              label: "Reset Type",
              onClick: () => handleTypeChange("oak"),
              variant: "outline",
              size: "sm",
            },
            {
              label: "Reset Size",
              onClick: () => handleSizeChange(1),
              variant: "outline",
              size: "sm",
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
