"use client";
import React from "react";
import { Canvas } from "@react-three/fiber";
import { SceneWrapper } from "./scene";
import { useLayout } from "@/contexts/LayoutContext";

export default function Scene() {
  const [transformMode, setTransformMode] = React.useState<
    "translate" | "rotate" | "scale"
  >("translate");
  const { canvasWidth } = useLayout();

  return (
    <div
      style={{
        position: "relative",
        width: `${canvasWidth}px`,
        height: "100vh",
      }}
    >
      <Canvas shadows camera={{ position: [8, 8, 8], fov: 50 }}>
        <SceneWrapper
          transformMode={transformMode}
          setTransformMode={setTransformMode}
        />
      </Canvas>
    </div>
  );
}
