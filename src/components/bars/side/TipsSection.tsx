import React from "react";
import Section from "../../generic/Section";

export default function TipsSection() {
  return (
    <Section className="border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
      <div className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        Select an object to edit its properties
      </div>
      <div className="text-xs leading-relaxed text-indigo-800">
        Pro tips: Use the palette to add objects, then select and drag them in
        the 3D view. Road tool supports multi-click segments; double-click to
        finish.
      </div>
    </Section>
  );
}
