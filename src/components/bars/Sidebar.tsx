import React from "react";
import {
  PaletteSection,
  GridSection,
  SelectedSection,
  TipsSection,
} from "./side";

export default function Sidebar() {
  return (
    <div className="flex flex-col h-full p-5 space-y-5 border border-gray-300 shadow-lg bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl">
      <h2 className="flex items-center gap-2 mb-5 text-2xl font-bold text-gray-900">
        <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
        Editor
      </h2>

      <PaletteSection />
      <GridSection />
      <SelectedSection />
      <TipsSection />
    </div>
  );
}
