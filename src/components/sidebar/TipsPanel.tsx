import React, { useState } from "react";
import { useTool } from "@/contexts/ToolContext";
import { useGenericDrawingContext } from "@/contexts/GenericDrawingContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, Keyboard, Zap, HelpCircle } from "lucide-react";

export function TipsPanel() {
  const { selectedTool } = useTool();
  const drawingContext = useGenericDrawingContext();
  const [activeTab, setActiveTab] = useState("current");

  const isDrawing = drawingContext.isDrawingRoad || 
                   drawingContext.isDrawingWall || 
                   drawingContext.isDrawingWater;

  const getCurrentTips = () => {
    if (isDrawing) {
      if (drawingContext.isDrawingRoad) {
        return {
          title: "🛣️ Drawing Roads",
          tips: [
            "Click points to create your road path",
            "Double-click or press Enter to finish",
            "Press C to add curves to the last segment",
            "Use different road types for variety",
            "Roads will automatically connect at intersections",
            "Adjust width based on traffic needs"
          ],
          shortcuts: [
            { key: "Enter", action: "Finish road" },
            { key: "Esc", action: "Cancel drawing" },
            { key: "Ctrl+Z", action: "Undo last point" },
            { key: "C", action: "Add curve" }
          ]
        };
      }
      if (drawingContext.isDrawingWall) {
        return {
          title: "🧱 Drawing Walls",
          tips: [
            "Click to place wall segments",
            "Walls connect to form continuous barriers",
            "Choose materials for different aesthetics",
            "Consider height for privacy or decoration",
            "Walls can be used to define property boundaries"
          ],
          shortcuts: [
            { key: "Enter", action: "Finish wall" },
            { key: "Esc", action: "Cancel drawing" },
            { key: "Ctrl+Z", action: "Undo last point" }
          ]
        };
      }
      if (drawingContext.isDrawingWater) {
        return {
          title: "💧 Drawing Water",
          tips: [
            "Place points to define water body shape",
            "Water features add natural beauty",
            "Consider drainage and flow patterns",
            "Different types suit different environments",
            "Connect to create water networks"
          ],
          shortcuts: [
            { key: "Enter", action: "Finish water body" },
            { key: "Esc", action: "Cancel drawing" },
            { key: "Ctrl+Z", action: "Undo last point" }
          ]
        };
      }
    }

    switch (selectedTool) {
      case "select":
        return {
          title: "🎯 Selection Tool",
          tips: [
            "Click objects to select them",
            "Drag to move selected objects",
            "Use transform gizmos to rotate/scale",
            "Properties panel shows object details",
            "Delete key removes selected objects"
          ],
          shortcuts: [
            { key: "Click", action: "Select object" },
            { key: "Drag", action: "Move object" },
            { key: "Delete", action: "Remove object" },
            { key: "Esc", action: "Deselect all" }
          ]
        };
      
      case "building":
        return {
          title: "🏢 Building Tool",
          tips: [
            "Click to place buildings on the grid",
            "Adjust floors, colors, and roof types",
            "Buildings snap to grid automatically",
            "Each floor can have different properties",
            "Consider spacing for roads and access"
          ],
          shortcuts: [
            { key: "Click", action: "Place building" },
            { key: "B", action: "Select building tool" }
          ]
        };
      
      case "tree":
        return {
          title: "🌳 Tree Tool",
          tips: [
            "Click to plant trees",
            "Different types for different climates",
            "Trees provide natural beauty",
            "Consider spacing and growth patterns",
            "Group trees to create forests"
          ],
          shortcuts: [
            { key: "Click", action: "Plant tree" },
            { key: "T", action: "Select tree tool" }
          ]
        };
      
      default:
        return {
          title: "💡 General Tips",
          tips: [
            "Use the grid for precise alignment",
            "Start with roads as your foundation",
            "Add buildings along road networks",
            "Use trees and water for natural areas",
            "Save your work regularly",
            "Experiment with different layouts"
          ],
          shortcuts: [
            { key: "S", action: "Select tool" },
            { key: "R", action: "Road tool" },
            { key: "B", action: "Building tool" },
            { key: "T", action: "Tree tool" },
            { key: "W", action: "Wall tool" },
            { key: "A", action: "Water tool" }
          ]
        };
    }
  };

  const currentTips = getCurrentTips();

  const generalShortcuts = [
    { category: "Tools", shortcuts: [
      { key: "S", action: "Select tool" },
      { key: "R", action: "Road tool" },
      { key: "B", action: "Building tool" },
      { key: "T", action: "Tree tool" },
      { key: "W", action: "Wall tool" },
      { key: "A", action: "Water tool" }
    ]},
    { category: "General", shortcuts: [
      { key: "Esc", action: "Cancel/Deselect" },
      { key: "Delete", action: "Remove selected" },
      { key: "Ctrl+Z", action: "Undo" },
      { key: "Ctrl+Y", action: "Redo" },
      { key: "Space", action: "Toggle grid" }
    ]},
    { category: "Camera", shortcuts: [
      { key: "Mouse Wheel", action: "Zoom in/out" },
      { key: "Middle Click", action: "Pan camera" },
      { key: "Right Click", action: "Rotate view" }
    ]}
  ];

  const bestPractices = [
    {
      title: "🏗️ Planning Your City",
      tips: [
        "Start with a road network as your foundation",
        "Plan residential, commercial, and industrial zones",
        "Leave space for parks and natural areas",
        "Consider traffic flow and accessibility",
        "Think about utilities and infrastructure"
      ]
    },
    {
      title: "🎨 Design Principles",
      tips: [
        "Use consistent building styles in neighborhoods",
        "Vary building heights for visual interest",
        "Create focal points with landmarks",
        "Balance density with open spaces",
        "Use water features for natural boundaries"
      ]
    },
    {
      title: "⚡ Performance Tips",
      tips: [
        "Use fewer, larger buildings for distant areas",
        "Group similar objects together",
        "Enable snap-to-grid for cleaner layouts",
        "Save your work frequently",
        "Use the search panel for large projects"
      ]
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          💡 Tips & Help
          {isDrawing && (
            <Badge variant="default" className="text-xs animate-pulse">
              Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current" className="text-xs">
              <Lightbulb className="h-3 w-3 mr-1" />
              Current
            </TabsTrigger>
            <TabsTrigger value="shortcuts" className="text-xs">
              <Keyboard className="h-3 w-3 mr-1" />
              Shortcuts
            </TabsTrigger>
            <TabsTrigger value="best" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Best Practices
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="current" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm">{currentTips.title}</h4>
                {isDrawing && (
                  <Badge variant="outline" className="text-xs">
                    Drawing Mode
                  </Badge>
                )}
              </div>
              
              <ul className="space-y-2 text-sm">
                {currentTips.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-muted-foreground">{tip}</span>
                  </li>
                ))}
              </ul>

              {currentTips.shortcuts && currentTips.shortcuts.length > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-muted/30">
                  <h5 className="text-xs font-medium mb-2">Quick Actions:</h5>
                  <div className="space-y-1">
                    {currentTips.shortcuts.map((shortcut, index) => (
                      <div key={index} className="flex items-center justify-between text-xs">
                        <kbd className="bg-background border border-border px-1.5 py-0.5 rounded text-xs">
                          {shortcut.key}
                        </kbd>
                        <span className="text-muted-foreground">{shortcut.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="shortcuts" className="space-y-4 mt-4">
            {generalShortcuts.map((category, index) => (
              <div key={index} className="space-y-2">
                <h4 className="font-medium text-sm">{category.category}</h4>
                <div className="space-y-1">
                  {category.shortcuts.map((shortcut, shortcutIndex) => (
                    <div key={shortcutIndex} className="flex items-center justify-between text-xs">
                      <kbd className="bg-background border border-border px-1.5 py-0.5 rounded text-xs">
                        {shortcut.key}
                      </kbd>
                      <span className="text-muted-foreground text-right">{shortcut.action}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>
          
          <TabsContent value="best" className="space-y-4 mt-4">
            {bestPractices.map((practice, index) => (
              <div key={index} className="space-y-2">
                <h4 className="font-medium text-sm">{practice.title}</h4>
                <ul className="space-y-1">
                  {practice.tips.map((tip, tipIndex) => (
                    <li key={tipIndex} className="flex items-start gap-2 text-xs">
                      <span className="text-primary mt-1">•</span>
                      <span className="text-muted-foreground">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </TabsContent>
        </Tabs>

        {/* Help Button */}
        <div className="mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // This could open a more detailed help modal
              alert("For more help, check the documentation or contact support!");
            }}
            className="w-full flex items-center gap-2 text-xs"
          >
            <HelpCircle className="h-3 w-3" />
            Need More Help?
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

