"use client";
import React from "react";
import { useStore, StoreState } from "../store";
import { useTool } from "../contexts/ToolContext";
import { PaletteItem } from "./palette";

export default function ObjectPalette() {
  const addObject = useStore((s: StoreState) => s.addObject);
  const selectedId = useStore((s: StoreState) => s.selectedId);
  const objects = useStore((s: StoreState) => s.objects);
  const { selectedTool, setSelectedTool } = useTool();

  const createBuilding = () => {
    addObject({
      type: "building",
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      floors: 2,
      color: "#d9d9d9",
      roofType: "gabled",
      roofColor: "#666666",
    });
  };

  const createTree = () => {
    addObject({
      type: "tree",
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    });
  };

  const createWall = () => {
    addObject({
      type: "wall",
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      length: 3,
      height: 1,
    });
  };

  const createRoad = () => {
    addObject({
      type: "road",
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      points: [
        [0, 0],
        [2, 0],
      ],
      width: 1,
    });
  };

  const paletteItems = [
    {
      id: "building",
      name: "Building",
      icon: "🏠",
      shortcut: "B",
      color: "bg-blue-600",
      action: () => {
        setSelectedTool("building");
        createBuilding();
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
        createTree();
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
        createWall();
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
        createRoad();
      },
    },
  ];

  const selectedItem = objects.find((obj) => obj.id === selectedId);

  return (
    <div className="flex flex-col gap-3 m-4 space-y-3">
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
