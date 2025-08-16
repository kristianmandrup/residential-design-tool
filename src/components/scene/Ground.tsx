import React, { useEffect, useRef, useMemo, useCallback } from "react";
import * as THREE from "three";
import { useElevation } from "@/contexts/ElevationContext";
import { useTerrain, TerrainType } from "@/contexts/TerrainContext";
import {
  useVegetation,
  createVegetationMesh,
  VegetationInstance,
} from "@/contexts/VegetationContext";
import { useTerrainEditing } from "@/contexts/TerrainEditingContext";
import {
  SlopeVisualization,
  BrushPreview,
} from "@/components/scene/SlopeVisualization";
import { brushEffects } from "@/contexts/TerrainEditingContext";

interface GroundProps {
  gridSize?: number;
  segments?: number;
  enableTerrainBlending?: boolean;
  showVegetation?: boolean;
}

export function Ground({
  gridSize = 100,
  segments = 100,
  enableTerrainBlending = true,
  showVegetation = true,
}: GroundProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const textureRef = useRef<THREE.CanvasTexture | null>(null);
  const { gridElevation } = useElevation();
  const {
    terrainTypes,
    generateTerrainTexture,
    getTerrainTypeAtPosition,
    vegetationEnabled: terrainVegetationEnabled,
    vegetationDensity: terrainVegetationDensity,
  } = useTerrain();

  const { vegetationInstances, generateVegetation, addVegetationInstance } =
    useVegetation();

  const {
    isEditing,
    brushPreview,
    currentMode,
    startEditing,
    stopEditing,
    updateBrushPosition,
    applyBrushEffect,
  } = useTerrainEditing();

  // Create elevation-based geometry
  const elevationGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(
      gridSize,
      gridSize,
      segments,
      segments
    );
    const positions = geometry.attributes.position.array as Float32Array;

    // Apply grid elevation to vertices
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];

      // Get grid elevation for this position
      const elevation = gridElevation[`${Math.round(x)},${Math.round(z)}`] || 0;
      positions[i + 1] = elevation; // Set y position
    }

    geometry.computeVertexNormals();
    return geometry;
  }, [gridSize, segments, gridElevation]);

  // Generate terrain textures for all terrain types
  useEffect(() => {
    const textures: { [key: string]: THREE.CanvasTexture } = {};

    Object.keys(terrainTypes).forEach((type) => {
      const texture = generateTerrainTexture(type, 0);
      if (texture) {
        textures[type] = texture;
      }
    });

    // Set default texture
    if (textures.grass) {
      textureRef.current = textures.grass;
    }
  }, [terrainTypes, generateTerrainTexture]);

  // Create blended terrain material based on elevation
  const terrainMaterial = useMemo(() => {
    if (!textureRef.current) return null;

    const materials: THREE.MeshStandardMaterial[] = [];
    const terrainKeys = Object.keys(terrainTypes);

    // Create materials for each terrain type
    terrainKeys.forEach((type) => {
      const terrainType = terrainTypes[type];
      const texture = generateTerrainTexture(type, 0);
      if (texture) {
        const material = new THREE.MeshStandardMaterial({
          map: texture,
          color: "#ffffff",
          roughness: terrainType.roughness,
          metalness: terrainType.metalness,
          side: THREE.DoubleSide,
        });
        materials.push(material);
      }
    });

    if (materials.length === 0) return null;

    // For now, use the first material (grass) - will implement blending later
    return materials[0];
  }, [terrainTypes, generateTerrainTexture]);

  // Generate vegetation based on terrain and elevation
  useEffect(() => {
    if (!showVegetation || !terrainVegetationEnabled) return;

    const newVegetationInstances: VegetationInstance[] = [];

    // Sample terrain at regular intervals to generate vegetation
    const sampleInterval = 5; // Sample every 5 units
    const halfGrid = gridSize / 2;

    for (let x = -halfGrid; x < halfGrid; x += sampleInterval) {
      for (let z = -halfGrid; z < halfGrid; z += sampleInterval) {
        const elevation =
          gridElevation[`${Math.round(x)},${Math.round(z)}`] || 0;
        const terrainType = getTerrainTypeAtPosition(x, z, elevation);

        // Generate vegetation for this area
        const vegetation = generateVegetation(terrainType, elevation, {
          min: [x - sampleInterval / 2, z - sampleInterval / 2],
          max: [x + sampleInterval / 2, z + sampleInterval / 2],
        });

        newVegetationInstances.push(...vegetation);
      }
    }

    // Add generated vegetation instances
    newVegetationInstances.forEach((instance) => {
      addVegetationInstance(instance);
    });
  }, [
    gridSize,
    gridElevation,
    showVegetation,
    terrainVegetationEnabled,
    getTerrainTypeAtPosition,
    generateVegetation,
    addVegetationInstance,
  ]);

  // Handle terrain editing
  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (!isEditing) return;

      // Convert screen coordinates to world coordinates
      // This is a simplified version - in a real implementation, you'd use raycasting
      const rect = event.currentTarget.getBoundingClientRect();
      const x =
        ((event.clientX - rect.left) / rect.width) * gridSize - gridSize / 2;
      const z =
        ((event.clientY - rect.top) / rect.height) * gridSize - gridSize / 2;

      startEditing(currentMode.type, [x, z]);
    },
    [isEditing, currentMode.type, gridSize, startEditing]
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      if (!isEditing || !brushPreview.active) return;

      // Convert screen coordinates to world coordinates
      const rect = event.currentTarget.getBoundingClientRect();
      const x =
        ((event.clientX - rect.left) / rect.width) * gridSize - gridSize / 2;
      const z =
        ((event.clientY - rect.top) / rect.height) * gridSize - gridSize / 2;

      updateBrushPosition([x, z]);

      // Apply brush effect while dragging
      if (event.buttons === 1) {
        // Left mouse button held down
        applyBrushEffect([x, z], brushEffects[currentMode.type]);
      }
    },
    [
      isEditing,
      brushPreview.active,
      gridSize,
      updateBrushPosition,
      applyBrushEffect,
      currentMode.type,
    ]
  );

  const handlePointerUp = useCallback(() => {
    if (isEditing) {
      stopEditing();
    }
  }, [isEditing, stopEditing]);

  return (
    <group ref={meshRef}>
      {/* Main terrain mesh */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <primitive object={elevationGeometry} />
        {terrainMaterial ? (
          <primitive object={terrainMaterial} />
        ) : (
          <meshStandardMaterial
            map={textureRef.current || undefined}
            color="#ffffff"
            roughness={0.8}
            metalness={0.1}
            side={THREE.DoubleSide}
          />
        )}
      </mesh>

      {/* Slope visualization overlay */}
      <SlopeVisualization
        gridSize={gridSize}
        segments={segments}
        opacity={0.5}
      />

      {/* Brush preview */}
      {isEditing && brushPreview.position && (
        <BrushPreview
          position={brushPreview.position}
          size={currentMode.brush.size}
          strength={currentMode.brush.strength}
          falloff={currentMode.brush.falloff}
          shape={currentMode.brush.shape}
        />
      )}

      {/* Vegetation system */}
      {showVegetation &&
        terrainVegetationEnabled &&
        vegetationInstances.length > 0 && (
          <group>
            {vegetationInstances.map((vegetation) => (
              <primitive
                key={vegetation.id}
                object={createVegetationMesh(vegetation)}
              />
            ))}
          </group>
        )}
    </group>
  );
}
