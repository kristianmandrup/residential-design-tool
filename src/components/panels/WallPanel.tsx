/* eslint-disable @typescript-eslint/no-explicit-any */
// File: src/components/panels/WallPanel.tsx
import React from "react";
import { WallObj } from "@/store/storeTypes";
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
import {
  ElevationControl,
  QuickActions,
  StatisticsGrid,
  TypeSelector,
  DimensionSlider,
} from "./shared";
interface WallPanelProps {
  wall: WallObj;
}
export function WallPanel({ wall }: WallPanelProps) {
  const updateObject = useSceneStore((s) => s.updateObject);
  const wallTypes = [
    {
      value: "concrete",
      label: "🏗️ Concrete",
      height: 2.5,
      color: "#CCCCCC",
      description: "Standard concrete walls",
    },
    {
      value: "brick",
      label: "🧱 Brick",
      height: 2.0,
      color: "#8B4513",
      description: "Traditional brick construction",
    },
    {
      value: "wood",
      label: "🪵 Wood",
      height: 1.8,
      color: "#D2691E",
      description: "Wooden fencing",
    },
    {
      value: "stone",
      label: "🗿 Stone",
      height: 2.2,
      color: "#696969",
      description: "Natural stone walls",
    },
  ];
  const wallType = (wall as any).wallType || "concrete";
  const currentType =
    wallTypes.find((t) => t.value === wallType) || wallTypes[0];
  const handleTypeChange = (value: string) => {
    const newType = wallTypes.find((t) => t.value === value);
    if (newType) {
      updateObject(wall.id, {
        wallType: value as any,
        height: newType.height,
        color: newType.color,
      } as any);
    }
  };
  const handleLengthChange = (length: number) => {
    updateObject(wall.id, { length });
  };
  const handleHeightChange = (height: number) => {
    updateObject(wall.id, { height });
  };
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          🧱 Wall Properties
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wall Type */}
        <TypeSelector
          options={wallTypes}
          value={wallType}
          onValueChange={handleTypeChange}
          label="Wall Type"
        />

        {/* Wall Length */}
        <DimensionSlider
          value={wall.length || 2}
          onValueChange={handleLengthChange}
          label="Length"
          min={0.5}
          max={20}
          step={0.5}
        />

        {/* Wall Height */}
        <DimensionSlider
          value={wall.height || currentType.height}
          onValueChange={handleHeightChange}
          label="Height"
          min={0.5}
          max={5}
          step={0.1}
        />

        {/* Wall Elevation */}
        <ElevationControl objectId={wall.id} elevation={wall.elevation} />

        {/* Wall Statistics */}
        <StatisticsGrid
          statistics={[
            {
              label: "Surface Area",
              value: (
                (wall.length || 2) * (wall.height || currentType.height)
              ).toFixed(1),
              unit: "m²",
            },
            {
              label: "Thickness",
              value: (wall.thickness || 0.2).toFixed(2),
              unit: "m",
            },
          ]}
        />

        {/* Quick Actions */}
        <QuickActions
          actions={[
            {
              label: "Reset Type",
              onClick: () => handleTypeChange("concrete"),
              variant: "outline",
              size: "sm",
            },
            {
              label: "Reset Size",
              onClick: () => {
                handleLengthChange(2);
                handleHeightChange(currentType.height);
              },
              variant: "outline",
              size: "sm",
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
