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
  const handleWidthChange = (value: number[]) => {
    updateObject(road.id, { width: value[0] });
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
        <div className="space-y-2">
          <Label htmlFor="road-type" className="text-sm font-medium">
            Road Type
          </Label>
          <Select value={road.roadType} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roadTypes.map((type) => (
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
          <p className="text-xs text-muted-foreground">
            {currentType.description}
          </p>
        </div>
        {/* Road Width */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Width</Label>
            <Badge variant="outline" className="text-xs">
              {road.width || currentType.width}m
            </Badge>
          </div>
          <Slider
            value={[road.width || currentType.width]}
            onValueChange={handleWidthChange}
            min={1}
            max={20}
            step={0.5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1m</span>
            <span>20m</span>
          </div>
        </div>

        {/* Road Statistics */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Statistics</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
              <span className="text-lg font-semibold text-primary">
                {calculateLength().toFixed(1)}m
              </span>
              <span className="text-xs text-muted-foreground">Length</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
              <span className="text-lg font-semibold text-primary">
                {(
                  (road.width || currentType.width) * calculateLength()
                ).toFixed(1)}
                m²
              </span>
              <span className="text-xs text-muted-foreground">Area</span>
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
              onClick={() => handleTypeChange("residential")}
            >
              Reset Type
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleWidthChange([currentType.width])}
            >
              Reset Width
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
