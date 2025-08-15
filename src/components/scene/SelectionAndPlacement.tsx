/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import { useSceneStore } from "@/store/useSceneStore";
import { useTool } from "@/contexts/ToolContext";
import { useGenericDrawingContext } from "@/contexts/GenericDrawingContext";
import * as THREE from "three";

export function SelectionAndPlacement() {
  const { camera, gl, scene } = useThree();

  // Store hooks
  const objects = useSceneStore((s) => s.objects);
  const selectedId = useSceneStore((s) => s.selectedId);
  const addObject = useSceneStore((s) => s.addObject);
  const setSelectedId = useSceneStore((s) => s.setSelectedId);
  const removeObject = useSceneStore((s) => s.removeObject);
  const snapEnabled = useSceneStore((s) => s.snapEnabled);
  const gridSize = useSceneStore((s) => s.gridSize);

  // Tool and drawing contexts
  const { selectedTool, setSelectedTool } = useTool();
  const drawingContext = useGenericDrawingContext();

  // Get world intersection point for object placement
  const getWorldIntersection = useCallback(
    (event: PointerEvent): THREE.Vector3 | null => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersectionPoint = new THREE.Vector3();
      const didIntersect = raycaster.ray.intersectPlane(
        groundPlane,
        intersectionPoint
      );

      return didIntersect ? intersectionPoint : null;
    },
    [camera, gl.domElement]
  );

  // Handle object selection
  const handleSelection = useCallback(
    (event: PointerEvent): boolean => {
      const rect = gl.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      // Find all objects with userData.objectId
      const selectableObjects: THREE.Object3D[] = [];
      scene.traverse((child) => {
        if (child.userData?.objectId) {
          selectableObjects.push(child);
        }
      });

      const intersects = raycaster.intersectObjects(selectableObjects, true);

      if (intersects.length > 0) {
        let targetObject = intersects[0].object;

        // Traverse up to find the object with userData.objectId
        while (targetObject && !targetObject.userData?.objectId) {
          targetObject = targetObject.parent as THREE.Object3D;
        }

        if (targetObject?.userData?.objectId) {
          setSelectedId(targetObject.userData.objectId);
          return true;
        }
      }

      setSelectedId(null);
      return false;
    },
    [camera, gl.domElement, scene, setSelectedId]
  );

  // Create object templates
  const createObject = useCallback(
    (type: string, position: [number, number, number]) => {
      const generateId = () =>
        `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const baseObject = {
        id: generateId(),
        type: type as any,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${
          objects.length + 1
        }`,
        position,
        rotation: [0, 0, 0] as [number, number, number],
        scale: [1, 1, 1] as [number, number, number],
      };

      switch (type) {
        case "building":
          return {
            ...baseObject,
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
          };

        case "tree":
          return {
            ...baseObject,
            gridWidth: 1,
            gridDepth: 1,
            gridHeight: 3,
            foliageColor: "#228B22",
            treeType: "oak",
          };

        case "wall":
          return {
            ...baseObject,
            length: 3,
            height: 2,
            thickness: 0.2,
            color: "#CCCCCC",
            gridWidth: 2,
            gridDepth: 1,
            gridHeight: 1,
          };

        case "water":
          return {
            ...baseObject,
            shape: "circular" as const,
            radius: 2,
            color: "#4FC3F7",
            transparency: 0.8,
            gridWidth: 2,
            gridDepth: 2,
            gridHeight: 0.1,
          };

        default:
          return baseObject;
      }
    },
    [objects.length]
  );

  // Handle road drawing
  const handleRoadDrawing = useCallback(
    (event: PointerEvent, intersect: { x: number; z: number }) => {
      const point = { x: intersect.x, z: intersect.z };

      if (!drawingContext.isDrawingRoad) {
        // Start drawing
        drawingContext.setIsDrawingRoad(true);
        drawingContext.setTempRoadPoints([point]);
      } else {
        // Add point to existing road
        const newPoints = [...drawingContext.tempRoadPoints, point];
        drawingContext.setTempRoadPoints(newPoints);
      }
    },
    [drawingContext]
  );

  // Handle double-click to finish road
  const handleDoubleClick = useCallback(() => {
    if (
      drawingContext.isDrawingRoad &&
      drawingContext.tempRoadPoints.length >= 2
    ) {
      // Create road object
      const roadObject = {
        id: `road-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "road" as const,
        name: `Road ${objects.length + 1}`,
        position: [0, 0, 0] as [number, number, number],
        rotation: [0, 0, 0] as [number, number, number],
        scale: [1, 1, 1] as [number, number, number],
        points: drawingContext.tempRoadPoints,
        roadType: drawingContext.selectedRoadType as
          | "residential"
          | "highway"
          | "dirt"
          | "pedestrian",
        width: drawingContext.roadWidth,
        color: "#404040",
        elevation: 0,
        thickness: 0.1,
      };

      addObject(roadObject);

      // Reset drawing state
      drawingContext.setIsDrawingRoad(false);
      drawingContext.setTempRoadPoints([]);
    }
  }, [drawingContext, objects.length, addObject]);

  // Main pointer event handler
  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
      // Handle selection tool
      if (selectedTool === "select") {
        handleSelection(event);
        return;
      }

      // Get world position for object placement
      const worldPosition = getWorldIntersection(event);
      if (!worldPosition) return;

      const intersect = { x: worldPosition.x, z: worldPosition.z };

      // Apply grid snapping
      if (snapEnabled) {
        intersect.x = Math.round(intersect.x / gridSize) * gridSize;
        intersect.z = Math.round(intersect.z / gridSize) * gridSize;
      }

      // Handle drawing tools
      if (selectedTool === "road") {
        handleRoadDrawing(event, intersect);
        return;
      }

      // Handle direct placement tools
      if (
        selectedTool &&
        ["building", "tree", "wall", "water"].includes(selectedTool)
      ) {
        const position: [number, number, number] = [
          intersect.x,
          0,
          intersect.z,
        ];
        const objectData = createObject(selectedTool, position);
        addObject(objectData);
      }
    },
    [
      selectedTool,
      handleSelection,
      getWorldIntersection,
      snapEnabled,
      gridSize,
      handleRoadDrawing,
      createObject,
      addObject,
    ]
  );

  // Keyboard event handler
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Prevent handling if input is focused
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.hasAttribute("contenteditable"));

      if (isInputFocused) return;

      // Escape - cancel drawing or deselect
      if (event.key === "Escape") {
        if (drawingContext.isDrawingRoad) {
          drawingContext.cancelRoadDrawing();
        } else {
          setSelectedId(null);
        }
        return;
      }

      // Enter - finish road drawing
      if (event.key === "Enter" && drawingContext.isDrawingRoad) {
        handleDoubleClick();
        return;
      }

      // Delete key - remove selected object
      if (event.key === "Delete" && selectedId) {
        removeObject(selectedId);
        setSelectedId(null);
        return;
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
        setSelectedTool(toolShortcuts[event.key.toLowerCase()] as any);
        return;
      }
    },
    [
      drawingContext,
      selectedId,
      removeObject,
      setSelectedId,
      setSelectedTool,
      handleDoubleClick,
    ]
  );

  // Set up event listeners
  useEffect(() => {
    const canvas = gl.domElement;
    if (!canvas) return;

    canvas.tabIndex = 0;
    canvas.style.outline = "none";

    const handlePointer = (e: PointerEvent) => handlePointerDown(e);
    const handleContext = (e: Event) => e.preventDefault();
    const handleDblClick = () => handleDoubleClick();

    canvas.addEventListener("pointerdown", handlePointer);
    canvas.addEventListener("contextmenu", handleContext);
    canvas.addEventListener("dblclick", handleDblClick);
    canvas.focus();

    return () => {
      canvas.removeEventListener("pointerdown", handlePointer);
      canvas.removeEventListener("contextmenu", handleContext);
      canvas.removeEventListener("dblclick", handleDblClick);
    };
  }, [gl, handlePointerDown, handleDoubleClick]);

  // Handle window-level keyboard events
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Render road preview during drawing
  return (
    <>
      {drawingContext.isDrawingRoad &&
        drawingContext.tempRoadPoints.length > 0 && (
          <group>
            {/* Render points */}
            {drawingContext.tempRoadPoints.map((point, index) => (
              <mesh key={index} position={[point.x, 0.1, point.z]}>
                <sphereGeometry args={[0.1]} />
                <meshStandardMaterial color="#ffff00" />
              </mesh>
            ))}

            {/* Render road segments */}
            {drawingContext.tempRoadPoints.length > 1 &&
              drawingContext.tempRoadPoints.map((point, index) => {
                if (index === drawingContext.tempRoadPoints.length - 1)
                  return null;
                const nextPoint = drawingContext.tempRoadPoints[index + 1];
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
                    key={`segment-${index}`}
                    position={[centerX, 0.05, centerZ]}
                    rotation={[0, angle, 0]}
                  >
                    <boxGeometry
                      args={[length, 0.1, drawingContext.roadWidth]}
                    />
                    <meshStandardMaterial
                      color="#404040"
                      transparent
                      opacity={0.7}
                    />
                  </mesh>
                );
              })}
          </group>
        )}
    </>
  );
}
