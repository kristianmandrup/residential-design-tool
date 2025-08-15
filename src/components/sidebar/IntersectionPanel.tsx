// File: src/components/sidebar/IntersectionPanel.tsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
interface GenericIntersection {
  id: string;
  type:
    | "cross"
    | "T-junction"
    | "Y-junction"
    | "L-corner"
    | "multi-way"
    | "end";
  position: { x: number; z: number };
  radius: number;
  elevation: number;
  connectedObjects: string[];
  objectTypes: string[];
}
interface IntersectionPanelProps {
  intersections: GenericIntersection[];
  onSelectIntersection?: (intersection: GenericIntersection) => void;
  onDeleteIntersection?: (intersection: GenericIntersection) => void;
}
export function IntersectionPanel({
  intersections,
  onSelectIntersection,
  onDeleteIntersection,
}: IntersectionPanelProps) {
  const getIntersectionIcon = (type: GenericIntersection["type"]) => {
    switch (type) {
      case "cross":
        return "✚";
      case "T-junction":
        return "⊥";
      case "Y-junction":
        return "⟨";
      case "L-corner":
        return "⌐";
      case "multi-way":
        return "✱";
      case "end":
        return "◉";
      default:
        return "○";
    }
  };
  const getObjectTypeIcon = (type: string) => {
    switch (type) {
      case "road":
        return "🛣️";
      case "wall":
        return "🧱";
      case "water":
        return "💧";
      default:
        return "⚫";
    }
  };
  if (intersections.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <div className="mb-2 text-3xl">🔍</div>
            <p className="text-sm">No intersections detected</p>
            <p className="text-xs">
              Draw overlapping objects to create intersections
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  // Group intersections by type
  const groupedIntersections = intersections.reduce((groups, intersection) => {
    const type = intersection.type;
    if (!groups[type]) groups[type] = [];
    groups[type].push(intersection);
    return groups;
  }, {} as Record<string, GenericIntersection[]>);
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          🔄 Intersections
          <Badge variant="secondary" className="text-xs">
            {intersections.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-4">
            {Object.entries(groupedIntersections).map(
              ([type, typeIntersections]) => (
                <div key={type} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {getIntersectionIcon(type as GenericIntersection["type"])}
                    </span>
                    <h4 className="text-sm font-medium capitalize">
                      {type.replace("-", " ")}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {typeIntersections.length}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    {typeIntersections.map((intersection) => (
                      <div
                        key={intersection.id}
                        className="flex items-center justify-between p-2 transition-colors border rounded-lg cursor-pointer bg-background hover:bg-muted/50"
                        onClick={() => onSelectIntersection?.(intersection)}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              ({intersection.position.x.toFixed(1)},{" "}
                              {intersection.position.z.toFixed(1)})
                            </span>
                            <span className="text-xs text-muted-foreground">
                              R: {intersection.radius.toFixed(2)}m
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            {intersection.objectTypes.map(
                              (objectType, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="text-xs px-1.5 py-0.5"
                                >
                                  <span className="mr-1">
                                    {getObjectTypeIcon(objectType)}
                                  </span>
                                  {objectType}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>

                        {onDeleteIntersection && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-6 h-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteIntersection(intersection);
                            }}
                          >
                            ❌
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
