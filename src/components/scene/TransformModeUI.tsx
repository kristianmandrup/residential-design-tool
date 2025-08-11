import React from "react";

interface TransformModeUIProps {
  mode: "translate" | "rotate" | "scale";
  setMode: (m: "translate" | "rotate" | "scale") => void;
  showTransformControls: boolean;
  setShowTransformControls: (show: boolean) => void;
  style: React.CSSProperties;
}

export function TransformModeUI({
  mode,
  setMode,
  showTransformControls,
  setShowTransformControls,
  style,
}: TransformModeUIProps) {
  // Simple overlay at bottom-right of canvas:
  return (
    <div style={style}>
      <div className="flex gap-1 p-2 border border-gray-200 rounded shadow-sm bg-white/90 backdrop-blur-sm">
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
        <button
          onClick={() => setShowTransformControls(!showTransformControls)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            showTransformControls
              ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {showTransformControls ? "Hide Gizmos" : "Show Gizmos"}
        </button>
      </div>
    </div>
  );
}

export default TransformModeUI;
