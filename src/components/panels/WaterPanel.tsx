/* eslint-disable @typescript-eslint/no-explicit-any */
// File: src/components/panels/WaterPanel.tsx
import React from "react";
import { WaterObj } from "@/store/storeTypes";
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
interface WaterPanelProps {
  water: WaterObj;
}
export function WaterPanel({ water }: WaterPanelProps) {
  const updateObject = useSceneStore((s) => s.updateObject);
  const waterTypes = [
    {
      value: "pond",
      label: "🏞️ Pond",
      color: "#4FC3F7",
      description: "Small decorative water bodies",
    },
    {
      value: "lake",
      label: "🏔️ Lake",
      color: "#2196F3",
      description: "Large natural water bodies",
    },
    {
      value: "river",
      label: "🌊 River",
      color: "#03A9F4",
      description: "Flowing water with current",
    },
    {
      value: "pool",
      label: "🏊 Pool",
      color: "#00BCD4",
      description: "Artificial swimming pools",
    },
  ];
  const waterType = (water as any).waterType || "pond";
  const currentType =
    waterTypes.find((t) => t.value === waterType) || waterTypes[0];
  const shape = water.shape || "circular";
  const handleTypeChange = (value: string) => {
    const newType = waterTypes.find((t) => t.value === value);
    if (newType) {
      updateObject(water.id, {
        waterType: value as any,
        color: newType.color,
      } as any);
    }
  };
  const handleShapeChange = (value: string) => {
    updateObject(water.id, { shape: value as "circular" | "rectangular" });
  };
  const handleSizeChange = (size: number) => {
    if (shape === "circular") {
      updateObject(water.id, { radius: size });
    } else {
      updateObject(water.id, { width: size, depth: size });
    }
  };
  const getCurrentSize = () => {
    if (shape === "circular") {
      return water.radius || 2;
    } else {
      return Math.max(water.width || 2, water.depth || 2);
    }
  };
  const calculateArea = () => {
    if (shape === "circular") {
      const radius = water.radius || 2;
      return Math.PI * radius * radius;
    } else {
      const width = water.width || 2;
      const depth = water.depth || 2;
      return width * depth;
    }
  };
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          💧 Water Properties
          <Badge variant="secondary" className="text-xs">
            {shape}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Water Type */}
        <TypeSelector
          options={waterTypes}
          value={waterType}
          onValueChange={handleTypeChange}
          label="Water Type"
        />

        {/* Shape */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Shape</Label>
          <Select value={shape} onValueChange={handleShapeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="circular">🔵 Circular</SelectItem>
              <SelectItem value="rectangular">⬜ Rectangular</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Size */}
        <DimensionSlider
          value={getCurrentSize()}
          onValueChange={handleSizeChange}
          label={shape === "circular" ? "Radius" : "Size"}
          min={0.5}
          max={20}
          step={0.5}
          formatValue={(value) => `${value}m`}
        />

        {/* Water Elevation */}
        <ElevationControl objectId={water.id} elevation={water.elevation} />

        {/* Water Statistics */}
        <StatisticsGrid
          statistics={[
            {
              label: "Surface Area",
              value: calculateArea().toFixed(1),
              unit: "m²",
            },
            {
              label: "Transparency",
              value: ((water.transparency || 0.8) * 100).toFixed(0),
              unit: "%",
            },
          ]}
        />

        {/* Quick Actions */}
        <QuickActions
          actions={[
            {
              label: "Reset Type",
              onClick: () => handleTypeChange("pond"),
              variant: "outline",
              size: "sm",
            },
            {
              label: "Reset Size",
              onClick: () => handleSizeChange(2),
              variant: "outline",
              size: "sm",
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
