"use client";
import React from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Grid, Html } from "@react-three/drei";
import {
  Ground,
  SceneObjects,
  SelectionAndPlacement,
  TransformControlsManager,
  TransformModeUI,
} from "./scene";

function SceneWrapper() {
  const { gl } = useThree();
  const [transformMode, setTransformMode] = React.useState<
    "translate" | "rotate" | "scale"
  >("translate");

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

      <Grid
        args={[100, 100]}
        cellSize={1}
        sectionColor="#888"
        fadeDistance={50}
        cellThickness={1}
        sectionThickness={1}
      />

      <Ground />

      <SceneObjects />

      <SelectionAndPlacement />

      <Html>
        <TransformModeUI mode={transformMode} setMode={setTransformMode} />
      </Html>

      <TransformControlsManager
        mode={transformMode}
        setMode={setTransformMode}
      />

      {/* TransformControls: attach to selected object */}
      {/* TransformControls will be imported at top. To make orbit disable/enable behavior work,
          we rely on three's controls instance being the OrbitControls used by Drei. */}
      <OrbitControls makeDefault />
    </>
  );
}

export default function Scene() {
  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <Canvas shadows camera={{ position: [8, 8, 8], fov: 50 }}>
        <SceneWrapper />
      </Canvas>
    </div>
  );
}
