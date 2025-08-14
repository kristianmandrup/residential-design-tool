import { useEffect, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import { useEditor } from "@/contexts/EditorContext";
import { useTool } from "@/contexts/ToolContext";
import { useGenericPointerEvents } from "./pointer-events/useGenericPointerEvents";
import { RoadPreview } from "@/components/build-objects/road";
import {
  PointerEventContext,
  StoreActions,
  SelectionState,
  ToolState,
} from "./pointer-events/types";

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

  // Initialize the generic pointer event system
  const {
    handlePointerDown,
    handleKeyDown,
    roadDrawing,
    waterDrawing,
    wallDrawing,
  } = useGenericPointerEvents(
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

    canvas.tabIndex = 0;
    canvas.style.outline = "none";

    canvas.addEventListener("pointerdown", handlePointerDownCallback);
    canvas.addEventListener("contextmenu", handleContextMenuCallback);
    canvas.focus();

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDownCallback);
      canvas.removeEventListener("contextmenu", handleContextMenuCallback);
    };
  }, [gl, handlePointerDownCallback, handleContextMenuCallback]);

  // Handle window-level keyboard events
  useEffect(() => {
    const handleWindowKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.hasAttribute("contenteditable"));

      if (!isInputFocused) {
        handleKeyDownCallback(event);
      }
    };

    window.addEventListener("keydown", handleWindowKeyDown);
    return () => {
      window.removeEventListener("keydown", handleWindowKeyDown);
    };
  }, [handleKeyDownCallback]);

  // Get preview data for active drawings
  const roadPreview = roadDrawing.getPreview();
  const waterPreview = waterDrawing.getPreview();
  const wallPreview = wallDrawing.getPreview();

  return (
    <>
      {/* Render road preview during drawing */}
      {roadPreview && (
        <RoadPreview
          points={roadPreview.points}
          width={roadPreview.width || 6}
          color={roadPreview.color}
          opacity={0.7}
          elevation={roadPreview.elevation}
        />
      )}

      {/* Render water preview during drawing */}
      {waterPreview && waterPreview.points.length > 0 && (
        <group>
          {waterPreview.points.map((point, index) => (
            <mesh key={index} position={[point.x, 0.1, point.z]}>
              <sphereGeometry args={[0.2]} />
              <meshStandardMaterial
                color={waterPreview.color}
                transparent
                opacity={0.7}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Render wall preview during drawing */}
      {wallPreview && wallPreview.points.length > 0 && (
        <group>
          {wallPreview.points.map((point, index) => (
            <mesh key={index} position={[point.x, 1, point.z]}>
              <boxGeometry args={[0.2, 2, 0.2]} />
              <meshStandardMaterial
                color={wallPreview.color}
                transparent
                opacity={0.7}
              />
            </mesh>
          ))}
          {wallPreview.points.length > 1 &&
            wallPreview.points.map((point, index) => {
              if (index === wallPreview.points.length - 1) return null;
              const nextPoint = wallPreview.points[index + 1];
              const centerX = (point.x + nextPoint.x) / 2;
              const centerZ = (point.z + nextPoint.z) / 2;
              const length = Math.sqrt(
                Math.pow(nextPoint.x - point.x, 2) +
                  Math.pow(nextPoint.z - point.z, 2)
              );
              const angle = Math.atan2(
                nextPoint.z - point.z,
                nextPoint.x - point.x
              );

              return (
                <mesh
                  key={`wall-${index}`}
                  position={[centerX, 1, centerZ]}
                  rotation={[0, angle, 0]}
                >
                  <boxGeometry args={[length, 2, wallPreview.width || 0.2]} />
                  <meshStandardMaterial
                    color={wallPreview.color}
                    transparent
                    opacity={0.5}
                  />
                </mesh>
              );
            })}
        </group>
      )}

      {/* Debug indicators */}
      {process.env.NODE_ENV === "development" && (
        <>
          {roadDrawing.isDrawing && (
            <mesh position={[0, 0.5, 0]}>
              <sphereGeometry args={[0.05]} />
              <meshStandardMaterial
                color="#ffff00"
                emissive="#ffff00"
                emissiveIntensity={0.5}
              />
            </mesh>
          )}
          {waterDrawing.isDrawing && (
            <mesh position={[0.2, 0.5, 0]}>
              <sphereGeometry args={[0.05]} />
              <meshStandardMaterial
                color="#00ffff"
                emissive="#00ffff"
                emissiveIntensity={0.5}
              />
            </mesh>
          )}
          {wallDrawing.isDrawing && (
            <mesh position={[-0.2, 0.5, 0]}>
              <sphereGeometry args={[0.05]} />
              <meshStandardMaterial
                color="#ff0000"
                emissive="#ff0000"
                emissiveIntensity={0.5}
              />
            </mesh>
          )}
        </>
      )}
    </>
  );
}
