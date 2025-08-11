"use client";

import React from "react";
import { OrbitControls, Html } from "@react-three/drei";
import {
  Ground,
  SceneObjects,
  SelectionAndPlacement,
  TransformControlsManager,
  TransformModeUI,
  TransparentGrid,
} from "./index";
import { useGrid } from "@/contexts/GridContext";

interface SceneWrapperProps {
  transformMode: "translate" | "rotate" | "scale";
  setTransformMode: (mode: "translate" | "rotate" | "scale") => void;
}

export function SceneWrapper({
  transformMode,
  setTransformMode,
}: SceneWrapperProps) {
  const { showGrid } = useGrid();
  const [viewportStyle, setViewportStyle] = React.useState({});

  React.useEffect(() => {
    const updateViewportStyle = () => {
      const width = window.innerWidth / 2;
      const height = window.innerHeight / 2;
      console.log({ width, height });

      const right = width - 320;
      const bottom = height - 80;
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

      {showGrid && <TransparentGrid size={100} divisions={100} color="#FFF" />}

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
