import { useEffect, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import { useEditor } from "@/contexts/EditorContext";
import { useTool } from "@/contexts/ToolContext";
import { useSimplifiedPointerEvents } from "./pointer-events/useSimplifiedPointerEvents";
import { RoadPreview } from "@/components/build-objects/road";
import { PointerEventContext, StoreActions, SelectionState, ToolState } from "./pointer-events/types";

export function SelectionAndPlacement() {
  const { camera, gl, scene } = useThree();

  // Context hooks
  const editor = useEditor();
  const tool = useTool();

  // Create context objects for the pointer event system
  const pointerContext: PointerEventContext = {
    canvas: gl.domElement,
    camera,
    scene,
    gridSize: editor.gridSize,
    snap: editor.snapEnabled,
    objects: editor.objects,
  };

  const storeActions: StoreActions = {
    addObject: editor.addObject,
    updateObject: editor.updateObject,
    removeObject: editor.removeObject,
    setSelectedId: editor.setSelectedId,
    setSelectedIds: editor.setSelectedIds,
  };

  const selectionState: SelectionState = {
    selectedId: editor.selectedId,
    selectedIds: editor.selectedIds,
  };

  const toolState: ToolState = {
    selectedTool: tool.selectedTool || "select",
    setSelectedTool: tool.setSelectedTool,
  };

  // Initialize the simplified pointer event system
  const {
    handlePointerDown,
    handleKeyDown,
    roadDrawing,
  } = useSimplifiedPointerEvents(
    pointerContext,
    storeActions,
    selectionState,
    toolState
  );

  // Create stable event handlers
  const handlePointerDownCallback = useCallback(handlePointerDown, [handlePointerDown]);
  const handleKeyDownCallback = useCallback(handleKeyDown, [handleKeyDown]);
  const handleContextMenuCallback = useCallback((e: Event) => {
    e.preventDefault(); // Prevent right-click context menu
  }, []);

  // Set up event listeners
  useEffect(() => {
    const canvas = gl.domElement;
    if (!canvas) return;

    // Make canvas focusable for keyboard events
    canvas.tabIndex = 0;
    canvas.style.outline = "none";

    // Add event listeners
    canvas.addEventListener("pointerdown", handlePointerDownCallback);
    canvas.addEventListener("contextmenu", handleContextMenuCallback);

    // Focus canvas to receive keyboard events
    canvas.focus();

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDownCallback);
      canvas.removeEventListener("contextmenu", handleContextMenuCallback);
    };
  }, [gl, handlePointerDownCallback, handleContextMenuCallback]);

  // Handle window-level keyboard events
  useEffect(() => {
    const handleWindowKeyDown = (event: KeyboardEvent) => {
      // Only handle if canvas has focus or no other input is focused
      const activeElement = document.activeElement;
      const isInputFocused = activeElement && 
        (activeElement.tagName === 'INPUT' || 
         activeElement.tagName === 'TEXTAREA' || 
         activeElement.hasAttribute('contenteditable'));

      if (!isInputFocused) {
        handleKeyDownCallback(event);
      }
    };

    window.addEventListener("keydown", handleWindowKeyDown);
    return () => {
      window.removeEventListener("keydown", handleWindowKeyDown);
    };
  }, [handleKeyDownCallback]);

  // Get road preview data
  const roadPreview = roadDrawing.getRoadPreview();

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

      {/* Debug info in development */}
      {process.env.NODE_ENV === "development" && roadDrawing.isDrawingRoad && (
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial 
            color="#ffff00" 
            emissive="#ffff00" 
            emissiveIntensity={0.5} 
          />
        </mesh>
      )}
    </>
  );
}

