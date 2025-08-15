/* eslint-disable @typescript-eslint/no-explicit-any */
// components/TransformHandler.tsx
import { TransformControls } from "@react-three/drei";
import { useSceneStore, StoreState } from "@/store";
import { useRef, useEffect } from "react";

export default function TransformHandler() {
  const selectedId = useSceneStore((s: StoreState) => s.selectedId);
  const objects = useSceneStore((s: StoreState) => s.objects);
  const updateObject = useSceneStore((s: StoreState) => s.updateObject);

  const selected = objects.find((o: any) => o.id === selectedId);
  const ref = useRef<any>(null);

  useEffect(() => {
    if (ref.current) {
      const currentRef = ref.current;
      const handler = () => {
        const pos = currentRef.object.position.toArray() as [
          number,
          number,
          number
        ];
        const rot = currentRef.object.rotation.toArray().slice(0, 3) as [
          number,
          number,
          number
        ];
        const scl = currentRef.object.scale.toArray() as [
          number,
          number,
          number
        ];
        updateObject(selectedId!, { position: pos, rotation: rot, scale: scl });
      };
      currentRef.addEventListener("objectChange", handler);
      return () => currentRef.removeEventListener("objectChange", handler);
    }
  }, [selectedId, updateObject]);

  if (!selected) return null;

  return (
    <TransformControls ref={ref} mode="translate">
      <mesh
        position={selected.position}
        rotation={selected.rotation}
        scale={selected.scale}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </TransformControls>
  );
}
