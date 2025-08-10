"use client";
import React from "react";
import dynamic from "next/dynamic";
import { Sidebar, Toolbar } from "@/components/bars";
import { EditorProvider } from "@/context/EditorContext";
import { StoreProvider, useStore } from "@/store/useStore";
import { ToolProvider } from "@/context/ToolContext";

// dynamic import of Scene to avoid SSR issues
const Scene = dynamic(() => import("@/components/MainScene"), { ssr: false });

function KeyboardHandler() {
  const removeObject = useStore((s) => s.removeObject);
  const selectedId = useStore((s) => s.selectedId);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if Delete key (key "Delete") or Backspace (key "Backspace") is pressed
      if ((event.key === "Delete" || event.key === "Backspace") && selectedId) {
        event.preventDefault();
        removeObject(selectedId);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [removeObject, selectedId]);

  return null;
}

export default function Home() {
  return (
    <StoreProvider>
      <EditorProvider>
        <ToolProvider>
          <div className="h-screen w-screen flex">
            <div className="flex-1 relative">
              <Scene />
            </div>

            <div className="w-80 bg-white border-l p-4 overflow-auto">
              <Sidebar />
            </div>
          </div>
          <KeyboardHandler />
        </ToolProvider>
      </EditorProvider>
    </StoreProvider>
  );
}
