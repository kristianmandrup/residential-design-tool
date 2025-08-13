import React from "react";
import { useStore, StoreState, SceneObj } from "../../store";
import { Building, Tree, Wall, Road, Water } from "@/components/build-objects";
import { DebugRoadStore } from "./DebugRoadStore";
import { Html } from "@react-three/drei";

export function SceneObjects() {
  const objects = useStore((s: StoreState) => s.objects);
  return (
    <>
      <Html>
        <DebugRoadStore />
      </Html>
      {objects.map((o: SceneObj) => {
        if (o.type === "building") return <Building key={o.id} data={o} />;
        if (o.type === "tree") return <Tree key={o.id} data={o} />;
        if (o.type === "wall") return <Wall key={o.id} data={o} />;
        if (o.type === "road") return <Road key={o.id} data={o} />;
        if (o.type === "water") return <Water key={o.id} data={o} />;
        return null;
      })}
    </>
  );
}
