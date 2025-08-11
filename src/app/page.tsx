"use client";
import React from "react";
import dynamic from "next/dynamic";
import { Sidebar } from "@/components/bars";
import { EditorProvider } from "@/contexts/EditorContext";
import { StoreProvider } from "@/store/useStore";
import { ToolProvider } from "@/contexts/ToolContext";
import { GridProvider } from "@/contexts/GridContext";
import { useKeyboardShortcuts } from "@/components/scene/KeyboardShortcuts";

// dynamic import of Scene to avoid SSR issues
const Scene = dynamic(() => import("@/components/MainScene"), { ssr: false });

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
          <GridProvider>
            <div className="flex w-screen h-screen">
              <div className="relative flex-1">
                <Scene />
              </div>

              <div className="p-4 overflow-auto bg-white border-l w-140">
                <Sidebar />
              </div>
            </div>
            <KeyboardHandler />
          </GridProvider>
        </ToolProvider>
      </EditorProvider>
    </StoreProvider>
  );
}
