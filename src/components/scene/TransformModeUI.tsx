import React from "react";

interface TransformModeUIProps {
  mode: "translate" | "rotate" | "scale";
  setMode: (m: "translate" | "rotate" | "scale") => void;
  style: React.CSSProperties;
}

export function TransformModeUI({
  mode,
  setMode,
  style,
}: TransformModeUIProps) {
  // Simple overlay at bottom-right of canvas:
  return (
    <div style={style}>
      <div className="bg-white/90 p-2 rounded flex gap-1 backdrop-blur-sm border border-gray-200 shadow-sm">
        <button
          onClick={() => setMode("translate")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            mode === "translate"
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Move
        </button>
        <button
          onClick={() => setMode("rotate")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            mode === "rotate"
              ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Rotate
        </button>
        <button
          onClick={() => setMode("scale")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            mode === "scale"
              ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Scale
        </button>
      </div>
    </div>
  );
}

export default TransformModeUI;
