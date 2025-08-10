"use client";
import React from "react";

interface PaletteItemProps {
  id: string;
  name: string;
  icon: string;
  shortcut: string;
  color: string;
  action: () => void;
  isSelected?: boolean;
}

export default function PaletteItem({
  id,
  name,
  icon,
  shortcut,
  color,
  action,
  isSelected = false,
}: PaletteItemProps) {
  return (
    <div
      onClick={action}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer ${
        isSelected
          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-[1.02] ring-4 ring-blue-300 ring-opacity-50"
          : "bg-gray-100 hover:bg-gray-200 text-gray-800"
      }`}
    >
      <button
        className={`text-xl flex-shrink-0 transition-colors duration-200 ${
          isSelected ? "text-white" : "text-gray-600"
        }`}
      >
        {icon}
      </button>
      <div
        className={`flex-1 text-left font-medium transition-colors duration-200 ${
          isSelected ? "text-white" : "text-black"
        }`}
      >
        {name}
      </div>
      <div
        className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors duration-200 ${
          isSelected
            ? "bg-white bg-opacity-20 backdrop-blur-sm text-white"
            : "bg-white bg-opacity-60 backdrop-blur-sm text-gray-700"
        }`}
      >
        {shortcut}
      </div>
    </div>
  );
}
