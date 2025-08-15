import React, { useRef, useEffect } from "react";
import { useThree } from "@react-three/drei";
import { TransformControls } from "@react-three/drei";
import { useSceneStore } from "@/store/useSceneStore";
import * as THREE from "three";
interface TransformControlsManagerProps {
  mode: "translate" | "rotate" | "scale";
  setMode: (mode: "translate" | "rotate" | "scale") => void;
  showTransformControls: boolean;
}
export function TransformControlsManager({
  mode,
  showTransformControls,
}: TransformControlsManagerProps) {
  const selectedId = useSceneStore((s) => s.selectedId);
  const objects = useSceneStore((s) => s.objects);
  const updateObject = useSceneStore((s) => s.updateObject);
  const gridSize = useSceneStore((s) => s.gridSize);
  const snapEnabled = useSceneStore((s) => s.snapEnabled);
  const transformRef = useRef<any>(null);
  const { camera, gl } = useThree();
  const selectedObject = objects.find((o) => o.id === selectedId);
  useEffect(() => {
    if (!transformRef.current || !selectedObject) return;
    const controls = transformRef.current;

    const handleChange = () => {
      const obj = controls.object;
      if (!obj || !selectedId) return;

      // Real-time updates while dragging
      updateObject(selectedId, {
        position: [obj.position.x, obj.position.y, obj.position.z],
        rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
        scale: [obj.scale.x, obj.scale.y, obj.scale.z],
      });
    };

    const handleMouseUp = () => {
      const obj = controls.object;
      if (!obj || !selectedId) return;

      // Apply snapping on release
      if (snapEnabled) {
        obj.position.x = Math.round(obj.position.x / gridSize) * gridSize;
        obj.position.z = Math.round(obj.position.z / gridSize) * gridSize;

        // Rotation snapping to 90-degree increments
        const rotationY = obj.rotation.y;
        const degrees = (rotationY * 180) / Math.PI;
        const snappedDegrees = Math.round(degrees / 90) * 90;
        obj.rotation.y = (snappedDegrees * Math.PI) / 180;
      }

      updateObject(selectedId, {
        position: [obj.position.x, obj.position.y, obj.position.z],
        rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
        scale: [obj.scale.x, obj.scale.y, obj.scale.z],
      });
    };

    controls.addEventListener("objectChange", handleChange);
    controls.addEventListener("mouseUp", handleMouseUp);

    return () => {
      controls.removeEventListener("objectChange", handleChange);
      controls.removeEventListener("mouseUp", handleMouseUp);
    };
  }, [selectedId, updateObject, gridSize, snapEnabled, selectedObject]);
  if (!selectedObject || !showTransformControls) return null;
  return (
    <TransformControls
      ref={transformRef}
      mode={mode}
      object={new THREE.Object3D()} // We'll position this based on selected object
      translationSnap={snapEnabled ? gridSize : null}
      rotationSnap={snapEnabled ? Math.PI / 2 : null}
      scaleSnap={snapEnabled ? 0.25 : null}
    />
  );
}
