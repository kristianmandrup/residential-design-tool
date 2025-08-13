// src/components/ui/ToolPanel.tsx
import React from "react";
import { Tool, useTool } from "@/contexts/ToolContext";
import { useStore } from "@/store/useStore";
import { RoadDrawingPanel } from "./RoadDrawingPanel";

interface ToolPanelProps {
  className?: string;
}

export function ToolPanel({ className = "" }: ToolPanelProps) {
  const { selectedTool, setSelectedTool } = useTool();
  const selectedId = useStore((s) => s.selectedId);
  const selectedIds = useStore((s) => s.selectedIds);
  const objects = useStore((s) => s.objects);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const setSelectedId = useStore((s) => s.setSelectedId);
  const setSelectedIds = useStore((s) => s.setSelectedIds);
  const removeObject = useStore((s) => s.removeObject);

  const tools = [
    {
      id: "select",
      name: "Select",
      icon: "⬆️",
      description: "Select and move objects",
    },
    {
      id: "building",
      name: "Building",
      icon: "🏢",
      description: "Place buildings",
    },
    { id: "tree", name: "Tree", icon: "🌳", description: "Place trees" },
    { id: "road", name: "Road", icon: "🛣️", description: "Draw roads" },
    { id: "wall", name: "Wall", icon: "🧱", description: "Place walls" },
    {
      id: "water",
      name: "Water",
      icon: "💧",
      description: "Place water features",
    },
  ];

  const getSelectedObjectInfo = () => {
    if (selectedIds.length > 1) {
      return `${selectedIds.length} objects selected`;
    } else if (selectedId) {
      const obj = objects.find((o) => o.id === selectedId);
      return obj
        ? `${obj.type.charAt(0).toUpperCase() + obj.type.slice(1)} selected`
        : "Object selected";
    }
    return null;
  };

  const handleDelete = () => {
    if (selectedIds.length > 0) {
      selectedIds.forEach((id) => removeObject(id));
      setSelectedIds([]);
      setSelectedId(null);
    } else if (selectedId) {
      removeObject(selectedId);
      setSelectedId(null);
    }
  };

  const handleDuplicate = () => {
    // TODO: Implement duplication logic
    console.log("Duplicate functionality would go here");
  };

  const handleClearSelection = () => {
    setSelectedId(null);
    setSelectedIds([]);
  };

  return (
    <div
      className={`bg-gray-900/95 backdrop-blur-md rounded-lg p-4 text-white font-sans min-w-72 max-w-80 shadow-xl border border-white/10 ${className}`}
    >
      {/* Tool Selection */}
      <div className="pb-4 mb-5 border-b border-white/20">
        <h3 className="mb-3 text-lg font-semibold">Tools</h3>
        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id as Tool)}
              className={`relative overflow-hidden flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-200 ease-out group ${
                selectedTool === tool.id
                  ? "bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/40 -translate-y-0.5 ring-2 ring-green-300/50"
                  : "bg-white/10 border border-white/30 hover:bg-white/20 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
              }`}
              title={tool.description}
            >
              {/* Shine effect on hover */}
              <div className="absolute inset-0 transition-transform duration-500 ease-out -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full" />

              <span
                className={`text-xl drop-shadow-sm ${
                  selectedTool === tool.id ? "text-white" : "text-white/80"
                }`}
              >
                {tool.icon}
              </span>
              <span
                className={`text-xs font-medium ${
                  selectedTool === tool.id ? "text-white" : "text-white/90"
                }`}
              >
                {tool.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Selection Info */}
      {getSelectedObjectInfo() && (
        <div className="p-3 mb-5 border-blue-500 rounded-lg bg-blue-500/10 border-l-3">
          <h4 className="mb-2 text-sm font-medium text-blue-400">Selection</h4>
          <p className="mb-3 text-sm text-white/80">
            {getSelectedObjectInfo()}
          </p>
          <div className="flex gap-2">
            <button
              className="flex-1 px-3 py-1.5 text-xs bg-red-500/20 border border-red-500/50 text-red-300 rounded hover:bg-red-500/30 transition-colors"
              onClick={handleDelete}
              title="Delete selected object(s)"
            >
              🗑️ Delete
            </button>
            <button
              className="flex-1 px-3 py-1.5 text-xs bg-purple-500/20 border border-purple-500/50 text-purple-300 rounded hover:bg-purple-500/30 transition-colors"
              onClick={handleDuplicate}
              title="Duplicate selected object(s)"
            >
              📋 Duplicate
            </button>
          </div>
        </div>
      )}

      {/* Road Drawing Controls */}
      <RoadDrawingPanel />

      {/* Scene Statistics */}
      <div className="p-3 mb-5 rounded-lg bg-black/20">
        <h4 className="mb-3 text-sm font-medium">Scene Info</h4>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-white/70">Objects:</span>
            <span className="text-sm font-semibold text-green-400">
              {objects.length}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-white/70">Buildings:</span>
            <span className="text-sm font-semibold text-green-400">
              {objects.filter((o) => o.type === "building").length}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-white/70">Roads:</span>
            <span className="text-sm font-semibold text-green-400">
              {objects.filter((o) => o.type === "road").length}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-xs text-white/70">Trees:</span>
            <span className="text-sm font-semibold text-green-400">
              {objects.filter((o) => o.type === "tree").length}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h4 className="mb-3 text-sm font-medium">Quick Actions</h4>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            className="px-2 py-2 text-xs text-center transition-colors border rounded bg-white/10 border-white/30 hover:bg-white/20"
            onClick={undo}
            title="Undo last action (Ctrl+Z)"
          >
            ↶ Undo
          </button>
          <button
            className="px-2 py-2 text-xs text-center transition-colors border rounded bg-white/10 border-white/30 hover:bg-white/20"
            onClick={redo}
            title="Redo last action (Ctrl+Y)"
          >
            ↷ Redo
          </button>
          <button
            className="px-2 py-2 text-xs text-center transition-colors border rounded bg-white/10 border-white/30 hover:bg-white/20"
            onClick={handleClearSelection}
            title="Clear selection (Esc)"
          >
            ✕ Clear
          </button>
        </div>
      </div>
    </div>
  );
}
