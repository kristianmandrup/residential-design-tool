/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useStore, StoreState } from "../../store/useStore";
import { useTool } from "../../context/ToolContext";
import { useKeyboardShortcuts } from "./KeyboardShortcuts";
import { usePointerEventHandlers } from "./PointerEventHandlers";
import { useRoadDrawingLogic } from "./RoadDrawingLogic";
import {
  getIntersection,
  snapVec,
  checkCollision,
  selectObject,
} from "./SceneUtils";

export function SelectionAndPlacement() {
  const { camera, gl, scene } = useThree();
  const addObject = useStore((s: StoreState) => s.addObject);
  const selectedId = useStore((s: StoreState) => s.selectedId);
  const setSelectedId = useStore((s: StoreState) => s.setSelectedId);
  const updateObject = useStore((s: StoreState) => s.updateObject);
  const removeObject = useStore((s: StoreState) => s.removeObject);
  const gridSize = useStore((s: StoreState) => s.gridSize);
  const snap = useStore((s: StoreState) => s.snapEnabled);
  const objects = useStore((s: StoreState) => s.objects);
  const { selectedTool, setSelectedTool } = useTool();

  // road drawing state
  const [isDrawingRoad, setIsDrawingRoad] = useState(false);
  const [tempRoadPoints, setTempRoadPoints] = useState<[number, number][]>([]);
  const [lastClickTime, setLastClickTime] = useState<number | null>(null);

  // Keyboard shortcuts
  const { handleKeyDown } = useKeyboardShortcuts();

  // Road drawing logic
  const roadDrawingState = {
    isDrawingRoad,
    tempRoadPoints,
    lastClickTime,
  };

  const roadDrawingActions = {
    setIsDrawingRoad,
    setTempRoadPoints,
    setLastClickTime,
    addObject: (obj: any) => addObject(obj),
  };

  const { handleRoadDrawing } = useRoadDrawingLogic(
    roadDrawingState,
    roadDrawingActions
  );

  // Pointer event handlers
  const { handleDown, handleContextMenu } = usePointerEventHandlers({
    canvas: gl.domElement,
    camera,
    scene,
    addObject: (obj: any) => addObject(obj),
    setSelectedId,
    removeObject,
    gridSize,
    snap,
    objects,
    updateObject: (id: string, updates: any) => updateObject(id, updates),
    selectedTool: selectedTool || "select",
    setSelectedTool: (tool: string) => setSelectedTool(tool as any),
    tempRoadPoints,
    setTempRoadPoints,
    setIsDrawingRoad,
    setLastClickTime,
    lastClickTime,
    selectedId,
  });

  // pointer handling on canvas
  useEffect(() => {
    const canvas = gl.domElement;
    if (!canvas) return;

    // Keyboard shortcuts
    canvas.addEventListener("keydown", handleKeyDown);
    canvas.addEventListener("contextmenu", handleContextMenu);

    canvas.addEventListener("pointerdown", handleDown);
    return () => {
      canvas.removeEventListener("keydown", handleKeyDown);
      canvas.removeEventListener("contextmenu", handleContextMenu);
      canvas.removeEventListener("pointerdown", handleDown);
    };
  }, [
    gl,
    camera,
    scene,
    addObject,
    setSelectedId,
    lastClickTime,
    tempRoadPoints,
    gridSize,
    snap,
    selectedId,
    removeObject,
    objects,
    updateObject,
    selectedTool,
    setSelectedTool,
    handleKeyDown,
    handleContextMenu,
    handleDown,
  ]);

  // render temporary road line as a simple helper (optional)
  return null;
}
