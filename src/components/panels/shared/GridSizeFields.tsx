import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";interface GridSizeFieldsProps {
gridWidth?: number;
gridDepth?: number;
gridHeight?: number;
onGridWidthChange: (value: number) => void;
onGridDepthChange: (value: number) => void;
onGridHeightChange: (value: number) => void;
widthMin?: number;
widthMax?: number;
depthMin?: number;
depthMax?: number;
heightMin?: number;
heightMax?: number;
showHeight?: boolean;
}export function GridSizeFields({
gridWidth = 2,
gridDepth = 2,
gridHeight = 1,
onGridWidthChange,
onGridDepthChange,
onGridHeightChange,
widthMin = 1,
widthMax = 10,
depthMin = 1,
depthMax = 10,
heightMin = 1,
heightMax = 5,
showHeight = true,
}: GridSizeFieldsProps) {
return (
<div className="space-y-3">
<Label className="text-sm font-medium">Grid Size</Label>
<div className="grid grid-cols-2 gap-3">
<div className="space-y-1">
<Label htmlFor="grid-width" className="text-xs text-muted-foreground">
Width
</Label>
<Input
id="grid-width"
type="number"
value={gridWidth}
onChange={(e) => onGridWidthChange(Math.max(widthMin, Math.min(widthMax, parseFloat(e.target.value) || widthMin)))}
min={widthMin}
max={widthMax}
className="h-8"
/>
</div>
<div className="space-y-1">
<Label htmlFor="grid-depth" className="text-xs text-muted-foreground">
Depth
</Label>
<Input
id="grid-depth"
type="number"
value={gridDepth}
onChange={(e) => onGridDepthChange(Math.max(depthMin, Math.min(depthMax, parseFloat(e.target.value) || depthMin)))}
min={depthMin}
max={depthMax}
className="h-8"
/>
</div>
</div>
{showHeight && (
<div className="space-y-1">
<Label htmlFor="grid-height" className="text-xs text-muted-foreground">
Height
</Label>
<Input
id="grid-height"
type="number"
value={gridHeight}
onChange={(e) => onGridHeightChange(Math.max(heightMin, Math.min(heightMax, parseFloat(e.target.value) || heightMin)))}
min={heightMin}
max={heightMax}
className="h-8"
/>
</div>
)}
</div>
);
}
