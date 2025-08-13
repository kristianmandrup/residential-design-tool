import { useCallback } from 'react';
import * as THREE from 'three';
import { useRoadDrawing } from '@/contexts/RoadDrawingContext';
import { useRoadDrawingLogic } from './roadDrawingLogic';
import { PointerEventContext, StoreActions, SelectionState, ToolState } from './types';

export function usePointerEventSystem(
  pointerContext: PointerEventContext,
  storeActions: StoreActions,
  selectionState: SelectionState,
  toolState: ToolState
) {
  const roadDrawing = useRoadDrawing();
  
  const roadLogic = useRoadDrawingLogic({
    isDrawingRoad: roadDrawing.isDrawingRoad,
    tempRoadPoints: roadDrawing.tempRoadPoints,
    lastClickTime: roadDrawing.lastClickTime,
    selectedRoadType: roadDrawing.selectedRoadType,
    roadWidth: roadDrawing.roadWidth,
    snapToGrid: roadDrawing.snapToGrid,
    gridSize: pointerContext.gridSize,
    setIsDrawingRoad: roadDrawing.setIsDrawingRoad,
    setTempRoadPoints: roadDrawing.setTempRoadPoints,
    setLastClickTime: roadDrawing.setLastClickTime,
    addObject: storeActions.addObject,
  });

  const generateUniqueId = (type: string) => {
    return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const snapToGrid = (x: number, z: number) => {
    if (pointerContext.snap) {
      return {
        x: Math.round(x / pointerContext.gridSize) * pointerContext.gridSize,
        z: Math.round(z / pointerContext.gridSize) * pointerContext.gridSize,
      };
    }
    return { x, z };
  };

  const handlePointerDown = useCallback((event: PointerEvent) => {
    const rect = pointerContext.canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), pointerContext.camera);

    // Check for object intersections first (for selection)
    if (toolState.selectedTool === "select") {
      const intersects = raycaster.intersectObjects(pointerContext.scene.children, true);
      
      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        
        // Find the object with userData.objectId
        let targetObject = intersectedObject;
        while (targetObject && !targetObject.userData?.objectId) {
          targetObject = targetObject.parent as THREE.Object3D;
        }

        if (targetObject?.userData?.objectId) {
          console.log("🎯 Selected object:", targetObject.userData.objectId);
          storeActions.setSelectedId(targetObject.userData.objectId);
          return;
        }
      }
      
      // If no object was hit, deselect
      storeActions.setSelectedId(null);
      return;
    }

    // Create a ground plane for intersection
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectionPoint = new THREE.Vector3();
    const didIntersect = raycaster.ray.intersectPlane(groundPlane, intersectionPoint);

    if (didIntersect && intersectionPoint) {
      const snapped = snapToGrid(intersectionPoint.x, intersectionPoint.z);
      const intersect = { x: snapped.x, z: snapped.z };

      console.log(`🛠️ ${toolState.selectedTool} tool clicked at:`, intersect);

      // Handle road drawing
      if (toolState.selectedTool === "road") {
        roadLogic.handleRoadDrawing(event, intersect);
        return;
      }

      // Handle building placement
      if (toolState.selectedTool === "building") {
        const buildingId = generateUniqueId("building");
        const buildingObject = {
          id: buildingId,
          type: "building" as const,
          position: [intersect.x, 0, intersect.z] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          scale: [1, 1, 1] as [number, number, number],
          floors: 3,
          color: "#8B4513",
          roofType: "flat" as const,
          roofColor: "#666666",
          gridWidth: 2,
          gridDepth: 2,
          gridHeight: 3,
          floorProperties: Array(3).fill(null).map(() => ({
            wallColor: "#8B4513",
            windowsEnabled: true,
          })),
          windowColor: "#87CEEB",
        };
        
        console.log("🏠 Creating building:", buildingObject);
        storeActions.addObject(buildingObject);
        return;
      }

      // Handle tree placement
      if (toolState.selectedTool === "tree") {
        const treeId = generateUniqueId("tree");
        const treeObject = {
          id: treeId,
          type: "tree" as const,
          position: [intersect.x, 0, intersect.z] as [number, number, number],
          rotation: [0, Math.random() * Math.PI * 2, 0] as [number, number, number], // Random rotation
          scale: [1, 1, 1] as [number, number, number],
          gridWidth: 1,
          gridDepth: 1,
          gridHeight: 3,
          foliageColor: "#228B22",
          treeType: "oak",
        };
        
        console.log("🌳 Creating tree:", treeObject);
        storeActions.addObject(treeObject);
        return;
      }

      // Handle wall placement
      if (toolState.selectedTool === "wall") {
        const wallId = generateUniqueId("wall");
        const wallObject = {
          id: wallId,
          type: "wall" as const,
          position: [intersect.x, 0, intersect.z] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          scale: [1, 1, 1] as [number, number, number],
          gridWidth: 4,
          gridDepth: 0.2,
          gridHeight: 2,
          color: "#CCCCCC",
          thickness: 0.2,
          height: 2,
          length: 4,
        };
        
        console.log("🧱 Creating wall:", wallObject);
        storeActions.addObject(wallObject);
        return;
      }

      // Handle water placement
      if (toolState.selectedTool === "water") {
        const waterId = generateUniqueId("water");
        const waterObject = {
          id: waterId,
          type: "water" as const,
          position: [intersect.x, 0, intersect.z] as [number, number, number],
          rotation: [0, 0, 0] as [number, number, number],
          scale: [1, 1, 1] as [number, number, number],
          gridWidth: 3,
          gridDepth: 3,
          gridHeight: 0.2,
          width: 3,
          depth: 3,
          waveHeight: 0.1,
          transparency: 0.7,
          shape: "circular" as const,
        };
        
        console.log("💧 Creating water:", waterObject);
        storeActions.addObject(waterObject);
        return;
      }
    }
  }, [
    pointerContext.canvas,
    pointerContext.camera,
    pointerContext.scene,
    pointerContext.snap,
    pointerContext.gridSize,
    toolState.selectedTool,
    roadLogic,
    storeActions,
  ]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
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
    if (event.key === "Enter" && roadDrawing.isDrawingRoad && roadDrawing.tempRoadPoints.length >= 2) {
      event.preventDefault();
      console.log("⏎ Finishing road with Enter key");
      
      // Simulate a double-click to finish the road
      const fakeEvent = new PointerEvent('pointerdown', {
        pointerId: 1,
        isPrimary: true,
      });
      
      // Use the last point position
      const lastPoint = roadDrawing.tempRoadPoints[roadDrawing.tempRoadPoints.length - 1];
      roadLogic.handleRoadDrawing(fakeEvent, { x: lastPoint.x, z: lastPoint.z });
      
      return;
    }

    // Ctrl+U - undo last road point
    if (event.ctrlKey && event.key.toLowerCase() === "u" && roadDrawing.isDrawingRoad) {
      event.preventDefault();
      roadDrawing.undoLastRoadPoint();
      return;
    }

    // Delete key - remove selected object
    if (event.key === "Delete" || event.key === "Backspace") {
      if (selectionState.selectedId) {
        event.preventDefault();
        console.log("🗑️ Deleting object:", selectionState.selectedId);
        storeActions.removeObject(selectionState.selectedId);
        return;
      }
    }

    // Tool shortcuts
    const toolShortcuts: Record<string, string> = {
      's': 'select',
      'r': 'road',
      'b': 'building',
      't': 'tree',
      'w': 'wall',
      'a': 'water', // A for water (W is wall)
    };

    if (toolShortcuts[event.key.toLowerCase()]) {
      event.preventDefault();
      const newTool = toolShortcuts[event.key.toLowerCase()];
      console.log(`🛠️ Switching to ${newTool} tool`);
      toolState.setSelectedTool(newTool);
      return;
    }
  }, [roadDrawing, selectionState, storeActions, toolState, roadLogic]);

  return {
    handlePointerDown,
    handleKeyDown,
    cancelRoadDrawing: roadDrawing.cancelRoadDrawing,
    undoLastRoadPoint: roadDrawing.undoLastRoadPoint,
    getRoadPreview: roadLogic.getRoadPreview,
  };
}

