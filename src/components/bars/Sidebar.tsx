import React from "react";
import { PaletteSection, SelectedSection, TipsSection } from "./side";

export default function Sidebar() {
  return (
    <div className="flex flex-col h-full p-1 space-y-5">
      <PaletteSection />
      <SelectedSection />
      <TipsSection />
    </div>
  );
}
