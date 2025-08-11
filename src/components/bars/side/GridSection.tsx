import React, { useState } from "react";
import { useGrid } from "@/contexts/GridContext";
import Button from "../../generic/Button";

export default function GridSection() {
  const [isOpen, setIsOpen] = useState(false);
  const { showGrid, toggleGrid } = useGrid();

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="relative">
      <Button
        onClick={toggleDropdown}
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
      >
        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
        Grid
      </Button>

      {isOpen && (
        <div className="absolute right-0 z-50 w-48 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg top-full">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Show Grid
              </span>
              <div
                onClick={toggleGrid}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showGrid ? "bg-purple-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showGrid ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </div>
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
