/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/scene/SelectionAndPlacement.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { useStore, StoreState } from "@/store";
import { useTool } from "@/contexts/ToolContext";
import { RoadPoint } from "@/store/storeTypes";
import {
  usePointerEventSystem,
  PointerEventContext,
  StoreActions,
  SelectionState,
  RoadDrawingState,
  RoadDrawingActions,
  ToolState,
} from "./pointer-events";
import { RoadPreview } from "@/components/build-objects/road";

export function SelectionAndPlacement() {
  const { camera, gl, scene } = useThree();

  // Store state and actions
  const addObject = useStore((s: StoreState) => s.addObject);
  const updateObject = useStore((s: StoreState) => s.updateObject);
  const removeObject = useStore((s: StoreState) => s.removeObject);
  const setSelectedId = useStore((s: StoreState) => s.setSelectedId);
  const setSelectedIds = useStore((s: StoreState) => s.setSelectedIds);
  const selectedId = useStore((s: StoreState) => s.selectedId);
  const selectedIds = useStore((s: StoreState) => s.selectedIds);
  const gridSize = useStore((s: StoreState) => s.gridSize);
  const snap = useStore((s: StoreState) => s.snapEnabled);
  const objects = useStore((s: StoreState) => s.objects);

  // Tool context
  const { selectedTool, setSelectedTool } = useTool();

  // Road drawing state
  const [isDrawingRoad, setIsDrawingRoad] = useState(false);
  const [tempRoadPoints, setTempRoadPoints] = useState<RoadPoint[]>([]);
  const [lastClickTime, setLastClickTime] = useState<number | null>(null);
  const [selectedRoadType, setSelectedRoadType] = useState<
    "residential" | "highway" | "dirt" | "pedestrian"
  >("residential");
  const [roadWidth, setRoadWidth] = useState(6);

  // Create context objects for the pointer event system
  const pointerContext: PointerEventContext = {
    canvas: gl.domElement,
    camera,
    scene,
    gridSize,
    snap,
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

  const roadState: RoadDrawingState = {
    isDrawingRoad,
    tempRoadPoints,
    lastClickTime,
    selectedRoadType,
    roadWidth,
  };

  const roadActions: RoadDrawingActions = {
    setIsDrawingRoad,
    setTempRoadPoints,
    setLastClickTime,
    setSelectedRoadType,
    setRoadWidth,
  };

  const toolState: ToolState = {
    selectedTool: selectedTool || "select",
    setSelectedTool,
  };

  // Initialize the pointer event system
  const {
    handlePointerDown,
    handleKeyDown,
    cancelRoadDrawing,
    undoLastRoadPoint,
  } = usePointerEventSystem(
    pointerContext,
    storeActions,
    selectionState,
    roadState,
    roadActions,
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

  // Expose road drawing controls for UI
  const roadDrawingControls = useMemo(
    () => ({
      isDrawingRoad,
      tempRoadPoints,
      selectedRoadType,
      roadWidth,
      setSelectedRoadType,
      setRoadWidth,
      cancelRoadDrawing,
      undoLastRoadPoint,
      getInstructions: () => {
        if (!isDrawingRoad) {
          return "Click to start drawing a road";
        } else if (tempRoadPoints.length === 1) {
          return "Click to add road segments, double-click to finish";
        } else {
          return `Road with ${tempRoadPoints.length} points - Double-click to finish, Esc to cancel, Ctrl+U to undo`;
        }
      },
    }),
    [
      isDrawingRoad,
      tempRoadPoints,
      selectedRoadType,
      roadWidth,
      setSelectedRoadType,
      setRoadWidth,
      cancelRoadDrawing,
      undoLastRoadPoint,
    ]
  );

  // Add road drawing controls to window for external access (optional)
  useEffect(() => {
    (window as any).roadDrawingControls = roadDrawingControls;
    return () => {
      delete (window as any).roadDrawingControls;
    };
  }, [roadDrawingControls]);

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

  return (
    <>
      {/* Render road preview during drawing */}
      {isDrawingRoad && tempRoadPoints.length > 0 && (
        <RoadPreview
          points={tempRoadPoints}
          width={roadWidth}
          color="#404040"
          opacity={0.7}
        />
      )}

      {/* Road drawing instructions (could be moved to UI component) */}
      {isDrawingRoad && (
        <mesh position={[0, 0.5, 0]}>
          {/* This is just a placeholder - you'd want to use HTML overlay for actual text */}
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshBasicMaterial color="yellow" />
        </mesh>
      )}
    </>
  );
}

// Export road drawing controls hook for UI components
export function useRoadDrawingControls() {
  return (
    (window as any).roadDrawingControls || {
      isDrawingRoad: false,
      tempRoadPoints: [],
      selectedRoadType: "residential",
      roadWidth: 6,
      setSelectedRoadType: () => {},
      setRoadWidth: () => {},
      cancelRoadDrawing: () => {},
      undoLastRoadPoint: () => {},
      getInstructions: () => "Road drawing not initialized",
    }
  );
}
