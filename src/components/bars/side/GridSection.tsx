import React from "react";
import { useStore } from "@/store/useStore";
import { SwitchField } from "@/components/bars/side/components/generic";
import { useGrid } from "@/contexts/GridContext";

export default function GridSection() {
  const gridSize = useStore((s) => s.gridSize);
  const setGridSize = useStore((s) => s.setGridSize);
  const snap = useStore((s) => s.snapEnabled);
  const toggleSnap = useStore((s) => s.toggleSnap);
  const { showGrid, toggleGrid } = useGrid();

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-md hover:shadow-lg transition-shadow duration-300">
      <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
        Grid
      </h3>

      <div className="flex items-center gap-4 mb-4">
        <SwitchField
          checked={showGrid}
          onCheckedChange={toggleGrid}
          label="Grid"
        />
        <SwitchField checked={snap} onCheckedChange={toggleSnap} label="Snap" />
      </div>
    </section>
  );
}
