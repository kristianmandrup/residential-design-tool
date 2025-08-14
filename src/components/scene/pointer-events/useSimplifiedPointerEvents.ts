import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useRoadDrawing } from "@/contexts/RoadDrawingContext";
import {
  useUnifiedRoadDrawing,
  RoadDrawingUtils,
} from "@/components/build-objects/road/unifiedRoadDrawing";
import {
  PointerEventContext,
  StoreActions,
  SelectionState,
  ToolState,
} from "./types";
import { Tool } from "@/contexts";

export function useSimplifiedPointerEvents(
  pointerContext: PointerEventContext,
  storeActions: StoreActions,
  selectionState: SelectionState,
  toolState: ToolState
) {
  const roadDrawingContext = useRoadDrawing();

  // Use unified road drawing logic
  const roadDrawing = useUnifiedRoadDrawing(
    {
      isDrawingRoad: roadDrawingContext.isDrawingRoad,
      tempRoadPoints: roadDrawingContext.tempRoadPoints,
      lastClickTime: roadDrawingContext.lastClickTime,
      selectedRoadType: roadDrawingContext.selectedRoadType,
      roadWidth: roadDrawingContext.roadWidth,
      snapToGrid: roadDrawingContext.snapToGrid,
    },
    {
      setIsDrawingRoad: roadDrawingContext.setIsDrawingRoad,
      setTempRoadPoints: roadDrawingContext.setTempRoadPoints,
      setLastClickTime: roadDrawingContext.setLastClickTime,
      setSelectedRoadType: roadDrawingContext.setSelectedRoadType,
      setRoadWidth: roadDrawingContext.setRoadWidth,
      setSnapToGrid: roadDrawingContext.setSnapToGrid,
      addObject: storeActions.addObject,
      cancelRoadDrawing: roadDrawingContext.cancelRoadDrawing,
      undoLastRoadPoint: roadDrawingContext.undoLastRoadPoint,
      finishRoad: () => false, // Will be overridden
    },
    pointerContext.gridSize
  );

  // Utility functions
  const snapToGrid = useCallback(
    (x: number, z: number) => {
      return RoadDrawingUtils.snapToGrid(
        x,
        z,
        pointerContext.gridSize,
        pointerContext.snap
      );
    },
    [pointerContext.gridSize, pointerContext.snap]
  );

  const generateUniqueId = useCallback((type: string) => {
    return `${type}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 11)}`;
  }, []);

  // Object creation templates
  const createObjectTemplates = useMemo(
    () => ({
      building: (position: [number, number, number]) => ({
        id: generateUniqueId("building"),
        type: "building" as const,
        name: "Building",
        position,
        rotation: [0, 0, 0] as [number, number, number],
        scale: [1, 1, 1] as [number, number, number],
        floors: 3,
        color: "#8B4513",
        roofType: "flat" as const,
        roofColor: "#666666",
        gridWidth: 2,
        gridDepth: 2,
        gridHeight: 3,
        floorProperties: Array(3)
          .fill(null)
          .map(() => ({
            wallColor: "#8B4513",
            windowsEnabled: true,
          })),
        windowColor: "#87CEEB",
      }),

      tree: (position: [number, number, number]) => ({
        id: generateUniqueId("tree"),
        type: "tree" as const,
        name: "Tree",
        position,
        rotation: [0, Math.random() * Math.PI * 2, 0] as [
          number,
          number,
          number
        ],
        scale: [1, 1, 1] as [number, number, number],
        gridWidth: 1,
        gridDepth: 1,
        gridHeight: 3,
        foliageColor: "#228B22",
        treeType: "oak",
      }),

      wall: (position: [number, number, number]) => ({
        id: generateUniqueId("wall"),
        type: "wall" as const,
        name: "Wall",
        position,
        rotation: [0, 0, 0] as [number, number, number],
        scale: [1, 1, 1] as [number, number, number],
        gridWidth: 4,
        gridDepth: 0.2,
        gridHeight: 2,
        color: "#CCCCCC",
        thickness: 0.2,
        height: 2,
        length: 4,
      }),

      water: (position: [number, number, number]) => ({
        id: generateUniqueId("water"),
        type: "water" as const,
        name: "Water",
        position,
        rotation: [0, 0, 0] as [number, number, number],
        scale: [1, 1, 1] as [number, number, number],
        gridWidth: 3,
        gridDepth: 3,
        gridHeight: 0.2,
        radius: 3,
        width: 3,
        depth: 3,
        waveHeight: 0.1,
        transparency: 0.7,
        shape: "circular" as const,
      }),
    }),
    [generateUniqueId]
  );

  // Handle selection
  const handleSelection = useCallback(
    (event: PointerEvent): boolean => {
      const rect = pointerContext.canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), pointerContext.camera);

      const intersects = raycaster.intersectObjects(
        pointerContext.scene.children,
        true
      );

      if (intersects.length > 0) {
        let targetObject = intersects[0].object;

        // Find object with userData.objectId
        while (targetObject && !targetObject.userData?.objectId) {
          targetObject = targetObject.parent as THREE.Object3D;
        }

        if (targetObject?.userData?.objectId) {
          console.log("🎯 Selected object:", targetObject.userData.objectId);
          storeActions.setSelectedId(targetObject.userData.objectId);
          return true;
        }
      }

      // No object selected
      storeActions.setSelectedId(null);
      return false;
    },
    [
      pointerContext.canvas,
      pointerContext.camera,
      pointerContext.scene,
      storeActions,
    ]
  );

  // Main pointer down handler
  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      console.log(`🛠️ ${toolState.selectedTool} tool activated`);

      // Handle selection tool
      if (toolState.selectedTool === "select") {
        handleSelection(event);
        return;
      }

      // Get world intersection point
      const rect = pointerContext.canvas.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), pointerContext.camera);

      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersectionPoint = new THREE.Vector3();
      const didIntersect = raycaster.ray.intersectPlane(
        groundPlane,
        intersectionPoint
      );

      const worldPosition = didIntersect ? intersectionPoint : null;
      if (!worldPosition) return;

      const snapped = snapToGrid(worldPosition.x, worldPosition.z);
      const intersect = { x: snapped.x, z: snapped.z };

      // Handle road drawing
      if (toolState.selectedTool === "road") {
        roadDrawing.handleRoadClick(event, intersect);
        return;
      }

      // Handle other object placement
      const position: [number, number, number] = [intersect.x, 0, intersect.z];

      if (
        toolState.selectedTool &&
        toolState.selectedTool in createObjectTemplates
      ) {
        const template =
          createObjectTemplates[
            toolState.selectedTool as keyof typeof createObjectTemplates
          ];
        const objectData = template(position);

        console.log(`✨ Creating ${toolState.selectedTool}:`, objectData);
        storeActions.addObject(objectData);
      }
    },
    [
      toolState.selectedTool,
      snapToGrid,
      createObjectTemplates,
      handleSelection,
      roadDrawing,
      storeActions,
      pointerContext.canvas,
      pointerContext.camera,
    ]
  );

  // Keyboard handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Escape - cancel road drawing or deselect
      if (event.key === "Escape") {
        if (roadDrawing.isDrawingRoad) {
          event.preventDefault();
          roadDrawing.cancelRoadDrawing();
        } else {
          storeActions.setSelectedId(null);
        }
        return;
      }

      // Enter - finish road drawing
      if (
        event.key === "Enter" &&
        roadDrawing.isDrawingRoad &&
        roadDrawing.tempRoadPoints.length >= 2
      ) {
        event.preventDefault();
        console.log("⏎ Finishing road with Enter key");
        roadDrawing.finishRoad();
        return;
      }

      // Ctrl+Z - undo last road point
      if (
        event.ctrlKey &&
        event.key.toLowerCase() === "z" &&
        roadDrawing.isDrawingRoad
      ) {
        event.preventDefault();
        roadDrawing.undoLastPoint();
        return;
      }

      // Delete key - remove selected object
      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectionState.selectedId) {
          event.preventDefault();
          console.log("🗑️ Deleting object:", selectionState.selectedId);
          storeActions.removeObject(selectionState.selectedId);
          storeActions.setSelectedId(null);
          return;
        }
      }

      // Tool shortcuts
      const toolShortcuts: Record<string, string> = {
        s: "select",
        r: "road",
        b: "building",
        t: "tree",
        w: "wall",
        a: "water",
      };

      if (toolShortcuts[event.key.toLowerCase()]) {
        event.preventDefault();
        const newTool = toolShortcuts[event.key.toLowerCase()];
        console.log(`🛠️ Switching to ${newTool} tool`);
        toolState.setSelectedTool(newTool as Tool);
        return;
      }

      // C - add curve to last road segment
      if (event.key.toLowerCase() === "c" && roadDrawing.isDrawingRoad) {
        event.preventDefault();
        roadDrawing.addCurveToLastSegment();
        return;
      }
    },
    [roadDrawing, selectionState, storeActions, toolState]
  );

  return {
    handlePointerDown,
    handleKeyDown,

    // Road drawing interface
    roadDrawing: {
      isDrawingRoad: roadDrawing.isDrawingRoad,
      tempRoadPoints: roadDrawing.tempRoadPoints,
      cancelRoadDrawing: roadDrawing.cancelRoadDrawing,
      undoLastPoint: roadDrawing.undoLastPoint,
      getRoadPreview: roadDrawing.getRoadPreview,
      getDrawingInstructions: roadDrawing.getDrawingInstructions,
    },
  };
}
