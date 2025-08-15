/* eslint-disable @typescript-eslint/no-explicit-any */
// File: src/components/panels/RoadPanel.tsx
import React from "react";
import { RoadObj } from "@/store/storeTypes";
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
interface RoadPanelProps {
  road: RoadObj;
}
export function RoadPanel({ road }: RoadPanelProps) {
  const updateObject = useSceneStore((s) => s.updateObject);
  const roadTypes = [
    {
      value: "residential",
      label: "🏘️ Residential",
      width: 6,
      description: "Standard suburban roads",
    },
    {
      value: "highway",
      label: "🛣️ Highway",
      width: 8,
      description: "High-speed arterials",
    },
    {
      value: "dirt",
      label: "🌾 Dirt Road",
      width: 4,
      description: "Unpaved rural roads",
    },
    {
      value: "pedestrian",
      label: "🚶 Pedestrian",
      width: 2,
      description: "Walking paths",
    },
  ];
  const currentType =
    roadTypes.find((t) => t.value === road.roadType) || roadTypes[0];
  const handleTypeChange = (value: string) => {
    const newType = roadTypes.find((t) => t.value === value);
    if (newType) {
      updateObject(road.id, {
        roadType: value as any,
        width: newType.width,
      });
    }
  };
  const handleWidthChange = (width: number) => {
    updateObject(road.id, { width });
  };
  const calculateLength = () => {
    if (!road.points || road.points.length < 2) return 0;
    let total = 0;
    for (let i = 0; i < road.points.length - 1; i++) {
      const p1 = road.points[i];
      const p2 = road.points[i + 1];
      const dx = p2.x - p1.x;
      const dz = p2.z - p1.z;
      total += Math.sqrt(dx * dx + dz * dz);
    }
    return total;
  };
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          🛣️ Road Properties
          <Badge variant="secondary" className="text-xs">
            {road.points?.length || 0} points
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Road Type */}
        <TypeSelector
          options={roadTypes}
          value={road.roadType}
          onValueChange={handleTypeChange}
          label="Road Type"
        />
        <p className="text-xs text-muted-foreground">
          {currentType.description}
        </p>

        {/* Road Width */}
        <DimensionSlider
          value={road.width || currentType.width}
          onValueChange={handleWidthChange}
          label="Width"
          min={1}
          max={20}
          step={0.5}
          showRangeLabels
          formatValue={(value) => `${value}m`}
        />

        {/* Road Elevation */}
        <ElevationControl objectId={road.id} elevation={road.elevation} />

        {/* Road Statistics */}
        <StatisticsGrid
          statistics={[
            {
              label: "Length",
              value: calculateLength().toFixed(1),
              unit: "m",
            },
            {
              label: "Area",
              value: (
                (road.width || currentType.width) * calculateLength()
              ).toFixed(1),
              unit: "m²",
            },
          ]}
        />

        {/* Quick Actions */}
        <QuickActions
          actions={[
            {
              label: "Reset Type",
              onClick: () => handleTypeChange("residential"),
              variant: "outline",
              size: "sm",
            },
            {
              label: "Reset Width",
              onClick: () => handleWidthChange(currentType.width),
              variant: "outline",
              size: "sm",
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
