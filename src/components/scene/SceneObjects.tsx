import React from "react";
import { useSceneStore } from "@/store/useSceneStore";
import { Building, Tree, Wall, Road, Water } from "@/components/objects";
import { SceneObj } from "@/store/storeTypes";
export function SceneObjects() {
  const objects = useSceneStore((s) => s.objects);
  const selectedId = useSceneStore((s) => s.selectedId);
  return (
    <>
      {objects.map((obj: SceneObj) => {
        try {
          // Add selection highlight
          const isSelected = selectedId === obj.id;
          // Render based on object type
          switch (obj.type) {
            case "building":
              return (
                <group key={obj.id}>
                  <Building data={obj as any} />
                  {isSelected && (
                    <mesh position={obj.position}>
                      <boxGeometry args={[3, 6, 3]} />
                      <meshBasicMaterial
                        color="yellow"
                        wireframe
                        transparent
                        opacity={0.5}
                      />
                    </mesh>
                  )}
                </group>
              );

            case "tree":
              return (
                <group key={obj.id}>
                  <Tree data={obj as any} />
                  {isSelected && (
                    <mesh position={obj.position}>
                      <cylinderGeometry args={[1.5, 1.5, 4, 8]} />
                      <meshBasicMaterial
                        color="yellow"
                        wireframe
                        transparent
                        opacity={0.5}
                      />
                    </mesh>
                  )}
                </group>
              );

            case "wall":
              return (
                <group key={obj.id}>
                  <Wall data={obj as any} />
                  {isSelected && (
                    <mesh position={obj.position}>
                      <boxGeometry args={[3, 2.5, 0.5]} />
                      <meshBasicMaterial
                        color="yellow"
                        wireframe
                        transparent
                        opacity={0.5}
                      />
                    </mesh>
                  )}
                </group>
              );

            case "road":
              return (
                <group key={obj.id}>
                  <Road data={obj as any} />
                  {/* Road selection handled within Road component */}
                </group>
              );

            case "water":
              return (
                <group key={obj.id}>
                  <Water data={obj as any} />
                  {isSelected && (
                    <mesh position={obj.position}>
                      <cylinderGeometry args={[2.5, 2.5, 0.3, 16]} />
                      <meshBasicMaterial
                        color="yellow"
                        wireframe
                        transparent
                        opacity={0.5}
                      />
                    </mesh>
                  )}
                </group>
              );

            default:
              console.warn(`Unknown object type: ${obj.type}`);
              return null;
          }
        } catch (error) {
          console.error(`Error rendering object ${obj.id}:`, error);

          // Fallback error visualization
          return (
            <mesh key={`error-${obj.id}`} position={obj.position || [0, 0, 0]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshBasicMaterial color="#ff0000" wireframe />
            </mesh>
          );
        }
      })}
    </>
  );
}
