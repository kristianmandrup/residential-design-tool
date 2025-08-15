/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useEnhancedGenericPointerEvents.ts
import { useCallback, useMemo } from "react";
import * as THREE from "three";
import { useGenericDrawingContext } from "@/contexts/GenericDrawingContext";
import { useEnhancedGenericDrawing } from "@/components/objects/shared/enhancedGenericDrawing";
import { enhancedRoadDrawingBehavior } from "@/components/objects/behaviors/enhancedRoadDrawingBehavior";
import {
  enhancedWallDrawingBehavior,
  enhancedWaterDrawingBehavior,
} from "@/components/objects/behaviors/enhancedWallDrawingBehavior";
import {
  EnhancedGenericDrawingState,
  EnhancedGenericDrawingActions,
  DrawingPreview,
  ObjectGeometryResult,
  ObjectVisualConfig,
  GenericIntersection,
  GenericObjectData,
} from "@/components/objects/shared/types";
import {
  PointerEventContext,
  StoreActions,
  SelectionState,
} from "@/components/scene/pointer-events";
import { ToolState } from "@/contexts";

export interface EnhancedDrawingInterface {
  isDrawing: boolean;
  tempPoints: any[];
  selectedType: string;
  showPreview: boolean;
  showIntersections: boolean;
  autoOptimize: boolean;
  getPreview: () => DrawingPreview | null;
  getDrawingInstructions: () => string;
  getVisualConfig: () => ObjectVisualConfig | null;
  getCurrentGeometry: () => ObjectGeometryResult | null;
  getIntersections: () => GenericIntersection[];
  getOptimizedObjects: () => GenericObjectData[];
  canIntersectWith: (otherType: string) => boolean;
  getIntersectionRadius: () => number;
  togglePreview: () => void;
  toggleIntersections: () => void;
  toggleAutoOptimize: () => void;
  handleDrawingClick: (
    event: PointerEvent,
    intersect: { x: number; z: number }
  ) => boolean;
  cancelDrawing: () => void;
  undoLastPoint: () => void;
  finishDrawing: () => boolean;
  addCurveToLastSegment: () => void;
  setSelectedType: (type: string) => void;
}

export function useEnhancedGenericPointerEvents(
  pointerContext: PointerEventContext,
  storeActions: StoreActions,
  selectionState: SelectionState,
  toolState: ToolState
) {
  const drawingContext = useGenericDrawingContext();

  // Enhanced drawing state for roads
  const roadState = useMemo(
    (): EnhancedGenericDrawingState => ({
      isDrawing: drawingContext.isDrawingRoad,
      tempPoints: drawingContext.tempRoadPoints,
      lastClickTime: drawingContext.lastClickTime,
      selectedType: drawingContext.selectedRoadType,
      snapToGrid: drawingContext.snapToGrid,
      showPreview: true, // Enhanced: always show preview for roads
      showIntersections: true, // Enhanced: always detect intersections
      autoOptimize: true, // Enhanced: auto-optimize connections
    }),
    [
      drawingContext.isDrawingRoad,
      drawingContext.tempRoadPoints,
      drawingContext.lastClickTime,
      drawingContext.selectedRoadType,
      drawingContext.snapToGrid,
    ]
  );

  const roadActions = useMemo(
    (): EnhancedGenericDrawingActions => ({
      setIsDrawing: drawingContext.setIsDrawingRoad,
      setTempPoints: drawingContext.setTempRoadPoints,
      setLastClickTime: drawingContext.setLastClickTime,
      setSelectedType: drawingContext.setSelectedRoadType,
      setSnapToGrid: drawingContext.setSnapToGrid,
      setShowPreview: () => {}, // Roads always show preview
      setShowIntersections: () => {}, // Roads always detect intersections
      setAutoOptimize: () => {}, // Roads always auto-optimize
      addObject: storeActions.addObject,
      updateObject: storeActions.updateObject,
      removeObject: storeActions.removeObject,
      getAllObjects: storeActions.getAllObjects,
      cancelDrawing: drawingContext.cancelRoadDrawing,
      undoLastPoint: drawingContext.undoLastRoadPoint,
      finishDrawing: () => false,
    }),
    [
      drawingContext.setIsDrawingRoad,
      drawingContext.setTempRoadPoints,
      drawingContext.setLastClickTime,
      drawingContext.setSelectedRoadType,
      drawingContext.setSnapToGrid,
      storeActions.addObject,
      storeActions.updateObject,
      storeActions.removeObject,
      storeActions.getAllObjects,
      drawingContext.cancelRoadDrawing,
      drawingContext.undoLastRoadPoint,
    ]
  );

  // Enhanced drawing state for walls
  const wallState = useMemo(
    (): EnhancedGenericDrawingState => ({
      isDrawing: drawingContext.isDrawingWall,
      tempPoints: drawingContext.tempWallPoints,
      lastClickTime: drawingContext.lastClickTime,
      selectedType: drawingContext.selectedWallType,
      snapToGrid: drawingContext.snapToGrid,
      showPreview: true,
      showIntersections: true,
      autoOptimize: false, // Walls don't auto-optimize by default
    }),
    [
      drawingContext.isDrawingWall,
      drawingContext.tempWallPoints,
      drawingContext.lastClickTime,
      drawingContext.selectedWallType,
      drawingContext.snapToGrid,
    ]
  );

  const wallActions = useMemo(
    (): EnhancedGenericDrawingActions => ({
      setIsDrawing: drawingContext.setIsDrawingWall,
      setTempPoints: drawingContext.setTempWallPoints,
      setLastClickTime: drawingContext.setLastClickTime,
      setSelectedType: drawingContext.setSelectedWallType,
      setSnapToGrid: drawingContext.setSnapToGrid,
      setShowPreview: () => {},
      setShowIntersections: () => {},
      setAutoOptimize: () => {},
      addObject: storeActions.addObject,
      updateObject: storeActions.updateObject,
      removeObject: storeActions.removeObject,
      getAllObjects: storeActions.getAllObjects,
      cancelDrawing: drawingContext.cancelWallDrawing,
      undoLastPoint: drawingContext.undoLastWallPoint,
      finishDrawing: () => false,
    }),
    [
      drawingContext.setIsDrawingWall,
      drawingContext.setTempWallPoints,
      drawingContext.setLastClickTime,
      drawingContext.setSelectedWallType,
      drawingContext.setSnapToGrid,
      storeActions.addObject,
      storeActions.updateObject,
      storeActions.removeObject,
      storeActions.getAllObjects,
      drawingContext.cancelWallDrawing,
      drawingContext.undoLastWallPoint,
    ]
  );

  // Enhanced drawing state for water
  const waterState = useMemo(
    (): EnhancedGenericDrawingState => ({
      isDrawing: drawingContext.isDrawingWater,
      tempPoints: drawingContext.tempWaterPoints,
      lastClickTime: drawingContext.lastClickTime,
      selectedType: drawingContext.selectedWaterType,
      snapToGrid: drawingContext.snapToGrid,
      showPreview: true,
      showIntersections: false, // Water typically doesn't need intersection detection
      autoOptimize: false,
    }),
    [
      drawingContext.isDrawingWater,
      drawingContext.tempWaterPoints,
      drawingContext.lastClickTime,
      drawingContext.selectedWaterType,
      drawingContext.snapToGrid,
    ]
  );

  const waterActions = useMemo(
    (): EnhancedGenericDrawingActions => ({
      setIsDrawing: drawingContext.setIsDrawingWater,
      setTempPoints: drawingContext.setTempWaterPoints,
      setLastClickTime: drawingContext.setLastClickTime,
      setSelectedType: drawingContext.setSelectedWaterType,
      setSnapToGrid: drawingContext.setSnapToGrid,
      setShowPreview: () => {},
      setShowIntersections: () => {},
      setAutoOptimize: () => {},
      addObject: storeActions.addObject,
      updateObject: storeActions.updateObject,
      removeObject: storeActions.removeObject,
      getAllObjects: storeActions.getAllObjects,
      cancelDrawing: drawingContext.cancelWaterDrawing,
      undoLastPoint: drawingContext.undoLastWaterPoint,
      finishDrawing: () => false,
    }),
    [
      drawingContext.setIsDrawingWater,
      drawingContext.setTempWaterPoints,
      drawingContext.setLastClickTime,
      drawingContext.setSelectedWaterType,
      drawingContext.setSnapToGrid,
      storeActions.addObject,
      storeActions.updateObject,
      storeActions.removeObject,
      storeActions.getAllObjects,
      drawingContext.cancelWaterDrawing,
      drawingContext.undoLastWaterPoint,
    ]
  );

  // Initialize enhanced drawing systems
  const roadDrawing = useEnhancedGenericDrawing(
    roadState,
    roadActions,
    enhancedRoadDrawingBehavior,
    pointerContext.gridSize,
    storeActions.getAllObjects?.()
  );

  const wallDrawing = useEnhancedGenericDrawing(
    wallState,
    wallActions,
    enhancedWallDrawingBehavior,
    pointerContext.gridSize,
    storeActions.getAllObjects?.()
  );

  const waterDrawing = useEnhancedGenericDrawing(
    waterState,
    waterActions,
    enhancedWaterDrawingBehavior,
    pointerContext.gridSize,
    storeActions.getAllObjects?.()
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

  // Enhanced selection handler
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
          console.log("🎯 Enhanced selection:", {
            objectId: targetObject.userData.objectId,
            objectType: targetObject.userData.objectType || "unknown",
            position: intersects[0].point,
            hasIntersections: targetObject.userData.intersections || 0,
          });
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

  // Enhanced pointer down handler
  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      console.log(`🛠️ Enhanced ${toolState.selectedTool} tool activated`);

      // Handle selection tool
      if (toolState.selectedTool === "select") {
        handleSelection(event);
        return;
      }

      // Get world intersection point
      const worldPosition = getWorldIntersection(event);
      if (!worldPosition) return;

      const intersect = { x: worldPosition.x, z: worldPosition.z };

      // Handle enhanced drawing tools
      switch (toolState.selectedTool) {
        case "road":
          console.log("🛣️ Enhanced road drawing:", {
            variant: roadDrawing.selectedType,
            showPreview: roadDrawing.showPreview,
            showIntersections: roadDrawing.showIntersections,
            currentIntersections: roadDrawing.getIntersections().length,
            autoOptimize: roadDrawing.autoOptimize,
          });
          roadDrawing.handleDrawingClick(event, intersect);
          return;

        case "water":
          console.log("💧 Enhanced water drawing:", {
            variant: waterDrawing.selectedType,
            showPreview: waterDrawing.showPreview,
            selectedType: waterDrawing.selectedType,
          });
          waterDrawing.handleDrawingClick(event, intersect);
          return;

        case "wall":
          console.log("🧱 Enhanced wall drawing:", {
            variant: wallDrawing.selectedType,
            showPreview: wallDrawing.showPreview,
            showIntersections: wallDrawing.showIntersections,
            currentIntersections: wallDrawing.getIntersections().length,
          });
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

        console.log(
          `✨ Creating enhanced ${toolState.selectedTool}:`,
          objectData
        );
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

  // Enhanced keyboard handler
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
          storeActions.removeObject?.(selectionState.selectedId);
          storeActions.setSelectedId(null);
          return;
        }
      }

      // Enhanced tool shortcuts with emojis in logs
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
        const toolEmojis = {
          select: "🎯",
          road: "🛣️",
          building: "🏢",
          tree: "🌳",
          wall: "🧱",
          water: "💧",
        };
        console.log(
          `🔧 Enhanced tool switched to: ${toolEmojis[newTool]} ${newTool}`
        );
        return;
      }

      // C - add curve to last road segment
      if (event.key.toLowerCase() === "c" && roadDrawing.isDrawing) {
        event.preventDefault();
        roadDrawing.addCurveToLastSegment();
        console.log("🔄 Added curve to road segment");
        return;
      }

      // Enhanced feature toggles for active drawing
      if (event.key.toLowerCase() === "p") {
        // Toggle preview
        if (roadDrawing.isDrawing) {
          event.preventDefault();
          roadDrawing.togglePreview();
          console.log("🔄 Toggled road preview:", roadDrawing.showPreview);
        } else if (wallDrawing.isDrawing) {
          event.preventDefault();
          wallDrawing.togglePreview();
          console.log("🔄 Toggled wall preview:", wallDrawing.showPreview);
        } else if (waterDrawing.isDrawing) {
          event.preventDefault();
          waterDrawing.togglePreview();
          console.log("🔄 Toggled water preview:", waterDrawing.showPreview);
        }
        return;
      }

      if (event.key.toLowerCase() === "i") {
        // Toggle intersections
        if (roadDrawing.isDrawing) {
          event.preventDefault();
          roadDrawing.toggleIntersections();
          console.log(
            "🔄 Toggled road intersections:",
            roadDrawing.showIntersections
          );
        } else if (wallDrawing.isDrawing) {
          event.preventDefault();
          wallDrawing.toggleIntersections();
          console.log(
            "🔄 Toggled wall intersections:",
            wallDrawing.showIntersections
          );
        }
        return;
      }

      if (event.key.toLowerCase() === "o") {
        // Toggle auto-optimize
        if (roadDrawing.isDrawing) {
          event.preventDefault();
          roadDrawing.toggleAutoOptimize();
          console.log(
            "🔄 Toggled road auto-optimize:",
            roadDrawing.autoOptimize
          );
        } else if (wallDrawing.isDrawing) {
          event.preventDefault();
          wallDrawing.toggleAutoOptimize();
          console.log(
            "🔄 Toggled wall auto-optimize:",
            wallDrawing.autoOptimize
          );
        }
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

    // Enhanced drawing interfaces
    roadDrawing: {
      isDrawing: roadDrawing.isDrawing,
      tempPoints: roadDrawing.tempPoints,
      selectedType: roadDrawing.selectedType,
      showPreview: roadDrawing.showPreview,
      showIntersections: roadDrawing.showIntersections,
      autoOptimize: roadDrawing.autoOptimize,
      getPreview: roadDrawing.getPreview,
      getDrawingInstructions: roadDrawing.getDrawingInstructions,
      getVisualConfig: roadDrawing.getVisualConfig,
      getCurrentGeometry: roadDrawing.getCurrentGeometry,
      getIntersections: roadDrawing.getIntersections,
      getOptimizedObjects: roadDrawing.getOptimizedObjects,
      canIntersectWith: roadDrawing.canIntersectWith,
      getIntersectionRadius: roadDrawing.getIntersectionRadius,
      togglePreview: roadDrawing.togglePreview,
      toggleIntersections: roadDrawing.toggleIntersections,
      toggleAutoOptimize: roadDrawing.toggleAutoOptimize,
      handleDrawingClick: roadDrawing.handleDrawingClick,
      cancelDrawing: roadDrawing.cancelDrawing,
      undoLastPoint: roadDrawing.undoLastPoint,
      finishDrawing: roadDrawing.finishDrawing,
      addCurveToLastSegment: roadDrawing.addCurveToLastSegment,
      setSelectedType: roadDrawing.setSelectedType,
    } as EnhancedDrawingInterface,

    waterDrawing: {
      isDrawing: waterDrawing.isDrawing,
      tempPoints: waterDrawing.tempPoints,
      selectedType: waterDrawing.selectedType,
      showPreview: waterDrawing.showPreview,
      showIntersections: waterDrawing.showIntersections,
      autoOptimize: waterDrawing.autoOptimize,
      getPreview: waterDrawing.getPreview,
      getDrawingInstructions: waterDrawing.getDrawingInstructions,
      getVisualConfig: waterDrawing.getVisualConfig,
      getCurrentGeometry: waterDrawing.getCurrentGeometry,
      getIntersections: waterDrawing.getIntersections,
      getOptimizedObjects: waterDrawing.getOptimizedObjects,
      canIntersectWith: waterDrawing.canIntersectWith,
      getIntersectionRadius: waterDrawing.getIntersectionRadius,
      togglePreview: waterDrawing.togglePreview,
      toggleIntersections: waterDrawing.toggleIntersections,
      toggleAutoOptimize: waterDrawing.toggleAutoOptimize,
      handleDrawingClick: waterDrawing.handleDrawingClick,
      cancelDrawing: waterDrawing.cancelDrawing,
      undoLastPoint: waterDrawing.undoLastPoint,
      finishDrawing: waterDrawing.finishDrawing,
      addCurveToLastSegment: waterDrawing.addCurveToLastSegment,
      setSelectedType: waterDrawing.setSelectedType,
    } as EnhancedDrawingInterface,

    wallDrawing: {
      isDrawing: wallDrawing.isDrawing,
      tempPoints: wallDrawing.tempPoints,
      selectedType: wallDrawing.selectedType,
      showPreview: wallDrawing.showPreview,
      showIntersections: wallDrawing.showIntersections,
      autoOptimize: wallDrawing.autoOptimize,
      getPreview: wallDrawing.getPreview,
      getDrawingInstructions: wallDrawing.getDrawingInstructions,
      getVisualConfig: wallDrawing.getVisualConfig,
      getCurrentGeometry: wallDrawing.getCurrentGeometry,
      getIntersections: wallDrawing.getIntersections,
      getOptimizedObjects: wallDrawing.getOptimizedObjects,
      canIntersectWith: wallDrawing.canIntersectWith,
      getIntersectionRadius: wallDrawing.getIntersectionRadius,
      togglePreview: wallDrawing.togglePreview,
      toggleIntersections: wallDrawing.toggleIntersections,
      toggleAutoOptimize: wallDrawing.toggleAutoOptimize,
      handleDrawingClick: wallDrawing.handleDrawingClick,
      cancelDrawing: wallDrawing.cancelDrawing,
      undoLastPoint: wallDrawing.undoLastPoint,
      finishDrawing: wallDrawing.finishDrawing,
      addCurveToLastSegment: wallDrawing.addCurveToLastSegment,
      setSelectedType: wallDrawing.setSelectedType,
    } as EnhancedDrawingInterface,
  };
}
