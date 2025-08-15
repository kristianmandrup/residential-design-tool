import * as THREE from "three";
import { SceneObj } from "@/store/storeTypes";
export function getWorldIntersection(
event: PointerEvent,
canvas: HTMLCanvasElement,
camera: THREE.Camera
): THREE.Vector3 | null {
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const rect = canvas.getBoundingClientRect();
pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
raycaster.setFromCamera(pointer, camera);
const intersect = new THREE.Vector3();
raycaster.ray.intersectPlane(plane, intersect);
return intersect;
}
export function snapToGrid(
position: THREE.Vector3,
gridSize: number,
enabled: boolean
): THREE.Vector3 {
if (!enabled) return position.clone();
const snapped = position.clone();
snapped.x = Math.round(snapped.x / gridSize) * gridSize;
snapped.z = Math.round(snapped.z / gridSize) * gridSize;
return snapped;
}
export function checkCollision(
newPos: [number, number, number],
newGridWidth: number,
newGridDepth: number,
objects: SceneObj[],
gridSize: number,
snapEnabled: boolean,
excludeId?: string
): boolean {
const gridX = snapEnabled ? Math.round(newPos[0] / gridSize) : newPos[0] / gridSize;
const gridZ = snapEnabled ? Math.round(newPos[2] / gridSize) : newPos[2] / gridSize;
const newGridCells: [number, number][] = [];
const halfWidth = (newGridWidth || 1) / 2;
const halfDepth = (newGridDepth || 1) / 2;
const startX = Math.floor(gridX - halfWidth + 0.5);
const endX = Math.floor(gridX + halfWidth - 0.5);
const startZ = Math.floor(gridZ - halfDepth + 0.5);
const endZ = Math.floor(gridZ + halfDepth - 0.5);
for (let x = startX; x <= endX; x++) {
for (let z = startZ; z <= endZ; z++) {
newGridCells.push([x, z]);
}
}
for (const obj of objects) {
if (obj.id === excludeId) continue;
const objGridX = snapEnabled
  ? Math.round(obj.position[0] / gridSize)
  : obj.position[0] / gridSize;
const objGridZ = snapEnabled
  ? Math.round(obj.position[2] / gridSize)
  : obj.position[2] / gridSize;

const objHalfWidth = (obj.gridWidth || 1) / 2;
const objHalfDepth = (obj.gridDepth || 1) / 2;
const objGridCells: [number, number][] = [];

const objStartX = Math.floor(objGridX - objHalfWidth + 0.5);
const objEndX = Math.floor(objGridX + objHalfWidth - 0.5);
const objStartZ = Math.floor(objGridZ - objHalfDepth + 0.5);
const objEndZ = Math.floor(objGridZ + objHalfDepth - 0.5);

for (let x = objStartX; x <= objEndX; x++) {
  for (let z = objStartZ; z <= objEndZ; z++) {
    objGridCells.push([x, z]);
  }
}

// Check for overlaps
for (const newCell of newGridCells) {
  for (const objCell of objGridCells) {
    if (newCell[0] === objCell[0] && newCell[1] === objCell[1]) {
      return true;
    }
  }
}
}
return false;
}
