// src/contexts/VegetationContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import * as THREE from "three";

export interface VegetationType {
  id: string;
  name: string;
  density: number;
  size: { min: number; max: number };
  colors: string[];
  seasonal: boolean;
  windEffect: boolean;
  terrainTypes: string[]; // Which terrain types this vegetation can appear on
  elevationRange: [number, number]; // [min, max] elevation for this vegetation
}

export interface VegetationInstance {
  id: string;
  type: string;
  position: [number, number, number];
  rotation: number;
  scale: number;
  color: string;
  seasonal: boolean;
}

export interface VegetationContextType {
  // Vegetation types configuration
  vegetationTypes: { [key: string]: VegetationType };

  // Vegetation instances
  vegetationInstances: VegetationInstance[];

  // Settings
  enabled: boolean;
  density: number;
  randomSeed: number;

  // Methods
  addVegetationType: (type: VegetationType) => void;
  removeVegetationType: (id: string) => void;
  updateVegetationType: (id: string, updates: Partial<VegetationType>) => void;

  setVegetationEnabled: (enabled: boolean) => void;
  setVegetationDensity: (density: number) => void;
  setRandomSeed: (seed: number) => void;

  generateVegetation: (
    terrainType: string,
    elevation: number,
    bounds: { min: [number, number]; max: [number, number] }
  ) => VegetationInstance[];
  addVegetationInstance: (instance: VegetationInstance) => void;
  removeVegetationInstance: (id: string) => void;
  clearVegetation: () => void;
}

const defaultVegetationTypes: { [key: string]: VegetationType } = {
  flowers: {
    id: "flowers",
    name: "Wildflowers",
    density: 0.3,
    size: { min: 0.1, max: 0.3 },
    colors: ["#ff69b4", "#ffd700", "#ff6347", "#9370db"],
    seasonal: true,
    windEffect: false,
    terrainTypes: ["grass", "dirt"],
    elevationRange: [0, 8],
  },
  bushes: {
    id: "bushes",
    name: "Bushes",
    density: 0.1,
    size: { min: 0.5, max: 1.2 },
    colors: ["#228b22", "#32cd32", "#006400"],
    seasonal: false,
    windEffect: true,
    terrainTypes: ["grass", "dirt", "sand"],
    elevationRange: [0, 10],
  },
  trees: {
    id: "trees",
    name: "Trees",
    density: 0.05,
    size: { min: 2, max: 5 },
    colors: ["#8b4513", "#654321", "#a0522d"],
    seasonal: true,
    windEffect: true,
    terrainTypes: ["grass", "dirt", "rock"],
    elevationRange: [5, 25],
  },
  rocks: {
    id: "rocks",
    name: "Rocks",
    density: 0.15,
    size: { min: 0.3, max: 1.5 },
    colors: ["#696969", "#808080", "#a9a9a9"],
    seasonal: false,
    windEffect: false,
    terrainTypes: ["rock", "dirt", "sand"],
    elevationRange: [0, 20],
  },
};

const VegetationContext = createContext<VegetationContextType | undefined>(
  undefined
);

interface VegetationProviderProps {
  children: React.ReactNode;
}

export function VegetationProvider({ children }: VegetationProviderProps) {
  const [vegetationTypes, setVegetationTypes] = useState<{
    [key: string]: VegetationType;
  }>(defaultVegetationTypes);
  const [vegetationInstances, setVegetationInstances] = useState<
    VegetationInstance[]
  >([]);
  const [enabled, setEnabled] = useState<boolean>(true);
  const [density, setDensity] = useState<number>(0.1);
  const [randomSeed, setRandomSeed] = useState<number>(Math.random());

  const addVegetationType = useCallback((type: VegetationType) => {
    setVegetationTypes((prev) => ({
      ...prev,
      [type.id]: type,
    }));
  }, []);

  const removeVegetationType = useCallback((id: string) => {
    setVegetationTypes((prev) => {
      const newTypes = { ...prev };
      delete newTypes[id];
      return newTypes;
    });
  }, []);

  const updateVegetationType = useCallback(
    (id: string, updates: Partial<VegetationType>) => {
      setVegetationTypes((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          ...updates,
        },
      }));
    },
    []
  );

  const generateVegetation = useCallback(
    (
      terrainType: string,
      elevation: number,
      bounds: { min: [number, number]; max: [number, number] }
    ): VegetationInstance[] => {
      const instances: VegetationInstance[] = [];
      const [minX, minZ] = bounds.min;
      const [maxX, maxZ] = bounds.max;

      // Find vegetation types suitable for this terrain and elevation
      const suitableTypes = Object.values(vegetationTypes).filter((type) => {
        return (
          type.terrainTypes.includes(terrainType) &&
          elevation >= type.elevationRange[0] &&
          elevation <= type.elevationRange[1]
        );
      });

      if (suitableTypes.length === 0) return instances;

      // Generate vegetation instances
      const area = (maxX - minX) * (maxZ - minZ);
      const targetCount = Math.floor(area * density * 0.01); // Scale density by area

      for (let i = 0; i < targetCount; i++) {
        const vegetationType =
          suitableTypes[Math.floor(Math.random() * suitableTypes.length)];

        // Random position within bounds
        const x = minX + Math.random() * (maxX - minX);
        const z = minZ + Math.random() * (maxZ - minZ);

        // Random properties
        const scale =
          vegetationType.size.min +
          Math.random() * (vegetationType.size.max - vegetationType.size.min);
        const color =
          vegetationType.colors[
            Math.floor(Math.random() * vegetationType.colors.length)
          ];
        const rotation = Math.random() * Math.PI * 2;

        instances.push({
          id: `veg-${Date.now()}-${i}`,
          type: vegetationType.id,
          position: [x, elevation + scale * 0.5, z], // Slightly above ground
          rotation,
          scale,
          color,
          seasonal: vegetationType.seasonal,
        });
      }

      return instances;
    },
    [vegetationTypes, density]
  );

  const addVegetationInstance = useCallback((instance: VegetationInstance) => {
    setVegetationInstances((prev) => [...prev, instance]);
  }, []);

  const removeVegetationInstance = useCallback((id: string) => {
    setVegetationInstances((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const clearVegetation = useCallback(() => {
    setVegetationInstances([]);
  }, []);

  const value: VegetationContextType = {
    vegetationTypes,
    vegetationInstances,
    enabled,
    density,
    randomSeed,

    addVegetationType,
    removeVegetationType,
    updateVegetationType,

    setVegetationEnabled: setEnabled,
    setVegetationDensity: setDensity,
    setRandomSeed,

    generateVegetation,
    addVegetationInstance,
    removeVegetationInstance,
    clearVegetation,
  };

  return (
    <VegetationContext.Provider value={value}>
      {children}
    </VegetationContext.Provider>
  );
}

export function useVegetation() {
  const context = useContext(VegetationContext);
  if (context === undefined) {
    throw new Error("useVegetation must be used within a VegetationProvider");
  }
  return context;
}

// Helper function to create vegetation mesh
export function createVegetationMesh(
  vegetation: VegetationInstance
): THREE.Group {
  const group = new THREE.Group();

  const { type, position, rotation, scale, color } = vegetation;

  // Create different geometry based on vegetation type
  let geometry: THREE.BufferGeometry;

  switch (type) {
    case "flowers":
      // Simple flower: stem + sphere for petals
      const stemGeometry = new THREE.CylinderGeometry(0.02, 0.02, scale * 0.3);
      const stemMaterial = new THREE.MeshStandardMaterial({ color: "#228b22" });
      const stem = new THREE.Mesh(stemGeometry, stemMaterial);
      stem.position.y = scale * 0.15;
      group.add(stem);

      const petalsGeometry = new THREE.SphereGeometry(scale * 0.15, 8, 6);
      const petalsMaterial = new THREE.MeshStandardMaterial({ color });
      const petals = new THREE.Mesh(petalsGeometry, petalsMaterial);
      petals.position.y = scale * 0.3;
      group.add(petals);
      break;

    case "bushes":
      // Bush: multiple overlapping spheres
      for (let i = 0; i < 3; i++) {
        const bushGeometry = new THREE.SphereGeometry(
          scale * (0.3 + i * 0.2),
          8,
          6
        );
        const bushMaterial = new THREE.MeshStandardMaterial({
          color: i === 0 ? color : adjustColor(color, -20),
        });
        const bush = new THREE.Mesh(bushGeometry, bushMaterial);
        bush.position.y = scale * (0.2 + i * 0.15);
        bush.position.x = (i - 1) * scale * 0.1;
        bush.position.z = (i - 1) * scale * 0.1;
        group.add(bush);
      }
      break;

    case "trees":
      // Tree: trunk + cone for leaves
      const trunkGeometry = new THREE.CylinderGeometry(
        scale * 0.1,
        scale * 0.15,
        scale * 0.6
      );
      const trunkMaterial = new THREE.MeshStandardMaterial({
        color: "#8b4513",
      });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.y = scale * 0.3;
      group.add(trunk);

      const leavesGeometry = new THREE.ConeGeometry(
        scale * 0.4,
        scale * 0.8,
        8
      );
      const leavesMaterial = new THREE.MeshStandardMaterial({
        color: "#228b22",
      });
      const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
      leaves.position.y = scale * 0.8;
      group.add(leaves);
      break;

    case "rocks":
      // Rock: irregular shape using box geometry
      const rockGeometry = new THREE.BoxGeometry(
        scale * 0.4,
        scale * 0.3,
        scale * 0.5
      );
      const rockMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.9,
        metalness: 0.1,
      });
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);
      rock.position.y = scale * 0.15;
      // Add some random rotation for natural look
      rock.rotation.x = Math.random() * 0.2;
      rock.rotation.z = Math.random() * 0.2;
      group.add(rock);
      break;
  }

  group.position.set(...position);
  group.rotation.y = rotation;
  group.scale.setScalar(scale);

  return group;
}

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const num = parseInt(color.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
