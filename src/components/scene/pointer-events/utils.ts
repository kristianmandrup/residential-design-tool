import * as THREE from "three";
import { PointerEventContext, PointerEventData } from "./types";

export function getWorldIntersection(
  event: PointerEvent,
  context: PointerEventContext
): THREE.Vector3 | null {
  const { canvas, camera } = context;
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
  snapped.y = Math.round(snapped.y / gridSize) * gridSize;
  return snapped;
}

export function createPointerEventData(
  event: PointerEvent,
  context: PointerEventContext
): PointerEventData | null {
  const worldPosition = getWorldIntersection(event, context);
  if (!worldPosition) return null;

  const snappedPosition = snapToGrid(
    worldPosition,
    context.gridSize,
    context.snap
  );

  return {
    event,
    worldPosition,
    snappedPosition,
    button: event.button,
    shiftKey: event.shiftKey,
    ctrlKey: event.ctrlKey,
    altKey: event.altKey,
  };
}
