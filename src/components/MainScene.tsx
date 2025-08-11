"use client";
import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import {
  Ground,
  SceneObjects,
  SelectionAndPlacement,
  TransformControlsManager,
  TransformModeUI,
} from "./scene";
import { useGrid } from "@/contexts/GridContext";
import * as THREE from "three";

function TransparentGrid({ size = 100, divisions = 100, color = "#888" }) {
  const grid = React.useMemo(
    () => new THREE.GridHelper(size, divisions, color, color),
    [size, divisions, color]
  );
  grid.material.transparent = true;
  grid.material.opacity = 0.6; // slightly more visible
  grid.material.depthWrite = false;
  return <primitive object={grid} position={[0, 0.001, 0]} />;
}

function SceneWrapper() {
  const [transformMode, setTransformMode] = React.useState<
    "translate" | "rotate" | "scale"
  >("translate");

  const { showGrid } = useGrid();
  const [viewportStyle, setViewportStyle] = React.useState({});

  React.useEffect(() => {
    const updateViewportStyle = () => {
      const width = window.innerWidth / 2;
      const height = window.innerHeight / 2;
      console.log({ width, height });

      const right = width - 200;
      const bottom = height - 40;
      console.log({ right, bottom });
      setViewportStyle({
        position: "absolute",
        right: `-${right}px`,
        bottom: `-${bottom}px`,
        zIndex: 10,
      });
    };

    updateViewportStyle();
    window.addEventListener("resize", updateViewportStyle);
    return () => window.removeEventListener("resize", updateViewportStyle);
  }, []);

  return (
    <>
      <ambientLight intensity={1.0} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />

      {showGrid && <TransparentGrid size={100} divisions={100} color="#888" />}

      <Ground />
      <SceneObjects />
      <SelectionAndPlacement />

      <Html>
        <TransformModeUI
          mode={transformMode}
          setMode={setTransformMode}
          style={viewportStyle}
        />
      </Html>

      <TransformControlsManager
        mode={transformMode}
        setMode={setTransformMode}
      />

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
