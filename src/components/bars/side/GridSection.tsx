import React from "react";
import { useStore } from "@/store/useStore";

export default function GridSection() {
  const gridSize = useStore((s) => s.gridSize);
  const setGridSize = useStore((s) => s.setGridSize);
  const snap = useStore((s) => s.snapEnabled);
  const toggleSnap = useStore((s) => s.toggleSnap);

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-md hover:shadow-lg transition-shadow duration-300">
      <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
        Grid
      </h3>

      <div className="text-sm mt-3 text-gray-700 font-medium">
        Snap:{" "}
        <span
          className={`font-bold ${snap ? "text-green-600" : "text-red-600"}`}
        >
          {snap ? "On" : "Off"}
        </span>
      </div>

      <button
        onClick={toggleSnap}
        className={`mt-3 w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          snap
            ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            : "bg-gradient-to-r from-gray-300 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-gray-700"
        }`}
      >
        {snap ? "Disable Snapping" : "Enable Snapping"}
      </button>

      <div className="mt-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Grid Size: {gridSize}
        </label>
        <input
          type="range"
          min="0.5"
          max="5"
          step="0.5"
          value={gridSize}
          onChange={(e) => setGridSize(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0.5</span>
          <span>1.0</span>
          <span>1.5</span>
          <span>2.0</span>
          <span>2.5</span>
          <span>3.0</span>
          <span>3.5</span>
          <span>4.0</span>
          <span>4.5</span>
          <span>5.0</span>
        </div>
      </div>
    </section>
  );
}
