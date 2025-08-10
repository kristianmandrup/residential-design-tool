import React from "react";
import {
  PaletteSection,
  ProjectSection,
  GridSection,
  SelectedSection,
  TipsSection,
} from "./index";

export default function Sidebar() {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl border border-gray-300 p-5 space-y-5 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-5 flex items-center gap-2">
        <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
        Editor
      </h2>

      <PaletteSection />
      <ProjectSection />
      <GridSection />
      <SelectedSection />
      <TipsSection />
    </div>
  );
}
