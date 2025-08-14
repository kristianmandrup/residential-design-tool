import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useGenericDrawingContext } from "@/contexts/GenericDrawingContext";
import { useGenericDrawing } from "@/components/build-objects/shared/genericDrawing";
import { roadDrawingBehavior } from "@/components/build-objects/road/roadDrawingBehavior";
import { waterDrawingBehavior } from "@/components/build-objects/water/waterDrawingBehavior";
import { wallDrawingBehavior } from "@/components/build-objects/wall/wallDrawingBehavior";
import {
  PointerEventContext,
  StoreActions,
  SelectionState,
  ToolState,
} from "./types";

export function useGenericPointerEvents(
  pointerContext: PointerEventContext,
  storeActions: StoreActions,
  selectionState: SelectionState,
  toolState: ToolState
) {
  const drawingContext = useGenericDrawingContext();

  // Initialize drawing systems for each object type
  const roadDrawing = useGenericDrawing(
    {
      isDrawing: drawingContext.isDrawingRoad,
      tempPoints: drawingContext.tempRoadPoints,
      lastClickTime: drawingContext.lastClickTime,
      selectedType: drawingContext.selectedRoadType,
      snapToGrid: drawingContext.snapToGrid,
    },
    {
      setIsDrawing: drawingContext.setIsDrawingRoad,
      setTempPoints: drawingContext.setTempRoadPoints,
      setLastClickTime: drawingContext.setLastClickTime,
      setSelectedType: drawingContext.setSelectedRoadType,
      setSnapToGrid: drawingContext.setSnapToGrid,
      addObject: storeActions.addObject,
      cancelDrawing: drawingContext.cancelRoadDrawing,
      undoLastPoint: drawingContext.undoLastRoadPoint,
      finishDrawing: () => false,
    },
    roadDrawingBehavior,
    pointerContext.gridSize
  );

  const waterDrawing = useGenericDrawing(
    {
      isDrawing: drawingContext.isDrawingWater,
      tempPoints: drawingContext.tempWaterPoints,
      lastClickTime: drawingContext.lastClickTime,
      selectedType: drawingContext.selectedWaterType,
      snapToGrid: drawingContext.snapToGrid,
    },
    {
      setIsDrawing: drawingContext.setIsDrawingWater,
      setTempPoints: drawingContext.setTempWaterPoints,
      setLastClickTime: drawingContext.setLastClickTime,
      setSelectedType: drawingContext.setSelectedWaterType,
      setSnapToGrid: drawingContext.setSnapToGrid,
      addObject: storeActions.addObject,
      cancelDrawing: drawingContext.cancelWaterDrawing,
      undoLastPoint: drawingContext.undoLastWaterPoint,
      finishDrawing: () => false,
    },
    waterDrawingBehavior,
    pointerContext.gridSize
  );

  const wallDrawing = useGenericDrawing(
    {
      isDrawing: drawingContext.isDrawingWall,
      tempPoints: drawingContext.tempWallPoints,
      lastClickTime: drawingContext.lastClickTime,
      selectedType: drawingContext.selectedWallType,
      snapToGrid: drawingContext.snapToGrid,
    },
    {
      setIsDrawing: drawingContext.setIsDrawingWall,
      setTempPoints: drawingContext.setTempWallPoints,
      setLastClickTime: drawingContext.setLastClickTime,
      setSelectedType: drawingContext.setSelectedWallType,
      setSnapToGrid: drawingContext.setSnapToGrid,
      addObject: storeActions.addObject,
      cancelDrawing: drawingContext.cancelWallDrawing,
      undoLastPoint: drawingContext.undoLastWallPoint,
      finishDrawing: () => false,
    },
    wallDrawingBehavior,
    pointerContext.gridSize
  );

  // Utility functions
  const getWorldIntersection = useCallback(
    (event: PointerEvent): THREE.Vector3 | null => {
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

      return didIntersect ? intersectionPoint : null;
    },
    [pointerContext.canvas, pointerContext.camera]
  );

  const generateUniqueId = useCallback((type: string) => {
    return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Object creation templates for non-drawing tools
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

        while (targetObject && !targetObject.userData?.objectId) {
          targetObject = targetObject.parent as THREE.Object3D;
        }

        if (targetObject?.userData?.objectId) {
          console.log("🎯 Selected object:", targetObject.userData.objectId);
          storeActions.setSelectedId(targetObject.userData.objectId);
          return true;
        }
      }

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
      const worldPosition = getWorldIntersection(event);
      if (!worldPosition) return;

      const intersect = { x: worldPosition.x, z: worldPosition.z };

      // Handle drawing tools
      switch (toolState.selectedTool) {
        case "road":
          roadDrawing.handleDrawingClick(event, intersect);
          return;

        case "water":
          waterDrawing.handleDrawingClick(event, intersect);
          return;

        case "wall":
          wallDrawing.handleDrawingClick(event, intersect);
          return;
      }

      // Handle direct placement tools
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
      getWorldIntersection,
      createObjectTemplates,
      handleSelection,
      roadDrawing,
      waterDrawing,
      wallDrawing,
      storeActions,
    ]
  );

  // Keyboard handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Escape - cancel any active drawing or deselect
      if (event.key === "Escape") {
        if (roadDrawing.isDrawing) {
          event.preventDefault();
          roadDrawing.cancelDrawing();
        } else if (waterDrawing.isDrawing) {
          event.preventDefault();
          waterDrawing.cancelDrawing();
        } else if (wallDrawing.isDrawing) {
          event.preventDefault();
          wallDrawing.cancelDrawing();
        } else {
          storeActions.setSelectedId(null);
        }
        return;
      }

      // Enter - finish any active drawing
      if (event.key === "Enter") {
        if (roadDrawing.isDrawing && roadDrawing.tempPoints.length >= 2) {
          event.preventDefault();
          roadDrawing.finishDrawing();
          return;
        }
        if (waterDrawing.isDrawing && waterDrawing.tempPoints.length >= 1) {
          event.preventDefault();
          waterDrawing.finishDrawing();
          return;
        }
        if (wallDrawing.isDrawing && wallDrawing.tempPoints.length >= 2) {
          event.preventDefault();
          wallDrawing.finishDrawing();
          return;
        }
      }

      // Ctrl+Z - undo last point in any active drawing
      if (event.ctrlKey && event.key.toLowerCase() === "z") {
        if (roadDrawing.isDrawing) {
          event.preventDefault();
          roadDrawing.undoLastPoint();
          return;
        }
        if (waterDrawing.isDrawing) {
          event.preventDefault();
          waterDrawing.undoLastPoint();
          return;
        }
        if (wallDrawing.isDrawing) {
          event.preventDefault();
          wallDrawing.undoLastPoint();
          return;
        }
      }

      // Delete key - remove selected object
      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectionState.selectedId) {
          event.preventDefault();
          storeActions.removeObject(selectionState.selectedId);
          storeActions.setSelectedId(null);
          return;
        }
      }

      // Tool shortcuts
      const toolShortcuts: Record<
        string,
        "select" | "road" | "building" | "tree" | "wall" | "water"
      > = {
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
        toolState.setSelectedTool(newTool);
        return;
      }

      // C - add curve to last road segment
      if (event.key.toLowerCase() === "c" && roadDrawing.isDrawing) {
        event.preventDefault();
        roadDrawing.addCurveToLastSegment();
        return;
      }
    },
    [
      roadDrawing,
      waterDrawing,
      wallDrawing,
      selectionState,
      storeActions,
      toolState,
    ]
  );

  return {
    handlePointerDown,
    handleKeyDown,

    // Drawing interfaces
    roadDrawing: {
      isDrawing: roadDrawing.isDrawing,
      tempPoints: roadDrawing.tempPoints,
      selectedType: roadDrawing.selectedType,
      getPreview: roadDrawing.getPreview,
      getDrawingInstructions: roadDrawing.getDrawingInstructions,
    },
    waterDrawing: {
      isDrawing: waterDrawing.isDrawing,
      tempPoints: waterDrawing.tempPoints,
      selectedType: waterDrawing.selectedType,
      getPreview: waterDrawing.getPreview,
      getDrawingInstructions: waterDrawing.getDrawingInstructions,
    },
    wallDrawing: {
      isDrawing: wallDrawing.isDrawing,
      tempPoints: wallDrawing.tempPoints,
      selectedType: wallDrawing.selectedType,
      getPreview: wallDrawing.getPreview,
      getDrawingInstructions: wallDrawing.getDrawingInstructions,
    },
  };
}
