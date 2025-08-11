import { useStore, StoreState } from "../../store";
import { useTool } from "../../contexts/ToolContext";

export function useKeyboardShortcuts() {
  const selectedId = useStore((s: StoreState) => s.selectedId);
  const setSelectedId = useStore((s: StoreState) => s.setSelectedId);
  const selectedIds = useStore((s: StoreState) => s.selectedIds);
  const setSelectedIds = useStore((s: StoreState) => s.setSelectedIds);
  const removeObject = useStore((s: StoreState) => s.removeObject);
  const objects = useStore((s: StoreState) => s.objects);
  const updateObject = useStore((s: StoreState) => s.updateObject);
  const { selectedTool, setSelectedTool } = useTool();

  const handleKeyDown = (e: KeyboardEvent) => {
    // Delete key - remove selected objects
    if (e.key === "Delete" && (selectedId || selectedIds.length > 0)) {
      if (selectedIds.length > 0) {
        // Multi-delete
        selectedIds.forEach((id: string) => {
          removeObject(id);
        });
        setSelectedIds([]);
        setSelectedId(null);
      } else if (selectedId) {
        // Single delete
        removeObject(selectedId);
        setSelectedId(null);
      }
    }

    // Escape key - go to Select mode
    if (e.key === "Escape" && selectedTool) {
      setSelectedTool("select");
    }

    // S key - go to Select mode
    if (e.key.toLowerCase() === "s") {
      e.preventDefault();
      setSelectedTool("select");
    }

    // B key - Building
    if (e.key.toLowerCase() === "b") {
      e.preventDefault();
      setSelectedTool("building");
    }

    // A key - Water
    if (e.key.toLowerCase() === "a") {
      e.preventDefault();
      setSelectedTool("water");
    }

    // W key - Wall
    if (e.key.toLowerCase() === "w") {
      e.preventDefault();
      setSelectedTool("wall");
    }

    // T key - Tree
    if (e.key.toLowerCase() === "t") {
      e.preventDefault();
      setSelectedTool("tree");
    }

    // R key - Road
    if (e.key.toLowerCase() === "r") {
      e.preventDefault();
      setSelectedTool("road");
    }

    // Space key - toggle between Select and Build mode
    if (e.key === " ") {
      e.preventDefault(); // Prevent page scroll
      if (selectedTool === "select") {
        // Go to the last selected build tool
        const lastTool =
          objects.length > 0 ? objects[objects.length - 1].type : "building";
        setSelectedTool(
          lastTool as "building" | "wall" | "tree" | "water" | "road"
        );
      } else {
        // Go to Select mode
        setSelectedTool("select");
      }
    }

    // U key - update selected object with random color change
    if (e.key.toLowerCase() === "u" && selectedId) {
      const selectedObj = objects.find(
        (obj: { id: string; type: string }) => obj.id === selectedId
      );
      if (selectedObj && selectedObj.type === "building") {
        // Generate a random color for buildings
        const randomColor =
          "#" + Math.floor(Math.random() * 16777215).toString(16);
        updateObject(selectedId, { color: randomColor });
      }
    }
  };

  return { handleKeyDown };
}
