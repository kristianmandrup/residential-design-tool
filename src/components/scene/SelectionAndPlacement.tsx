import { useEffect, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import { useEditor } from "@/contexts/EditorContext";
import { useTool } from "@/contexts/ToolContext";
import { useRoadDrawing } from "@/contexts/RoadDrawingContext";
import { usePointerEventSystem } from "./pointer-events";
import { RoadPreview } from "@/components/build-objects/road";
import { PointerEventContext, StoreActions, SelectionState, ToolState } from "./pointer-events/types";

export function SelectionAndPlacement() {
  const { camera, gl, scene } = useThree();

  // Editor context (replaces old store)
  const {
    objects,
    addObject,
    updateObject,
    removeObject,
    selectedId,
    selectedIds,
    setSelectedId,
    setSelectedIds,
    gridSize,
    snapEnabled,
  } = useEditor();

  // Tool context
  const { selectedTool, setSelectedTool } = useTool();

  // Road drawing context
  const roadDrawing = useRoadDrawing();

  // Create context objects for the pointer event system
  const pointerContext: PointerEventContext = {
    canvas: gl.domElement,
    camera,
    scene,
    gridSize,
    snap: snapEnabled,
    objects,
  };

  const storeActions: StoreActions = {
    addObject,
    updateObject,
    removeObject,
    setSelectedId,
    setSelectedIds,
  };

  const selectionState: SelectionState = {
    selectedId,
    selectedIds,
  };

  const toolState: ToolState = {
    selectedTool: selectedTool || "select",
    setSelectedTool,
  };

  // Initialize the pointer event system
  const {
    handlePointerDown,
    handleKeyDown,
    getRoadPreview,
  } = usePointerEventSystem(
    pointerContext,
    storeActions,
    selectionState,
    toolState
  );

  // Create stable event handlers
  const handlePointerDownCallback = useCallback(handlePointerDown, [
    handlePointerDown,
  ]);
  const handleKeyDownCallback = useCallback(handleKeyDown, [handleKeyDown]);
  const handleContextMenuCallback = useCallback((e: Event) => {
    e.preventDefault();
  }, []);

  // Set up event listeners
  useEffect(() => {
    const canvas = gl.domElement;
    if (!canvas) return;

    // Make canvas focusable for keyboard events
    canvas.tabIndex = 0;
    canvas.style.outline = "none";

    canvas.addEventListener("pointerdown", handlePointerDownCallback);
    canvas.addEventListener("keydown", handleKeyDownCallback);
    canvas.addEventListener("contextmenu", handleContextMenuCallback);

    // Focus canvas to receive keyboard events
    canvas.focus();

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDownCallback);
      canvas.removeEventListener("keydown", handleKeyDownCallback);
      canvas.removeEventListener("contextmenu", handleContextMenuCallback);
    };
  }, [
    gl,
    handlePointerDownCallback,
    handleKeyDownCallback,
    handleContextMenuCallback,
  ]);

  // Handle window-level keyboard events as backup
  useEffect(() => {
    const handleWindowKeyDown = (event: KeyboardEvent) => {
      // Only handle if no other element has focus or if canvas has focus
      if (
        document.activeElement === gl.domElement ||
        document.activeElement === document.body
      ) {
        handleKeyDownCallback(event);
      }
    };

    window.addEventListener("keydown", handleWindowKeyDown);
    return () => {
      window.removeEventListener("keydown", handleWindowKeyDown);
    };
  }, [handleKeyDownCallback, gl.domElement]);

  // Get road preview data
  const roadPreview = getRoadPreview();

  return (
    <>
      {/* Render road preview during drawing */}
      {roadPreview && (
        <RoadPreview
          points={roadPreview.points}
          width={roadPreview.width}
          color={roadPreview.color}
          opacity={0.7}
          elevation={roadPreview.elevation}
        />
      )}
    </>
  );
}

