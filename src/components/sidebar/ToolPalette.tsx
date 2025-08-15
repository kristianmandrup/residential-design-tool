import React from "react";
import { useTool, Tool } from "@/contexts/ToolContext";
import { useSceneStore } from "@/store/useSceneStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolPaletteProps {
  compact?: boolean;
}

export function ToolPalette({ compact = false }: ToolPaletteProps) {
  const { selectedTool, setSelectedTool } = useTool();
  const objects = useSceneStore((s) => s.objects);

  const tools = [
    {
      id: "select",
      name: "Select",
      icon: "🎯",
      shortcut: "S",
      description: "Select and move objects",
      category: "navigation",
      color: "blue",
    },
    {
      id: "building",
      name: "Building",
      icon: "🏢",
      shortcut: "B",
      description: "Place buildings",
      category: "structures",
      color: "orange",
    },
    {
      id: "tree",
      name: "Tree",
      icon: "🌳",
      shortcut: "T",
      description: "Place trees",
      category: "nature",
      color: "green",
    },
    {
      id: "road",
      name: "Road",
      icon: "🛣️",
      shortcut: "R",
      description: "Draw roads",
      category: "infrastructure",
      color: "gray",
    },
    {
      id: "wall",
      name: "Wall",
      icon: "🧱",
      shortcut: "W",
      description: "Place walls",
      category: "structures",
      color: "yellow",
    },
    {
      id: "water",
      name: "Water",
      icon: "💧",
      shortcut: "A",
      description: "Place water features",
      category: "nature",
      color: "blue",
    },
  ];

  const getObjectCount = (type: string) => {
    return objects.filter((obj) => obj.type === type).length;
  };

  const categories = {
    navigation: { name: "Navigation", color: "bg-blue-500" },
    structures: { name: "Structures", color: "bg-orange-500" },
    infrastructure: { name: "Infrastructure", color: "bg-gray-600" },
    nature: { name: "Nature", color: "bg-green-500" },
  };

  const groupedTools = Object.entries(categories).map(
    ([categoryId, category]) => ({
      ...category,
      id: categoryId,
      tools: tools.filter((tool) => tool.category === categoryId),
    })
  );

  if (compact) {
    return (
      <TooltipProvider>
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Tools</h4>
          <div className="grid grid-cols-3 gap-1">
            {tools.map((tool) => {
              const count = getObjectCount(tool.id);
              const isSelected = selectedTool === tool.id;

              return (
                <Tooltip key={tool.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      className={`h-12 p-1 flex flex-col items-center gap-1 relative transition-all duration-200 ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : "hover:shadow-md"
                      }`}
                      onClick={() => setSelectedTool(tool.id as Tool)}
                    >
                      <span className="text-lg">{tool.icon}</span>
                      {count > 0 && (
                        <Badge
                          variant="secondary"
                          className="absolute -top-1 -right-1 w-4 h-4 p-0 text-xs"
                        >
                          {count}
                        </Badge>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="text-center">
                      <div className="font-medium">{tool.name}</div>
                      <div className="text-xs opacity-75">
                        {tool.description}
                      </div>
                      <div className="text-xs mt-1">
                        Press{" "}
                        <kbd className="bg-muted px-1 rounded">
                          {tool.shortcut}
                        </kbd>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          🛠️ Tools
          <Badge variant="secondary" className="text-xs">
            {objects.length} objects
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {groupedTools.map((category) => (
          <div key={category.id} className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${category.color}`} />
              <h4 className="text-sm font-medium text-muted-foreground">
                {category.name}
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {category.tools.map((tool) => {
                const count = getObjectCount(tool.id);
                const isSelected = selectedTool === tool.id;

                return (
                  <TooltipProvider key={tool.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          className={`h-auto p-3 flex flex-col items-center gap-1 relative transition-all duration-200 ${
                            isSelected
                              ? "bg-primary text-primary-foreground shadow-lg scale-105"
                              : "hover:scale-105 hover:shadow-md"
                          }`}
                          onClick={() => setSelectedTool(tool.id as Tool)}
                        >
                          <span className="text-lg">{tool.icon}</span>
                          <span className="text-xs font-medium">
                            {tool.name}
                          </span>
                          <kbd className="absolute -top-1 -right-1 bg-muted text-muted-foreground text-xs px-1 py-0.5 rounded text-[10px]">
                            {tool.shortcut}
                          </kbd>
                          {count > 0 && (
                            <Badge
                              variant="secondary"
                              className="absolute flex items-center justify-center w-5 h-5 p-0 text-xs -bottom-1 -left-1"
                            >
                              {count}
                            </Badge>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center">
                          <div className="font-medium">{tool.description}</div>
                          <div className="text-xs mt-1">
                            Press{" "}
                            <kbd className="bg-muted px-1 rounded">
                              {tool.shortcut}
                            </kbd>
                          </div>
                          {count > 0 && (
                            <div className="text-xs opacity-75 mt-1">
                              {count} in scene
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
