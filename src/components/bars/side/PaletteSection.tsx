import React from "react";
import ObjectPalette from "../../palette/ObjectPalette";

export default function PaletteSection() {
  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-md hover:shadow-lg transition-shadow duration-300">
      <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
        Palette
      </h3>
      <ObjectPalette />
    </section>
  );
}
