"use client";
import React from "react";
import dynamic from "next/dynamic";
import { Sidebar } from "@/components/sidebar";
import { EditorProvider } from "@/contexts/EditorContext";
import { StoreProvider } from "@/store/useSceneStore";
import { ToolProvider } from "@/contexts/ToolContext";
import { LayoutProvider } from "@/contexts/LayoutContext";
import { useKeyboardShortcuts } from "@/components/scene/KeyboardShortcuts";
import { GenericDrawingProvider } from "@/contexts";

// dynamic import of Scene to avoid SSR issues
const Scene = dynamic(() => import("@/components/EnhancedScene"), {
  ssr: false,
});

function KeyboardHandler() {
  const { handleKeyDown } = useKeyboardShortcuts();

  React.useEffect(() => {
    const handleKeyDownWithCheck = (e: KeyboardEvent) => {
      // Don't handle keyboard shortcuts if an input field is focused
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      handleKeyDown(e);
    };

    window.addEventListener("keydown", handleKeyDownWithCheck);
    return () => {
      window.removeEventListener("keydown", handleKeyDownWithCheck);
    };
  }, [handleKeyDown]);

  return null;
}

export default function Home() {
  return (
    <StoreProvider>
      <EditorProvider>
        <ToolProvider>
          <GenericDrawingProvider>
            <LayoutProvider>
              <div className="flex w-screen h-screen">
                <div className="relative flex-1">
                  <Scene />
                </div>
                <div className="h-full p-1 overflow-auto bg-white border-l w-160">
                  <Sidebar />
                </div>
              </div>
              <KeyboardHandler />
            </LayoutProvider>
          </GenericDrawingProvider>
        </ToolProvider>
      </EditorProvider>
    </StoreProvider>
  );
}
