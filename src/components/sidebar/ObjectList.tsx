import React from "react";
import { useSceneStore } from "@/store/useSceneStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export function ObjectList() {
  const objects = useSceneStore((s) => s.objects);
  const selectedId = useSceneStore((s) => s.selectedId);
  const setSelectedId = useSceneStore((s) => s.setSelectedId);
  const removeObject = useSceneStore((s) => s.removeObject);

  const objectIcons = {
    building: "🏢",
    tree: "🌳",
    road: "🛣️",
    wall: "🧱",
    water: "💧",
  };

  const objectColors = {
    building: "bg-orange-100 text-orange-800",
    tree: "bg-green-100 text-green-800",
    road: "bg-gray-100 text-gray-800",
    wall: "bg-yellow-100 text-yellow-800",
    water: "bg-blue-100 text-blue-800",
  };

  const handleObjectClick = (objectId: string) => {
    setSelectedId(selectedId === objectId ? null : objectId);
  };

  const handleDeleteObject = (objectId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    removeObject(objectId);
  };

  if (objects.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">📋 Objects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-muted-foreground">
            <div className="mb-2 text-3xl">🏗️</div>
            <p className="text-sm">No objects in scene</p>
            <p className="text-xs">Select a tool to start building</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group objects by type
  const groupedObjects = objects.reduce((groups, obj) => {
    const type = obj.type;
    if (!groups[type]) groups[type] = [];
    groups[type].push(obj);
    return groups;
  }, {} as Record<string, typeof objects>);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          📋 Objects
          <Badge variant="secondary" className="text-xs">
            {objects.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px] px-4">
          <div className="pb-4 space-y-3">
            {Object.entries(groupedObjects).map(([type, typeObjects]) => (
              <div key={type} className="space-y-2">
                <div className="flex items-center gap-2 px-2">
                  <span className="text-lg">
                    {objectIcons[type as keyof typeof objectIcons]}
                  </span>
                  <h4 className="text-sm font-medium capitalize">{type}s</h4>
                  <Badge variant="outline" className="text-xs">
                    {typeObjects.length}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {typeObjects.map((obj) => (
                    <div
                      key={obj.id}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                        selectedId === obj.id
                          ? "bg-primary/10 border border-primary/20"
                          : "bg-muted/30 hover:bg-muted/50"
                      }`}
                      onClick={() => handleObjectClick(obj.id)}
                    >
                      <div className="flex items-center flex-1 min-w-0 gap-2">
                        <Badge
                          variant="secondary"
                          className={`text-xs px-1.5 py-0.5 ${
                            objectColors[obj.type as keyof typeof objectColors]
                          }`}
                        >
                          {objectIcons[obj.type as keyof typeof objectIcons]}
                        </Badge>
                        <span className="text-sm font-medium truncate">
                          {obj.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {selectedId === obj.id && (
                          <Badge
                            variant="default"
                            className="text-xs px-1.5 py-0.5"
                          >
                            Selected
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-6 h-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => handleDeleteObject(obj.id, e)}
                          title="Delete object"
                        >
                          ❌
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
