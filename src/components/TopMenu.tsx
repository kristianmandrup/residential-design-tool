"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSceneStore } from "@/store/useSceneStore";
import SearchSection from "@/components/bars/side/SearchSection";
import GridSection from "@/components/bars/side/GridSection";
import ProjectSection from "@/components/bars/side/ProjectSection";
import Button from "@/components/generic/Button";

export default function TopMenu() {
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Store state for undo/redo
  const { past, future, undo, redo } = useSceneStore();

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

  // Keyboard shortcuts for undo/redo
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((event.ctrlKey || event.metaKey) && event.key === "z") {
        event.preventDefault();
        undo();
      }
      // Ctrl+Y or Cmd+Y for redo
      else if ((event.ctrlKey || event.metaKey) && event.key === "y") {
        event.preventDefault();
        redo();
      }
    },
    [undo, redo]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

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
        <Button
          onClick={undo}
          disabled={past.length === 0}
          variant="ghost"
          size="md"
          className="flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
            />
          </svg>
          Undo
        </Button>

        <Button
          onClick={redo}
          disabled={future.length === 0}
          variant="ghost"
          size="md"
          className="flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"
            />
          </svg>
          Redo
        </Button>

        <SearchSection />
        <GridSection />
      </div>
    </nav>
  );
}
