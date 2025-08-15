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
  const handleLengthChange = (value: number[]) => {
    updateObject(wall.id, { length: value[0] });
  };
  const handleHeightChange = (value: number[]) => {
    updateObject(wall.id, { height: value[0] });
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
        <div className="space-y-2">
          <Label htmlFor="wall-type" className="text-sm font-medium">
            Wall Type
          </Label>
          <Select value={wallType} onValueChange={handleTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {wallTypes.map((type) => (
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
        {/* Wall Length */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Length</Label>
            <Badge variant="outline" className="text-xs">
              {wall.length || 2}m
            </Badge>
          </div>
          <Slider
            value={[wall.length || 2]}
            onValueChange={handleLengthChange}
            min={0.5}
            max={20}
            step={0.5}
            className="w-full"
          />
        </div>

        {/* Wall Height */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Height</Label>
            <Badge variant="outline" className="text-xs">
              {wall.height || currentType.height}m
            </Badge>
          </div>
          <Slider
            value={[wall.height || currentType.height]}
            onValueChange={handleHeightChange}
            min={0.5}
            max={5}
            step={0.1}
            className="w-full"
          />
        </div>

        {/* Wall Statistics */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Statistics</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
              <span className="text-lg font-semibold text-primary">
                {(
                  (wall.length || 2) * (wall.height || currentType.height)
                ).toFixed(1)}
                m²
              </span>
              <span className="text-xs text-muted-foreground">
                Surface Area
              </span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
              <span className="text-lg font-semibold text-primary">
                {(wall.thickness || 0.2).toFixed(2)}m
              </span>
              <span className="text-xs text-muted-foreground">Thickness</span>
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
              onClick={() => handleTypeChange("concrete")}
            >
              Reset Type
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleLengthChange([2]);
                handleHeightChange([currentType.height]);
              }}
            >
              Reset Size
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
