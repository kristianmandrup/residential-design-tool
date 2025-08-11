"use client";
import React from "react";
import dynamic from "next/dynamic";
import { Sidebar } from "@/components/bars";
import { EditorProvider } from "@/contexts/EditorContext";
import { StoreProvider } from "@/store/useStore";
import { ToolProvider } from "@/contexts/ToolContext";
import { useKeyboardShortcuts } from "@/components/scene/KeyboardShortcuts";

// dynamic import of Scene to avoid SSR issues
const Scene = dynamic(() => import("@/components/MainScene"), { ssr: false });

function KeyboardHandler() {
  const { handleKeyDown } = useKeyboardShortcuts();

  React.useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

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
