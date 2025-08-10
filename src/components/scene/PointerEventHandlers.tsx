import * as THREE from "three";

interface PointerEventHandlersProps {
  canvas: HTMLCanvasElement;
  camera: THREE.Camera;
  scene: THREE.Scene;
  addObject: (object: unknown) => void;
  setSelectedId: (id: string | null) => void;
  removeObject: (id: string) => void;
  gridSize: number;
  snap: boolean;
  objects: {
    id: string;
    type: string;
    position: [number, number, number];
    scale: [number, number, number];
  }[];
  updateObject: (id: string, updates: unknown) => void;
  selectedTool: string;
  setSelectedTool: (tool: string) => void;
  tempRoadPoints: [number, number][];
  setTempRoadPoints: (points: [number, number][]) => void;
  setIsDrawingRoad: (isDrawing: boolean) => void;
  setLastClickTime: (time: number | null) => void;
  lastClickTime: number | null;
  selectedId: string | null;
}

export function usePointerEventHandlers({
  canvas,
  camera,
  scene,
  addObject,
  setSelectedId,
  removeObject,
  gridSize,
  snap,
  objects,
  selectedTool,
  tempRoadPoints,
  setTempRoadPoints,
  setIsDrawingRoad,
  setLastClickTime,
  lastClickTime,
  selectedId,
}: PointerEventHandlersProps) {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  function getIntersection(evt: PointerEvent) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const intersect = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersect);
    return intersect;
  }

  function snapVec(v: THREE.Vector3) {
    if (!snap) return v;
    const s = gridSize;
    v.x = Math.round(v.x / s) * s;
    v.z = Math.round(v.z / s) * s;
    v.y = Math.round(v.y / s) * s;
    return v;
  }

  function checkCollision(
    newPos: [number, number, number],
    newType: string,
    newScale: [number, number, number],
    excludeId?: string
  ): boolean {
    const collisionDistance = 1.5; // Minimum distance between objects

    for (const obj of objects) {
      if (obj.id === excludeId) continue;

      const distance = Math.sqrt(
        Math.pow(newPos[0] - obj.position[0], 2) +
          Math.pow(newPos[2] - obj.position[2], 2)
      );

      // Calculate object sizes based on type and scale
      let obj1Size = collisionDistance;
      let obj2Size = collisionDistance;

      // Adjust sizes based on object types
      switch (newType) {
        case "building":
          obj1Size = 2 * Math.max(newScale[0], newScale[2]);
          break;
        case "tree":
          obj1Size = 1 * Math.max(newScale[0], newScale[2]);
          break;
        case "wall":
          obj1Size = Math.max(newScale[0], newScale[2]) * 3;
          break;
        case "water":
          obj1Size = (newScale[0] + newScale[2]) * 2;
          break;
      }

      switch (obj.type) {
        case "building":
          obj2Size = 2 * Math.max(obj.scale[0], obj.scale[2]);
          break;
        case "tree":
          obj2Size = 1 * Math.max(obj.scale[0], obj.scale[2]);
          break;
        case "wall":
          obj2Size = Math.max(obj.scale[0], obj.scale[2]) * 3;
          break;
        case "water":
          obj2Size = (obj.scale[0] + obj.scale[2]) * 2;
          break;
      }

      if (distance < (obj1Size + obj2Size) / 2) {
        return true; // Collision detected
      }
    }

    return false; // No collision
  }

  const handleDown = (e: PointerEvent) => {
    // double-click detection for finishing road
    const now = Date.now();
    const double = lastClickTime && now - lastClickTime < 350;

    const intersect = getIntersection(e);
    if (!intersect) return;
    snapVec(intersect);

    // tool selection is done by Sidebar palette (it creates objects). For road drawing tool, we'll begin drawing if user pressed a modifier (Shift)
    // But for a simpler UX: if user holds Alt while clicking, start road drawing; or if a temporary road exists, keep drawing.
    // For this implementation, we use CTRL to start/continue drawing a road.
    if (e.ctrlKey) {
      // add point to temp
      setIsDrawingRoad(true);
      setTempRoadPoints([
        ...tempRoadPoints,
        [
          Math.round(intersect.x * 100) / 100,
          Math.round(intersect.z * 100) / 100,
        ] as [number, number],
      ]);
      if (double) {
        // finish
        const pts = [
          ...tempRoadPoints,
          [
            Math.round(intersect.x * 100) / 100,
            Math.round(intersect.z * 100) / 100,
          ],
        ];
        if (pts.length >= 2) {
          addObject({
            type: "road",
            points: pts as [number, number][],
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            width: 1,
          });
        }
        setTempRoadPoints([]);
        setIsDrawingRoad(false);
      }
      setLastClickTime(now);
      return;
    }

    // If we have a selected tool, place a new object (unless it's select mode)
    if (selectedTool && selectedTool !== "select") {
      const newPosition: [number, number, number] = [
        intersect.x,
        0,
        intersect.z,
      ];
      const newScale: [number, number, number] = [1, 1, 1];

      // Check for collision before placing object
      if (checkCollision(newPosition, selectedTool, newScale)) {
        // Don't place object if collision detected
        return;
      }

      const newObject = {
        type: selectedTool,
        position: newPosition,
        rotation: [0, 0, 0],
        scale: newScale,
        ...(selectedTool === "building" && {
          floors: 1,
          color: "#d9d9d9",
          roofType: "gabled",
          roofColor: "#666666",
          gridWidth: 2,
          gridDepth: 2,
          gridHeight: 1,
        }),
        ...(selectedTool === "tree" && {
          gridWidth: 1,
          gridDepth: 1,
          gridHeight: 1,
        }),
        ...(selectedTool === "wall" && {
          length: 2,
          height: 1,
          gridWidth: 2,
          gridDepth: 1,
          gridHeight: 1,
        }),
        ...(selectedTool === "road" && {
          points: [
            [0, 0],
            [2, 0],
          ],
          width: 1,
          gridWidth: 1,
          gridDepth: 1,
          gridHeight: 0.1,
        }),
        ...(selectedTool === "water" && {
          radius: 2,
          gridWidth: 2,
          gridDepth: 2,
          gridHeight: 0.1,
        }),
      };
      addObject(newObject);
      // Don't reset tool - this enables paint mode
      return;
    }

    // otherwise, place object if selected in Sidebar by adding at 0,0 or place new object
    // We'll detect clicks on objects for selection:
    // Use raycasting for more accurate object selection
    const selectionRaycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Convert mouse position to normalized device coordinates
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    selectionRaycaster.setFromCamera(mouse, camera);

    // Find all objects with userData.objectId
    const objectsWithId: THREE.Object3D[] = [];
    scene.traverse((child) => {
      if ((child as { userData?: { objectId?: string } }).userData?.objectId) {
        objectsWithId.push(child);
      }
    });

    // Perform raycasting
    const intersects = selectionRaycaster.intersectObjects(objectsWithId, true);

    if (intersects.length > 0) {
      // Get the closest object's ID
      let selectedObject: THREE.Object3D | null = intersects[0].object;
      // Traverse up to find the parent with userData.objectId
      while (
        selectedObject &&
        !(selectedObject as { userData?: { objectId?: string } }).userData
          ?.objectId
      ) {
        selectedObject = selectedObject.parent;
      }

      if (
        selectedObject &&
        (selectedObject as { userData?: { objectId?: string } }).userData
          ?.objectId
      ) {
        const id = selectedObject.userData.objectId as string;
        setSelectedId(id);
        return;
      }
    }

    // Check for right-click to delete selected object
    if (e.button === 2 && selectedId) {
      // Right mouse button
      removeObject(selectedId);
      setSelectedId(null);
      return;
    }

    // nothing selected -> deselect
    setSelectedId(null);
  };

  const handleContextMenu = (e: Event) => {
    e.preventDefault();
  };

  return {
    handleDown,
    handleContextMenu,
    getIntersection,
    snapVec,
    checkCollision,
  };
}
