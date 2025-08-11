import { useState, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useStore, StoreState } from "@/store";
import { useTool } from "@/contexts/ToolContext";
import { useKeyboardShortcuts } from "./KeyboardShortcuts";
import { usePointerEventHandlers } from "./PointerEventHandlers";
import * as THREE from "three";

export function SelectionAndPlacement() {
  const { camera, gl, scene } = useThree();
  const addObject = useStore((s: StoreState) => s.addObject);
  const selectedId = useStore((s: StoreState) => s.selectedId);
  const setSelectedId = useStore((s: StoreState) => s.setSelectedId);
  const setSelectedIds = useStore((s: StoreState) => s.setSelectedIds);
  const updateObject = useStore((s: StoreState) => s.updateObject);
  const removeObject = useStore((s: StoreState) => s.removeObject);
  const gridSize = useStore((s: StoreState) => s.gridSize);
  const snap = useStore((s: StoreState) => s.snapEnabled);
  const objects = useStore((s: StoreState) => s.objects);
  const { selectedTool, setSelectedTool } = useTool();

  // Road drawing state
  const [isDrawingRoad, setIsDrawingRoad] = useState(false);
  const [tempRoadPoints, setTempRoadPoints] = useState<[number, number][]>([]);
  const [lastClickTime, setLastClickTime] = useState<number | null>(null);

  // Keyboard shortcuts
  const { handleKeyDown } = useKeyboardShortcuts();

  // Pointer event handlers
  const { handleDown, handleContextMenu } = usePointerEventHandlers({
    canvas: gl.domElement,
    camera,
    scene,
    addObject,
    setSelectedId,
    setSelectedIds,
    removeObject,
    gridSize,
    snap,
    objects,
    updateObject,
    selectedTool: selectedTool || "select",
    setSelectedTool,
    tempRoadPoints,
    setTempRoadPoints,
    setIsDrawingRoad,
    setLastClickTime,
    lastClickTime,
    selectedId,
    selectedIds: useStore((s: StoreState) => s.selectedIds),
  });

  // Highlight selected object
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && child.userData.objectId) {
        const mesh = child as THREE.Mesh;
        if (mesh.userData.objectId === selectedId) {
          if (mesh.material instanceof THREE.MeshStandardMaterial) {
            mesh.material.emissive = new THREE.Color(0x00ff00);
            mesh.material.emissiveIntensity = 0.3;
          }
        } else {
          if (mesh.material instanceof THREE.MeshStandardMaterial) {
            mesh.material.emissive = new THREE.Color(0x000000);
            mesh.material.emissiveIntensity = 0;
          }
        }
      }
    });
  }, [selectedId, scene]);

  // Pointer handling on canvas
  useEffect(() => {
    const canvas = gl.domElement;
    if (!canvas) return;

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

  return null;
}
