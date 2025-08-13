/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from "three";
import { PointerEventContext, StoreActions, PointerEventData } from "./types";

export class SelectionHandler {
  constructor(
    private context: PointerEventContext,
    private actions: StoreActions
  ) {}

  handleSelection(data: PointerEventData): boolean {
    const { event } = data;
    const { canvas, camera, scene } = this.context;
    const { setSelectedId, setSelectedIds } = this.actions;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Convert mouse position to normalized device coordinates
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // Find all objects with userData.objectId
    const objectsWithId: THREE.Object3D[] = [];
    scene.traverse((child) => {
      if ((child as any).userData?.objectId) {
        objectsWithId.push(child);
      }
    });

    // Perform raycasting
    const intersects = raycaster.intersectObjects(objectsWithId, true);

    if (intersects.length > 0) {
      // Get the closest object's ID
      let selectedObject: THREE.Object3D | null = intersects[0].object;

      // Traverse up to find the parent with userData.objectId
      while (selectedObject && !(selectedObject as any).userData?.objectId) {
        selectedObject = selectedObject.parent;
      }

      if (selectedObject && (selectedObject as any).userData?.objectId) {
        const id = (selectedObject as any).userData.objectId as string;

        if (data.shiftKey) {
          // Multi-selection logic would go here
          setSelectedIds([id]); // Simplified for now
        } else {
          setSelectedId(id);
          setSelectedIds([id]);
        }
        return true; // Selection was handled
      }
    }

    // Clicked on empty space - clear selection unless shift is pressed
    if (!data.shiftKey) {
      setSelectedId(null);
      setSelectedIds([]);
    }
    return false;
  }
}
