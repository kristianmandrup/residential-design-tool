/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useState, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { TransformControls } from "@react-three/drei";
import { useStore, StoreState, SceneObj } from "../../store/useStore";
import { Building, Tree, Wall, Road, Water } from "@/components/build-objects";

export function TransformControlsManager({
  mode,
  setMode,
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
      if (!obj) return;

      // Get the selected object
      const selected = objects.find((o: SceneObj) => o.id === selectedId);

      // apply snapping on release
      if (snap) {
        obj.position.x = Math.round(obj.position.x / gridSize) * gridSize;
        obj.position.z = Math.round(obj.position.z / gridSize) * gridSize;

        // Special rotation snapping for walls (90-degree increments for vertical/horizontal)
        if (selected?.type === "wall") {
          // Snap to 90-degree increments (0, 90, 180, 270 degrees)
          let rotationY = obj.rotation.y;
          rotationY = Math.round(rotationY / (Math.PI / 2)) * (Math.PI / 2);
          obj.rotation.y = rotationY;
        } else {
          // 10-degree increments for other objects
          let rotationY = obj.rotation.y;
          rotationY = Math.round(rotationY / (Math.PI / 18)) * (Math.PI / 18);
          obj.rotation.y = rotationY;
        }
      }

      updateObject(selectedId!, {
        position: [obj.position.x, obj.position.y, obj.position.z],
        rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
        scale: [obj.scale.x, obj.scale.y, obj.scale.z],
      });
    };
    controls.addEventListener("objectChange", handler);
    return () => controls.removeEventListener("objectChange", handler);
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
      <TransformControls ref={transformRef} mode={mode}>
        <ObjectWrapper data={selected} />
      </TransformControls>
    </>
  );
}
