import React from "react";
import { SceneObj } from "@/store/storeTypes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";interface PositionInputsProps {
selected: SceneObj;
updateObject: (id: string, patch: Partial<SceneObj>) => void;
}export function PositionInputs({
selected,
updateObject,
}: PositionInputsProps) {
const updatePosition = (index: number, value: number) => {
const newPosition = [...selected.position] as [number, number, number];
newPosition[index] = value;
updateObject(selected.id, { position: newPosition });
};return (
<div className="space-y-3">
<Label className="text-sm font-medium">Position</Label>
<div className="grid grid-cols-2 gap-3">
<div className="space-y-1">
<Label htmlFor="pos-x" className="text-xs text-muted-foreground">X</Label>
<Input
id="pos-x"
type="number"
value={selected.position[0]}
onChange={(e) => updatePosition(0, parseFloat(e.target.value) || 0)}
step={0.1}
className="h-8"
/>
</div>
<div className="space-y-1">
<Label htmlFor="pos-z" className="text-xs text-muted-foreground">Z</Label>
<Input
id="pos-z"
type="number"
value={selected.position[2]}
onChange={(e) => updatePosition(2, parseFloat(e.target.value) || 0)}
step={0.1}
className="h-8"
/>
</div>
</div>
</div>
);
}


