"use client";

import React, { useState, useRef, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { downloadJSON, readJSONFile } from "@/utils/io";
import { SceneObj, StoreState } from "@/store/storeTypes";
import SearchSection from "@/components/bars/side/SearchSection";
import GridSection from "@/components/bars/side/GridSection";
import Modal from "@/components/ui/Modal";
import ProjectSection from "@/components/bars/side/ProjectSection";
import Button from "@/components/generic/Button";

export default function TopMenu() {
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProjectDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
      <div className="flex items-center space-x-6">
        <h1 className="text-xl font-bold text-gray-900">
          Residential Design Tool
        </h1>
        <div className="relative" ref={dropdownRef}>
          <Button
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
            variant="ghost"
            size="md"
            className="flex items-center gap-2"
          >
            Project
            <svg
              className={`w-4 h-4 transition-transform ${
                isProjectDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </Button>

          {isProjectDropdownOpen && (
            <div className="absolute left-0 z-10 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-80">
              <div className="p-4">
                <ProjectSection />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <SearchSection />
        <GridSection />
      </div>
    </nav>
  );
}
