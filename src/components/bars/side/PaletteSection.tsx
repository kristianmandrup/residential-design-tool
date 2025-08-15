// src/components/bars/side/PaletteSection.tsx - Refactored
import React from "react";
import Section from "../../generic/Section";
import { Tool, useTool } from "@/contexts/ToolContext";
import { useSceneStore } from "@/store/useSceneStore";
import { QuickStats, PaletteItem } from "@/components/palette";

interface ToolItem {
  id: string;
  name: string;
  icon: string;
  shortcut: string;
  description: string;
  color: string;
}

const TOOL_ITEMS: ToolItem[] = [
  {
    id: "select",
    name: "Select",
    icon: "👆",
    shortcut: "S",
    description: "Select and move objects",
    color: "bg-gray-500",
  },
  {
    id: "building",
    name: "Building",
    icon: "🏠",
    shortcut: "B",
    description: "Place buildings",
    color: "bg-blue-600",
  },
  {
    id: "tree",
    name: "Tree",
    icon: "🌳",
    shortcut: "T",
    description: "Place trees",
    color: "bg-green-500",
  },
  {
    id: "road",
    name: "Road",
    icon: "🛣️",
    shortcut: "R",
    description: "Draw roads",
    color: "bg-gray-700",
  },
  {
    id: "wall",
    name: "Wall",
    icon: "🧱",
    shortcut: "W",
    description: "Place walls",
    color: "bg-yellow-500",
  },
  {
    id: "water",
    name: "Water",
    icon: "💧",
    shortcut: "A",
    description: "Place water features",
    color: "bg-blue-500",
  },
];

export default function PaletteSection() {
  const { selectedTool, setSelectedTool } = useTool();
  const objects = useSceneStore((s) => s.objects);

  const getObjectCount = (type: string) => {
    return objects.filter((obj) => obj.type === type).length;
  };

  const buildingCount = getObjectCount("building");
  const treeCount = getObjectCount("tree");
  const roadCount = getObjectCount("road");

  return (
    <Section>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Tools</h3>
          <div className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded-full">
            {objects.length} objects
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {TOOL_ITEMS.map((item) => (
            <PaletteItem
              key={item.id}
              id={item.id}
              name={item.name}
              icon={item.icon}
              shortcut={item.shortcut}
              description={item.description}
              color={item.color}
              isSelected={selectedTool === item.id}
              objectCount={getObjectCount(item.id)}
              onSelect={() => setSelectedTool(item.id as Tool)}
            />
          ))}
        </div>

        <QuickStats
          buildingCount={buildingCount}
          treeCount={treeCount}
          roadCount={roadCount}
          totalObjects={objects.length}
        />
      </div>
    </Section>
  );
}
