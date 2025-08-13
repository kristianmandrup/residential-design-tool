// src/components/debug/DebugRoadStore.tsx
import React from "react";
import { useStore } from "@/store/useStore";

export function DebugRoadStore() {
  const objects = useStore((s) => s.objects);
  const removeObject = useStore((s) => s.removeObject);
  const roads = objects.filter((o) => o.type === "road");

  React.useEffect(() => {
    console.log("📊 STORE DEBUG:");
    console.log("All objects in store:", objects.length);
    console.log("Roads in store:", roads.length);
    roads.forEach((road, index) => {
      console.log(`Road ${index}:`, {
        id: road.id,
        points: road.points,
        roadType: road.roadType || "unknown",
        width: road.width || "default",
      });
    });
  }, [objects, roads]);

  const clearAllRoads = () => {
    roads.forEach((road) => removeObject(road.id));
    console.log("🧹 Cleared all roads");
  };

  // Only render controls if there are roads
  if (roads.length === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        background: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        zIndex: 1000,
        fontSize: "12px",
      }}
    >
      <div>Roads in scene: {roads.length}</div>
      <button
        onClick={clearAllRoads}
        style={{
          background: "#ff4444",
          color: "white",
          border: "none",
          padding: "5px 10px",
          borderRadius: "3px",
          cursor: "pointer",
          marginTop: "5px",
        }}
      >
        Clear All Roads
      </button>
    </div>
  );
}
