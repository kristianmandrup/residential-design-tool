import * as THREE from "three";
import { checkCollision, selectObject } from "./SceneUtils";
import { SceneObj, ObjType } from "@/store/storeTypes";

type Tool = "select" | "building" | "tree" | "road" | "wall" | "water";

interface PointerEventHandlersProps {
  canvas: HTMLCanvasElement;
  camera: THREE.Camera;
  scene: THREE.Scene;
  addObject: (object: Partial<SceneObj> & { type: ObjType }) => void;
  setSelectedId: (id: string | null) => void;
  removeObject: (id: string) => void;
  gridSize: number;
  snap: boolean;
  objects: SceneObj[];
  updateObject: (id: string, updates: Partial<SceneObj>) => void;
  selectedTool: Tool;
  setSelectedTool: (tool: Tool) => void;
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
  updateObject,
  selectedTool,
  setSelectedTool,
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

  const handleDown = (e: PointerEvent) => {
    // Double-click detection for finishing road
    const now = Date.now();
    const double = lastClickTime && now - lastClickTime < 350;

    const intersect = getIntersection(e);
    if (!intersect) return;
    snapVec(intersect);

    if (e.ctrlKey) {
      setIsDrawingRoad(true);
      setTempRoadPoints([
        ...tempRoadPoints,
        [
          Math.round(intersect.x * 100) / 100,
          Math.round(intersect.z * 100) / 100,
        ] as [number, number],
      ]);
      if (double) {
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
            name: `Road ${objects.length + 1}`,
            points: pts as [number, number][],
            position: [0, 0, 0],
            rotation: [0, 0, 0],
            scale: [1, 1, 1],
            width: 1,
            gridWidth: 1,
            gridDepth: 1,
            gridHeight: 0.1,
          } as Partial<SceneObj> & { type: ObjType });
        }
        setTempRoadPoints([]);
        setIsDrawingRoad(false);
      }
      setLastClickTime(now);
      return;
    }

    if (selectedTool && selectedTool !== "select") {
      const newPosition: [number, number, number] = [
        intersect.x,
        0,
        intersect.z,
      ];
      const newScale: [number, number, number] = [1, 1, 1];
      const gridWidth =
        selectedTool === "building"
          ? 2
          : selectedTool === "wall"
          ? 2
          : selectedTool === "water"
          ? 2
          : 1;
      const gridDepth =
        selectedTool === "building"
          ? 2
          : selectedTool === "wall"
          ? 1
          : selectedTool === "water"
          ? 2
          : 1;

      if (
        checkCollision(
          newPosition,
          selectedTool,
          gridWidth,
          gridDepth,
          objects,
          gridSize,
          snap
        )
      ) {
        return;
      }

      const newObject = {
        type: selectedTool,
        name: `${
          selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)
        } ${objects.length + 1}`,
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
      } as Partial<SceneObj> & { type: ObjType };
      addObject(newObject);
      return;
    }

    selectObject(e, canvas, camera, scene, setSelectedId);

    if (e.button === 2 && selectedId) {
      removeObject(selectedId);
      setSelectedId(null);
    }
  };

  const handleContextMenu = (e: Event) => {
    e.preventDefault();
  };

  return {
    handleDown,
    handleContextMenu,
  };
}
