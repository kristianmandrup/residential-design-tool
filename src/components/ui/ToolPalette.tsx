import { EnhancedDrawingControls } from "./EnhancedDrawingControls";
import { IntersectionPanel } from "./IntersectionPanel";

interface ToolPaletteProps {
  selectedTool: string;
  onSelectTool: (tool: string) => void;
  drawingState?: {
    isDrawingRoad: boolean;
    isDrawingWall: boolean;
    isDrawingWater: boolean;
  };
}

export function ToolPalette({
  selectedTool,
  onSelectTool,
  drawingState,
}: ToolPaletteProps) {
  const tools = [
    { id: "select", icon: "🎯", name: "Select", shortcut: "S" },
    { id: "road", icon: "🛣️", name: "Road", shortcut: "R" },
    { id: "wall", icon: "🧱", name: "Wall", shortcut: "W" },
    { id: "water", icon: "💧", name: "Water", shortcut: "A" },
    { id: "building", icon: "🏢", name: "Building", shortcut: "B" },
    { id: "tree", icon: "🌳", name: "Tree", shortcut: "T" },
  ];

  const getToolStatus = (toolId: string) => {
    if (toolId === selectedTool) return "active";

    if (drawingState) {
      if (toolId === "road" && drawingState.isDrawingRoad) return "drawing";
      if (toolId === "wall" && drawingState.isDrawingWall) return "drawing";
      if (toolId === "water" && drawingState.isDrawingWater) return "drawing";
    }

    return "idle";
  };

  return (
    <div className="tool-palette">
      <div className="palette-header">
        <h3>🛠️ Tools</h3>
      </div>

      <div className="tool-grid">
        {tools.map((tool) => {
          const status = getToolStatus(tool.id);

          return (
            <button
              key={tool.id}
              className={`tool-button ${status}`}
              onClick={() => onSelectTool(tool.id)}
              title={`${tool.name} (${tool.shortcut})`}
            >
              <span className="tool-icon">{tool.icon}</span>
              <span className="tool-name">{tool.name}</span>
              <kbd className="tool-shortcut">{tool.shortcut}</kbd>

              {status === "drawing" && (
                <div className="drawing-indicator">✨</div>
              )}
            </button>
          );
        })}
      </div>

      <div className="palette-footer">
        <small>Click tool or press shortcut key</small>
      </div>
    </div>
  );
}

// Export all components
const exports = {
  EnhancedDrawingControls,
  IntersectionPanel,
  ToolPalette,
};

export default exports;
