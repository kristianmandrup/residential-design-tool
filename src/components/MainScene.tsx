"use client";
import React from "react";
import { Canvas } from "@react-three/fiber";
import { SceneWrapper } from "./scene";

export default function Scene() {
  const [transformMode, setTransformMode] = React.useState<
    "translate" | "rotate" | "scale"
  >("translate");

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <Canvas shadows camera={{ position: [8, 8, 8], fov: 50 }}>
        <SceneWrapper
          transformMode={transformMode}
          setTransformMode={setTransformMode}
        />
      </Canvas>
    </div>
  );
}
