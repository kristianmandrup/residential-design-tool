import React, { useState } from "react";
import { useStore } from "@/store/useStore";
import { SwitchField } from "@/components/generic/SwitchField";
import { useGrid } from "@/contexts/GridContext";
import Button from "@/components/generic/Button";

export default function GridSection() {
  const [isOpen, setIsOpen] = useState(false);
  const snap = useStore((s) => s.snapEnabled);
  const toggleSnap = useStore((s) => s.toggleSnap);
  const { showGrid, toggleGrid } = useGrid();

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="relative">
      <Button
        onClick={toggleDropdown}
        variant="ghost"
        size="sm"
        className="flex items-center justify-start w-full gap-2"
      >
        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
        Grid
      </Button>

      {isOpen && (
        <div className="absolute right-0 z-50 w-48 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg top-full">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <SwitchField
                checked={showGrid}
                onCheckedChange={toggleGrid}
                label="Grid"
              />
            </div>
            <div className="flex items-center justify-between">
              <SwitchField
                checked={snap}
                onCheckedChange={toggleSnap}
                label="Snap"
              />
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
