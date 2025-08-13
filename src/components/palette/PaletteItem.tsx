// src/components/bars/side/components/PaletteItem.tsx
import React from "react";

interface PaletteItemProps {
  id: string;
  name: string;
  icon: string;
  shortcut: string;
  description: string;
  color: string;
  isSelected: boolean;
  objectCount: number;
  onSelect: () => void;
}

export function PaletteItem({
  name,
  icon,
  shortcut,
  description,
  isSelected,
  objectCount,
  onSelect,
}: PaletteItemProps) {
  return (
    <button
      onClick={onSelect}
      className={`group flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
        isSelected
          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg ring-2 ring-blue-300/50 -translate-y-0.5"
          : "bg-gray-100 hover:bg-gray-200 text-gray-800"
      }`}
      title={description}
    >
      <span
        className={`text-lg flex-shrink-0 transition-transform group-hover:scale-110 ${
          isSelected ? "text-white" : "text-gray-600"
        }`}
      >
        {icon}
      </span>

      <div className="flex-1 text-left">
        <div
          className={`text-sm font-medium ${
            isSelected ? "text-white" : "text-gray-800"
          }`}
        >
          {name}
        </div>
        {objectCount > 0 && (
          <div
            className={`text-xs ${
              isSelected ? "text-blue-100" : "text-gray-500"
            }`}
          >
            {objectCount} in scene
          </div>
        )}
      </div>

      <div
        className={`text-xs font-bold px-2 py-1 rounded-full transition-all ${
          isSelected
            ? "bg-white/20 text-white"
            : "bg-white/60 text-gray-700 group-hover:bg-white/80"
        }`}
      >
        {shortcut}
      </div>
    </button>
  );
}
