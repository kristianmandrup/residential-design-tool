/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { TransformControls } from "@react-three/drei";
import { useStore, StoreState, SceneObj } from "../../store";
import { Building, Tree, Wall, Road, Water } from "@/components/build-objects";

export function TransformControlsManager({
  mode,
}: {
  mode: "translate" | "rotate" | "scale";
  setMode: (m: "translate" | "rotate" | "scale") => void;
}) {
  const selectedId = useStore((s: StoreState) => s.selectedId);
  const objects = useStore((s: StoreState) => s.objects);
  const updateObject = useStore((s: StoreState) => s.updateObject);
  const gridSize = useStore((s: StoreState) => s.gridSize);
  const snap = useStore((s: StoreState) => s.snapEnabled);
  const transformRef = useRef<any>(null);
  const { camera, gl } = useThree();

  const selected = objects.find((o: SceneObj) => o.id === selectedId);

  useEffect(() => {
    if (!transformRef.current) return;
    const controls = transformRef.current;

    const handler = () => {
      const obj = controls.object;
      if (!obj || !selectedId) return;

      // Get the selected object
      const selected = objects.find((o: SceneObj) => o.id === selectedId);
      if (!selected) return;

      // Apply snapping on release
      if (snap) {
        // Position snapping
        obj.position.x = Math.round(obj.position.x / gridSize) * gridSize;
        obj.position.z = Math.round(obj.position.z / gridSize) * gridSize;

        // Rotation snapping - always snap to 90-degree increments
        const rotationY = obj.rotation.y;
        // Convert to degrees, round to nearest 90, convert back to radians
        const degrees = (rotationY * 180) / Math.PI;
        const snappedDegrees = Math.round(degrees / 90) * 90;
        obj.rotation.y = (snappedDegrees * Math.PI) / 180;

        // Keep rotation within 0-2π range
        while (obj.rotation.y < 0) obj.rotation.y += 2 * Math.PI;
        while (obj.rotation.y >= 2 * Math.PI) obj.rotation.y -= 2 * Math.PI;
      }

      updateObject(selectedId, {
        position: [obj.position.x, obj.position.y, obj.position.z],
        rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
        scale: [obj.scale.x, obj.scale.y, obj.scale.z],
      });
    };

    const changeHandler = () => {
      // Real-time updates while dragging (without snapping)
      const obj = controls.object;
      if (!obj || !selectedId) return;

      updateObject(selectedId, {
        position: [obj.position.x, obj.position.y, obj.position.z],
        rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
        scale: [obj.scale.x, obj.scale.y, obj.scale.z],
      });
    };

    // Use 'mouseUp' for snapping and 'objectChange' for real-time updates
    controls.addEventListener("mouseUp", handler);
    controls.addEventListener("objectChange", changeHandler);

    return () => {
      controls.removeEventListener("mouseUp", handler);
      controls.removeEventListener("objectChange", changeHandler);
    };
  }, [selectedId, updateObject, gridSize, snap, camera, gl, objects]);

  if (!selected) return null;

  // Create a wrapper that applies the selected object's transform
  const ObjectWrapper: React.FC<{ data: SceneObj }> = ({ data }) => {
    if (data.type === "building") return <Building data={data} />;
    if (data.type === "tree") return <Tree data={data} />;
    if (data.type === "wall") return <Wall data={data} />;
    if (data.type === "road") return <Road data={data} />;
    if (data.type === "water") return <Water data={data} />;
    return null;
  };

  return (
    <>
      <TransformControls
        ref={transformRef}
        mode={mode}
        translationSnap={snap ? gridSize : null}
        rotationSnap={snap ? Math.PI / 2 : null} // 90 degrees in radians
        scaleSnap={snap ? 0.25 : null}
      >
        <ObjectWrapper data={selected} />
      </TransformControls>
    </>
  );
}
