/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useSceneStore } from "@/store/useSceneStore";
import { useTool } from "@/contexts/ToolContext";
import { useGenericDrawingContext } from "@/contexts/GenericDrawingContext";
import { ToolPalette } from "./ToolPalette";
import { ObjectList } from "./ObjectList";
import { SceneControls } from "./SceneControls";
import { DrawingControls } from "./DrawingControls";
import { ProjectManager } from "./ProjectManager";
import { SearchPanel } from "./SearchPanel";
import { TipsPanel } from "./TipsPanel";
import {
  RoadPanel,
  WallPanel,
  WaterPanel,
  BuildingPanel,
  TreePanel,
} from "@/components/panels";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Sidebar() {
  const objects = useSceneStore((s) => s.objects);
  const selectedId = useSceneStore((s) => s.selectedId);
  const selectedObject = selectedId
    ? objects.find((obj) => obj.id === selectedId)
    : null;

  const { selectedTool } = useTool();
  const drawingContext = useGenericDrawingContext();

  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<string>("tools");

  // Check if any drawing is active
  const isDrawingActive = React.useMemo(() => {
    return (
      drawingContext.isDrawingRoad ||
      drawingContext.isDrawingWall ||
      drawingContext.isDrawingWater
    );
  }, [
    drawingContext.isDrawingRoad,
    drawingContext.isDrawingWall,
    drawingContext.isDrawingWater,
  ]);

  // Render object-specific panel
  const renderObjectPanel = () => {
    if (!selectedObject) return null;

    switch (selectedObject.type) {
      case "road":
        return <RoadPanel road={selectedObject as any} />;
      case "wall":
        return <WallPanel wall={selectedObject as any} />;
      case "water":
        return <WaterPanel water={selectedObject as any} />;
      case "building":
        return <BuildingPanel building={selectedObject as any} />;
      case "tree":
        return <TreePanel tree={selectedObject as any} />;
      default:
        return null;
    }
  };

  const sections = [
    {
      id: "tools",
      label: "Tools",
      icon: "🛠️",
      component: <ToolPalette />,
      priority: 1,
    },
    {
      id: "drawing",
      label: "Drawing",
      icon: "✏️",
      component: <DrawingControls />,
      priority: 2,
      show: isDrawingActive,
    },
    {
      id: "selected",
      label: "Properties",
      icon: "⚙️",
      component: renderObjectPanel(),
      priority: 3,
      show: !!selectedObject,
    },
    {
      id: "objects",
      label: "Objects",
      icon: "📦",
      component: <ObjectList />,
      priority: 4,
      badge: objects.length,
    },
    {
      id: "search",
      label: "Search",
      icon: "🔍",
      component: <SearchPanel />,
      priority: 5,
    },
    {
      id: "scene",
      label: "Scene",
      icon: "🌍",
      component: <SceneControls />,
      priority: 6,
    },
    {
      id: "project",
      label: "Project",
      icon: "💾",
      component: <ProjectManager />,
      priority: 7,
    },
    {
      id: "tips",
      label: "Tips",
      icon: "💡",
      component: <TipsPanel />,
      priority: 8,
    },
  ].filter((section) => section.show !== false);

  if (isCollapsed) {
    return (
      <div className="flex flex-col w-12 h-full border-r bg-background border-border">
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(false)}
            className="w-8 h-8 p-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-col flex-1 gap-1 p-1">
          {sections.slice(0, 6).map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setActiveSection(section.id);
                setIsCollapsed(false);
              }}
              className="relative w-8 h-8 p-0"
              title={section.label}
            >
              <span className="text-sm">{section.icon}</span>
              {section.badge && (
                <Badge
                  variant="secondary"
                  className="absolute w-4 h-4 p-0 text-xs -top-1 -right-1"
                >
                  {section.badge > 99 ? "99+" : section.badge}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border-r w-80 bg-background border-border">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Scene Editor</h2>
          <Badge variant="outline" className="text-xs">
            {objects.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(true)}
          className="w-8 h-8 p-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Active Tool Indicator */}
      {selectedTool && selectedTool !== "select" && (
        <div className="px-3 py-2 border-b bg-primary/10">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Active Tool:</span>
            <Badge variant="default" className="text-xs">
              {selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)}
            </Badge>
            {isDrawingActive && (
              <Badge variant="secondary" className="text-xs animate-pulse">
                Drawing...
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex gap-1 p-2 border-b bg-muted/30">
        {sections.slice(0, 4).map((section) => (
          <Button
            key={section.id}
            variant={activeSection === section.id ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveSection(section.id)}
            className="relative flex-1 text-xs"
          >
            <span className="mr-1">{section.icon}</span>
            {section.label}
            {section.badge && (
              <Badge variant="secondary" className="w-4 h-4 p-0 ml-1 text-xs">
                {section.badge > 99 ? "99+" : section.badge}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Main Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Active Section */}
          {sections.find((s) => s.id === activeSection)?.component}

          {/* Divider */}
          {activeSection !== "tools" && (
            <>
              <Separator />
              {/* Always show tools as secondary when not active */}
              <div className="opacity-75">
                <ToolPalette compact />
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Quick Actions Footer */}
      <div className="p-3 border-t bg-muted/30">
        <div className="flex gap-1">
          {sections.slice(4).map((section) => (
            <Button
              key={section.id}
              variant={activeSection === section.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveSection(section.id)}
              className="flex-1 text-xs"
              title={section.label}
            >
              <span>{section.icon}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
