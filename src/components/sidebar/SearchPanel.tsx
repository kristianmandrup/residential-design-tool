import React, { useState, useMemo } from "react";
import { useSceneStore } from "@/store/useSceneStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, Filter } from "lucide-react";

export function SearchPanel() {
  const objects = useSceneStore((s) => s.objects);
  const selectedId = useSceneStore((s) => s.selectedId);
  const setSelectedId = useSceneStore((s) => s.setSelectedId);
  const removeObject = useSceneStore((s) => s.removeObject);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const objectTypes = [
    { value: "all", label: "All Types", icon: "📦" },
    { value: "building", label: "Buildings", icon: "🏢" },
    { value: "tree", label: "Trees", icon: "🌳" },
    { value: "road", label: "Roads", icon: "🛣️" },
    { value: "wall", label: "Walls", icon: "🧱" },
    { value: "water", label: "Water", icon: "💧" },
  ];

  const sortOptions = [
    { value: "name", label: "Name" },
    { value: "type", label: "Type" },
    { value: "position", label: "Position" },
    { value: "size", label: "Size" },
  ];

  const filteredAndSortedObjects = useMemo(() => {
    let filtered = objects.filter((obj) => {
      const matchesSearch =
        !searchQuery ||
        obj.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        obj.type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === "all" || obj.type === selectedType;

      return matchesSearch && matchesType;
    });

    // Sort objects
    filtered.sort((a, b) => {
      let valueA: any, valueB: any;

      switch (sortBy) {
        case "name":
          valueA = a.name || a.type;
          valueB = b.name || b.type;
          break;
        case "type":
          valueA = a.type;
          valueB = b.type;
          break;
        case "position":
          valueA = Math.sqrt(a.position[0] ** 2 + a.position[2] ** 2);
          valueB = Math.sqrt(b.position[0] ** 2 + b.position[2] ** 2);
          break;
        case "size":
          valueA = (a.gridWidth || 1) * (a.gridDepth || 1);
          valueB = (b.gridWidth || 1) * (b.gridDepth || 1);
          break;
        default:
          return 0;
      }

      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortOrder === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return sortOrder === "asc" ? valueA - valueB : valueB - valueA;
    });

    return filtered;
  }, [objects, searchQuery, selectedType, sortBy, sortOrder]);

  const clearSearch = () => {
    setSearchQuery("");
    setSelectedType("all");
  };

  const selectObject = (objectId: string) => {
    setSelectedId(selectedId === objectId ? null : objectId);
  };

  const deleteObject = (objectId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    removeObject(objectId);
  };

  const getObjectIcon = (type: string) => {
    return objectTypes.find((t) => t.value === type)?.icon || "📦";
  };

  const getObjectSize = (obj: any) => {
    const width = obj.gridWidth || 1;
    const depth = obj.gridDepth || 1;
    const height = obj.gridHeight || 1;
    return `${width}×${depth}×${height}`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            🔍 Search Objects
            <Badge variant="secondary" className="text-xs">
              {filteredAndSortedObjects.length}/{objects.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="h-8 w-8 p-0"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {(searchQuery || selectedType !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Type Filter */}
        <div className="space-y-2">
          <Label className="text-sm">Filter by Type</Label>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {objectTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-3 p-3 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Advanced Filters</Label>
              <Switch
                checked={showAdvanced}
                onCheckedChange={setShowAdvanced}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Sort by</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Order</Label>
                <Select
                  value={sortOrder}
                  onValueChange={(value: "asc" | "desc") => setSortOrder(value)}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">A-Z / Low-High</SelectItem>
                    <SelectItem value="desc">Z-A / High-Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        <div className="space-y-2">
          <Label className="text-sm">Results</Label>

          {filteredAndSortedObjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-3xl mb-2">🔍</div>
              <p className="text-sm">No objects found</p>
              <p className="text-xs">Try adjusting your search criteria</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-1">
                {filteredAndSortedObjects.map((obj) => (
                  <div
                    key={obj.id}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all hover:shadow-sm border ${
                      selectedId === obj.id
                        ? "bg-primary/10 border-primary/20"
                        : "bg-background hover:bg-muted/50 border-border"
                    }`}
                    onClick={() => selectObject(obj.id)}
                  >
                    <div className="flex items-center flex-1 min-w-0 gap-2">
                      <span className="text-lg">{getObjectIcon(obj.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {obj.name || `${obj.type} ${obj.id.slice(-4)}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {obj.type} • {getObjectSize(obj)} • (
                          {obj.position[0].toFixed(1)},{" "}
                          {obj.position[2].toFixed(1)})
                        </div>
                      </div>
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
                        onClick={(e) => deleteObject(obj.id, e)}
                        title="Delete object"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Quick Actions */}
        {filteredAndSortedObjects.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <Label className="text-sm">Quick Actions</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Select all filtered objects
                  // This would need to be implemented in the store
                }}
                className="text-xs"
              >
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Center camera on first result
                  // This would need camera control integration
                }}
                className="text-xs"
              >
                Focus First
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
