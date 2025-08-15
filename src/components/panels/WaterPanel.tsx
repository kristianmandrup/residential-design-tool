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
  const handleSizeChange = (value: number[]) => {
    if (shape === "circular") {
      updateObject(water.id, { radius: value[0] });
    } else {
      updateObject(water.id, { width: value[0], depth: value[0] });
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
        <div className="space-y-2">
          <Label htmlFor="water-type" className="text-sm font-medium">
            Water Type
          </Label>
          <Select value={waterType} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {waterTypes.map((type) => (
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
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">
              {shape === "circular" ? "Radius" : "Size"}
            </Label>
            <Badge variant="outline" className="text-xs">
              {getCurrentSize()}m
            </Badge>
          </div>
          <Slider
            value={[getCurrentSize()]}
            onValueChange={handleSizeChange}
            min={0.5}
            max={20}
            step={0.5}
            className="w-full"
          />
        </div>

        {/* Water Statistics */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Statistics</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
              <span className="text-lg font-semibold text-primary">
                {calculateArea().toFixed(1)}m²
              </span>
              <span className="text-xs text-muted-foreground">
                Surface Area
              </span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
              <span className="text-lg font-semibold text-primary">
                {((water.transparency || 0.8) * 100).toFixed(0)}%
              </span>
              <span className="text-xs text-muted-foreground">
                Transparency
              </span>
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
              onClick={() => handleTypeChange("pond")}
            >
              Reset Type
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSizeChange([2])}
            >
              Reset Size
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
