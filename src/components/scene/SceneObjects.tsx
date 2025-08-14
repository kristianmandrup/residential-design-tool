/* eslint-disable @typescript-eslint/no-explicit-any */
// SceneObjects.tsx - Enhanced with safety nets
import React from "react";
import { useStore, StoreState } from "../../store";
import { Building, Tree, Wall, Road, Water } from "@/components/build-objects";
import { DebugRoadStore } from "./DebugRoadStore";
import { Html } from "@react-three/drei";
import {
  SceneObj,
  isRoadObj,
  isBuildingObj,
  isTreeObj,
  isWallObj,
  isWaterObj,
} from "@/store/storeTypes";
import { ensureCompleteSceneObj, validateRoadObj } from "@/utils/typeMigration";

export function SceneObjects() {
  const objects = useStore((s: StoreState) => s.objects);
  const updateObject = useStore((s: StoreState) => s.updateObject);
  const removeObject = useStore((s: StoreState) => s.removeObject);

  return (
    <>
      <Html>
        <DebugRoadStore />
      </Html>
      {objects.map((obj: SceneObj) => {
        try {
          // 🔥 SAFETY NET - ensure object is complete before rendering
          let safeObj = obj;

          // Check if object needs migration/completion
          try {
            safeObj = ensureCompleteSceneObj(obj as any);

            // If the object was incomplete, update it in the store
            if (JSON.stringify(obj) !== JSON.stringify(safeObj)) {
              console.log("🔧 Auto-fixing incomplete object:", obj.id);
              updateObject(obj.id, safeObj);
            }
          } catch (migrationError) {
            console.error(
              "❌ Failed to fix object, removing:",
              obj.id,
              migrationError
            );
            removeObject(obj.id);
            return null;
          }

          // Type-specific validation and rendering
          if (isBuildingObj(safeObj)) {
            return <Building key={safeObj.id} data={safeObj} />;
          }

          if (isTreeObj(safeObj)) {
            return <Tree key={safeObj.id} data={safeObj} />;
          }

          if (isWallObj(safeObj)) {
            return <Wall key={safeObj.id} data={safeObj} />;
          }

          if (isRoadObj(safeObj)) {
            // 🔥 EXTRA VALIDATION FOR ROADS
            if (!validateRoadObj(safeObj)) {
              console.error("❌ Invalid road detected, removing:", safeObj.id);
              removeObject(safeObj.id);
              return null;
            }

            return <Road key={safeObj.id} data={safeObj} />;
          }

          if (isWaterObj(safeObj)) {
            return <Water key={safeObj.id} data={safeObj} />;
          }

          // Unknown type
          console.warn("❓ Unknown object type:", safeObj.type, safeObj);
          return null;
        } catch (error) {
          console.error("❌ Error rendering object:", obj.id, error);

          // Render error fallback
          return (
            <mesh key={`error-${obj.id}`} position={obj.position || [0, 0, 0]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#ff0000" wireframe />
            </mesh>
          );
        }
      })}
    </>
  );
}
