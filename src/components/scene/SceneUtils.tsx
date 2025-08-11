import * as THREE from "three";

export interface SceneObject {
  id: string;
  type: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  gridWidth?: number;
  gridDepth?: number;
  gridHeight?: number;
  [key: string]: unknown;
}

export function getIntersection(
  evt: PointerEvent,
  canvas: HTMLCanvasElement,
  camera: THREE.Camera
): THREE.Vector3 | null {
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  const rect = canvas.getBoundingClientRect();
  pointer.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const intersect = new THREE.Vector3();
  raycaster.ray.intersectPlane(plane, intersect);
  return intersect;
}

export function snapVec(
  v: THREE.Vector3,
  gridSize: number,
  snap: boolean
): THREE.Vector3 {
  if (!snap) return v;
  const s = gridSize;
  v.x = Math.round(v.x / s) * s;
  v.z = Math.round(v.z / s) * s;
  v.y = Math.round(v.y / s) * s;
  return v;
}

export function checkCollision(
  newPos: [number, number, number],
  newType: string,
  newGridWidth: number,
  newGridDepth: number,
  objects: SceneObject[],
  gridSize: number,
  snap: boolean,
  excludeId?: string
): boolean {
  // Convert new position to grid coordinates
  const gridX = snap ? Math.round(newPos[0] / gridSize) : newPos[0] / gridSize;
  const gridZ = snap ? Math.round(newPos[2] / gridSize) : newPos[2] / gridSize;

  // Calculate the grid cells occupied by the new object
  const newGridCells: [number, number][] = [];
  const halfWidth = (newGridWidth || 1) / 2;
  const halfDepth = (newGridDepth || 1) / 2;
  // Use Math.ceil to ensure we capture all grid cells for integer dimensions
  const startX = Math.floor(gridX - halfWidth + 0.5);
  const endX = Math.floor(gridX + halfWidth - 0.5);
  const startZ = Math.floor(gridZ - halfDepth + 0.5);
  const endZ = Math.floor(gridZ + halfDepth - 0.5);

  for (let x = startX; x <= endX; x++) {
    for (let z = startZ; z <= endZ; z++) {
      newGridCells.push([x, z]);
    }
  }

  // Check for overlap with existing objects
  for (const obj of objects) {
    if (obj.id === excludeId) continue;

    const objGridX = snap
      ? Math.round(obj.position[0] / gridSize)
      : obj.position[0] / gridSize;
    const objGridZ = snap
      ? Math.round(obj.position[2] / gridSize)
      : obj.position[2] / gridSize;

    const objHalfWidth = (obj.gridWidth || 1) / 2;
    const objHalfDepth = (obj.gridDepth || 1) / 2;
    const objGridCells: [number, number][] = [];
    // Use the same logic as for the new object
    const objStartX = Math.floor(objGridX - objHalfWidth + 0.5);
    const objEndX = Math.floor(objGridX + objHalfWidth - 0.5);
    const objStartZ = Math.floor(objGridZ - objHalfDepth + 0.5);
    const objEndZ = Math.floor(objGridZ + objHalfDepth - 0.5);

    for (let x = objStartX; x <= objEndX; x++) {
      for (let z = objStartZ; z <= objEndZ; z++) {
        objGridCells.push([x, z]);
      }
    }

    // Check if any grid cells overlap
    for (const newCell of newGridCells) {
      for (const objCell of objGridCells) {
        if (newCell[0] === objCell[0] && newCell[1] === objCell[1]) {
          return true; // Collision detected
        }
      }
    }
  }

  return false; // No collision
}

export function selectObject(
  evt: PointerEvent,
  canvas: HTMLCanvasElement,
  camera: THREE.Camera,
  scene: THREE.Scene,
  setSelectedId: (id: string | null) => void,
  setSelectedIds: (ids: string[]) => void,
  selectedIds: string[],
  shiftPressed: boolean = evt.shiftKey
): void {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  // Convert mouse position to normalized device coordinates
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Find all objects with userData.objectId
  const objectsWithId: THREE.Object3D[] = [];
  scene.traverse((child) => {
    if ((child as { userData?: { objectId?: string } }).userData?.objectId) {
      objectsWithId.push(child);
    }
  });

  // Perform raycasting
  const intersects = raycaster.intersectObjects(objectsWithId, true);

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

      if (shiftPressed) {
        // Multi-selection with shift key
        if (selectedIds.includes(id)) {
          // Remove from selection if already selected
          setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
        } else {
          // Add to selection
          setSelectedIds([...selectedIds, id]);
        }
      } else {
        // Single selection - clear previous selection and select new item
        setSelectedIds([id]);
      }
      return;
    }
  }

  // Clicked on empty space - clear selection unless shift is pressed
  if (!shiftPressed) {
    setSelectedIds([]);
  }
}
