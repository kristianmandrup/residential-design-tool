/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { BuildingObj } from "@/store/storeTypes";
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
import { Switch } from "@/components/ui/switch";
import { CollapsibleSection, PositionInputs, GridSizeFields } from "./shared";
interface BuildingPanelProps {
  building: BuildingObj;
}
export function BuildingPanel({ building }: BuildingPanelProps) {
  const updateObject = useSceneStore((s) => s.updateObject);
  const [selectedFloor, setSelectedFloor] = useState(0);
  const roofTypes = [
    { value: "flat", label: "🏢 Flat", description: "Modern flat roof" },
    {
      value: "gabled",
      label: "🏠 Gabled",
      description: "Traditional peaked roof",
    },
    {
      value: "hipped",
      label: "🏘️ Hipped",
      description: "Four-sided sloped roof",
    },
  ];
  const handleFloorsChange = (value: number[]) => {
    const newFloors = Math.max(1, Math.min(10, value[0]));
    let newFloorProperties = [...building.floorProperties];
    if (newFloors > building.floors) {
      for (let i = building.floors; i < newFloors; i++) {
        newFloorProperties.push({
          windowsEnabled: true,
          wallColor: building.color,
          name: `Floor ${i + 1}`,
        });
      }
    } else if (newFloors < building.floors) {
      newFloorProperties = newFloorProperties.slice(0, newFloors);
    }
    updateObject(building.id, {
      floors: newFloors,
      floorProperties: newFloorProperties,
    });
    if (selectedFloor >= newFloors) {
      setSelectedFloor(newFloors - 1);
    }
  };
  const handleRoofTypeChange = (value: string) => {
    updateObject(building.id, { roofType: value as any });
  };
  const handleColorChange = (color: string) => {
    updateObject(building.id, { color });
  };
  const toggleWindowsForFloor = (floorIndex: number) => {
    const newFloorProperties = [...building.floorProperties];
    newFloorProperties[floorIndex] = {
      ...newFloorProperties[floorIndex],
      windowsEnabled: !newFloorProperties[floorIndex].windowsEnabled,
    };
    updateObject(building.id, { floorProperties: newFloorProperties });
  };
  const calculateTotalArea = () => {
    const width = (building.gridWidth || 2) * 1.0;
    const depth = (building.gridDepth || 2) * 1.0;
    return width * depth * building.floors;
  };
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          🏢 Building Properties
          <Badge variant="secondary" className="text-xs">
            {building.floors} floors
          </Badge>
        </CardTitle>
      </CardHeader>{" "}
      <CardContent className="space-y-4">
        {/* Basic Properties */}
        <CollapsibleSection title="Basic Properties" defaultCollapsed={false}>
          <PositionInputs selected={building} updateObject={updateObject} />{" "}
          <GridSizeFields
            gridWidth={building.gridWidth || 2}
            gridDepth={building.gridDepth || 2}
            gridHeight={building.gridHeight || 1}
            onGridWidthChange={(value) =>
              updateObject(building.id, { gridWidth: Math.max(1, value) })
            }
            onGridDepthChange={(value) =>
              updateObject(building.id, { gridDepth: Math.max(1, value) })
            }
            onGridHeightChange={(value) =>
              updateObject(building.id, {
                gridHeight: Math.max(1, Math.min(5, value)),
              })
            }
          />
        </CollapsibleSection>{" "}
        {/* Building Configuration */}
        <CollapsibleSection
          title="Building Configuration"
          defaultCollapsed={false}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Floors</Label>
              <Badge variant="outline" className="text-xs">
                {building.floors}
              </Badge>
            </div>
            <Slider
              value={[building.floors]}
              onValueChange={handleFloorsChange}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
          </div>{" "}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Roof Type</Label>
            <Select
              value={building.roofType}
              onValueChange={handleRoofTypeChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roofTypes.map((type) => (
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
        </CollapsibleSection>{" "}
        {/* Colors */}
        <CollapsibleSection title="Colors" defaultCollapsed={true}>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Wall Color</Label>
              <div className="flex gap-2">
                {["#d9d9d9", "#8B4513", "#CD853F", "#F5DEB3"].map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${
                      building.color === color
                        ? "border-primary"
                        : "border-muted"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Roof Color</Label>
              <div className="flex gap-2">
                {["#666666", "#8B4513", "#2F4F4F", "#800000"].map((color) => (
                  <button
                    key={color}
                    className={`w-8 h-8 rounded-full border-2 ${
                      building.roofColor === color
                        ? "border-primary"
                        : "border-muted"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() =>
                      updateObject(building.id, { roofColor: color })
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </CollapsibleSection>{" "}
        {/* Floor Settings */}
        <CollapsibleSection title="Floor Settings" defaultCollapsed={true}>
          <div className="space-y-2">
            <Select
              value={selectedFloor.toString()}
              onValueChange={(value: string) =>
                setSelectedFloor(parseInt(value))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: building.floors }, (_, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    Floor {i + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>{" "}
          <div className="space-y-2">
            {building.floorProperties.map((floor, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-2 rounded-lg ${
                  index === selectedFloor ? "bg-primary/10" : "bg-muted/50"
                }`}
              >
                <span className="text-sm">Floor {index + 1}</span>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Windows</Label>
                  <Switch
                    checked={floor.windowsEnabled}
                    onCheckedChange={() => toggleWindowsForFloor(index)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>{" "}
        {/* Statistics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
            <span className="text-lg font-semibold text-primary">
              {calculateTotalArea().toFixed(0)}m²
            </span>
            <span className="text-xs text-muted-foreground">Total Area</span>
          </div>
          <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
            <span className="text-lg font-semibold text-primary">
              {((building.gridHeight || 1) * building.floors * 1.0).toFixed(1)}m
            </span>
            <span className="text-xs text-muted-foreground">Height</span>
          </div>
        </div>{" "}
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRoofTypeChange("gabled")}
          >
            Reset Roof
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFloorsChange([2])}
          >
            Reset Floors
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
