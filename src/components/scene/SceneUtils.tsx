import * as THREE from "three";

export interface SceneObject {
  id: string;
  type: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
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
  newScale: [number, number, number],
  objects: SceneObject[],
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

export function selectObject(
  evt: PointerEvent,
  canvas: HTMLCanvasElement,
  camera: THREE.Camera,
  scene: THREE.Scene,
  setSelectedId: (id: string | null) => void
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
      setSelectedId(id);
      return;
    }
  }

  // nothing selected -> deselect
  setSelectedId(null);
}
