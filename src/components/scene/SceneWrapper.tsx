"use client";
import React from "react";
import { OrbitControls } from "@react-three/drei";
import {
  Ground,
  SceneObjects,
  SelectionAndPlacement,
  TransformControlsManager,
  TransparentGrid,
} from "./index";
import { useGrid } from "@/contexts/GridContext";
import { TerrainEditingControls } from "./TerrainEditingControls";
interface SceneWrapperProps {
  transformMode: "translate" | "rotate" | "scale";
  setTransformMode: (mode: "translate" | "rotate" | "scale") => void;
}
export function SceneWrapper({
  transformMode,
  setTransformMode,
}: SceneWrapperProps) {
  const { showGrid } = useGrid();
  const [showTransformControls, setShowTransformControls] =
    React.useState(true);
  return (
    <>
      {/* Terrain Editing Controls */}
      <TerrainEditingControls />

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.0}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      {/* Grid */}
      {showGrid && <TransparentGrid size={100} divisions={100} color="#888" />}

      {/* Scene content */}
      <Ground />
      <SceneObjects />
      <SelectionAndPlacement />

      {/* Controls */}
      <OrbitControls
        makeDefault
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={5}
        maxDistance={100}
      />

      {/* Transform controls for selected objects */}
      <TransformControlsManager
        mode={transformMode}
        setMode={setTransformMode}
        showTransformControls={showTransformControls}
      />
    </>
  );
}
