"use client";
import React from "react";
import { useStore, StoreState } from "../store";
import { useTool } from "../contexts/ToolContext";
import { PaletteItem } from "./palette";

export default function ObjectPalette() {
  const selectedId = useStore((s: StoreState) => s.selectedId);
  const objects = useStore((s: StoreState) => s.objects);
  const { selectedTool, setSelectedTool } = useTool();

  const paletteItems = [
    {
      id: "select",
      name: "Select",
      icon: "👆",
      shortcut: "S",
      color: "bg-gray-500",
      action: () => {
        setSelectedTool("select");
      },
    },
    {
      id: "building",
      name: "Building",
      icon: "🏠",
      shortcut: "B",
      color: "bg-blue-600",
      action: () => {
        setSelectedTool("building");
      },
    },
    {
      id: "tree",
      name: "Tree",
      icon: "🌳",
      shortcut: "T",
      color: "bg-green-500",
      action: () => {
        setSelectedTool("tree");
      },
    },
    {
      id: "wall",
      name: "Wall",
      icon: "🧱",
      shortcut: "W",
      color: "bg-yellow-500",
      action: () => {
        setSelectedTool("wall");
      },
    },
    {
      id: "road",
      name: "Road",
      icon: "🛣️",
      shortcut: "R",
      color: "bg-gray-700",
      action: () => {
        setSelectedTool("road");
      },
    },
    {
      id: "water",
      name: "Water",
      icon: "💧",
      shortcut: "A",
      color: "bg-blue-500",
      action: () => {
        setSelectedTool("water");
      },
    },
  ];

  const selectedItem = objects.find((obj) => obj.id === selectedId);

  return (
    <div className="grid grid-cols-1 gap-3 m-4 sm:grid-cols-2">
      {paletteItems.map((item) => (
        <PaletteItem
          key={item.id}
          id={item.id}
          name={item.name}
          icon={item.icon}
          shortcut={item.shortcut}
          color={item.color}
          action={item.action}
          isSelected={
            selectedTool === item.id || selectedItem?.type === item.id
          }
        />
      ))}
    </div>
  );
}
