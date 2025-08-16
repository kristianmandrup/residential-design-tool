// src/contexts/TerrainContext.tsx
import React, { createContext, useContext, useState, useCallback } from "react";
import * as THREE from "three";

export interface TerrainType {
  id: string;
  name: string;
  colors: string[];
  roughness: number;
  metalness: number;
  noiseScale: number;
  elevationRange: [number, number]; // [min, max] elevation for this terrain
}

export interface TerrainTexture {
  type: string;
  texture: THREE.CanvasTexture | null;
  mask: THREE.CanvasTexture | null;
}

export interface TerrainContextType {
  // Terrain types configuration
  terrainTypes: { [key: string]: TerrainType };
  currentTerrainType: string;

  // Terrain texture system
  terrainTextures: { [key: string]: TerrainTexture };

  // Terrain blending
  blendTerrainTypes: boolean;
  blendDistance: number;

  // Vegetation settings
  vegetationEnabled: boolean;
  vegetationDensity: number;

  // Methods
  setTerrainType: (type: string) => void;
  addTerrainType: (type: TerrainType) => void;
  updateTerrainType: (id: string, updates: Partial<TerrainType>) => void;
  removeTerrainType: (id: string) => void;

  setBlendTerrainTypes: (enabled: boolean) => void;
  setBlendDistance: (distance: number) => void;

  setVegetationEnabled: (enabled: boolean) => void;
  setVegetationDensity: (density: number) => void;

  generateTerrainTexture: (
    type: string,
    elevation: number
  ) => THREE.CanvasTexture | null;
  getTerrainTypeAtPosition: (x: number, z: number, elevation: number) => string;
}

const defaultTerrainTypes: { [key: string]: TerrainType } = {
  grass: {
    id: "grass",
    name: "Grass",
    colors: ["#5cb85c", "#7fd27f", "#4a944a"],
    roughness: 0.8,
    metalness: 0.1,
    noiseScale: 0.1,
    elevationRange: [0, 10],
  },
  sand: {
    id: "sand",
    name: "Sand",
    colors: ["#f4e4c1", "#e6d690", "#d4c08a"],
    roughness: 0.6,
    metalness: 0.05,
    noiseScale: 0.05,
    elevationRange: [-2, 3],
  },
  rock: {
    id: "rock",
    name: "Rock",
    colors: ["#8b7355", "#696969", "#5d4e37"],
    roughness: 0.9,
    metalness: 0.2,
    noiseScale: 0.2,
    elevationRange: [8, 20],
  },
  dirt: {
    id: "dirt",
    name: "Dirt",
    colors: ["#8b4513", "#a0522d", "#cd853f"],
    roughness: 0.7,
    metalness: 0.1,
    noiseScale: 0.15,
    elevationRange: [3, 12],
  },
  snow: {
    id: "snow",
    name: "Snow",
    colors: ["#ffffff", "#f0f8ff", "#e6f3ff"],
    roughness: 0.3,
    metalness: 0.8,
    noiseScale: 0.3,
    elevationRange: [15, 30],
  },
};

const TerrainContext = createContext<TerrainContextType | undefined>(undefined);

interface TerrainProviderProps {
  children: React.ReactNode;
}

export function TerrainProvider({ children }: TerrainProviderProps) {
  const [terrainTypes, setTerrainTypes] = useState<{
    [key: string]: TerrainType;
  }>(defaultTerrainTypes);
  const [currentTerrainType, setCurrentTerrainType] = useState<string>("grass");
  const [terrainTextures, setTerrainTextures] = useState<{
    [key: string]: TerrainTexture;
  }>({});
  const [blendTerrainTypes, setBlendTerrainTypes] = useState<boolean>(true);
  const [blendDistance, setBlendDistance] = useState<number>(2.0);
  const [vegetationEnabled, setVegetationEnabled] = useState<boolean>(true);
  const [vegetationDensity, setVegetationDensity] = useState<number>(0.1);

  const setTerrainType = useCallback(
    (type: string) => {
      if (terrainTypes[type]) {
        setCurrentTerrainType(type);
      }
    },
    [terrainTypes]
  );

  const addTerrainType = useCallback((type: TerrainType) => {
    setTerrainTypes((prev) => ({
      ...prev,
      [type.id]: type,
    }));
  }, []);

  const updateTerrainType = useCallback(
    (id: string, updates: Partial<TerrainType>) => {
      setTerrainTypes((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          ...updates,
        },
      }));
    },
    []
  );

  const removeTerrainType = useCallback((id: string) => {
    setTerrainTypes((prev) => {
      const newTypes = { ...prev };
      delete newTypes[id];
      return newTypes;
    });
  }, []);

  const generateTerrainTexture = useCallback(
    (type: string, elevation: number = 0): THREE.CanvasTexture | null => {
      const terrainType = terrainTypes[type];
      if (!terrainType) return null;

      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      // Base color
      const baseColor = terrainType.colors[0];
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, 512, 512);

      // Add texture variations
      const numVariations = Math.floor(500 * (1 + terrainType.noiseScale));
      for (let i = 0; i < numVariations; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 3 + 1;
        const colors = terrainType.colors;
        ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Add noise/detail
      ctx.fillStyle = `rgba(0, 0, 0, ${0.05 * terrainType.roughness})`;
      for (let i = 0; i < 200; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        ctx.fillRect(x, y, 1, 1);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(20, 20);
      texture.anisotropy = 16;

      return texture;
    },
    [terrainTypes]
  );

  const getTerrainTypeAtPosition = useCallback(
    (x: number, z: number, elevation: number): string => {
      // Find terrain type based on elevation
      for (const [type, terrainType] of Object.entries(terrainTypes)) {
        const [minElevation, maxElevation] = terrainType.elevationRange;
        if (elevation >= minElevation && elevation <= maxElevation) {
          return type;
        }
      }

      // Default to grass if no elevation range matches
      return "grass";
    },
    [terrainTypes]
  );

  const value: TerrainContextType = {
    terrainTypes,
    currentTerrainType,
    terrainTextures,
    blendTerrainTypes,
    blendDistance,
    vegetationEnabled,
    vegetationDensity,

    setTerrainType,
    addTerrainType,
    updateTerrainType,
    removeTerrainType,

    setBlendTerrainTypes,
    setBlendDistance,

    setVegetationEnabled,
    setVegetationDensity,

    generateTerrainTexture,
    getTerrainTypeAtPosition,
  };

  return (
    <TerrainContext.Provider value={value}>{children}</TerrainContext.Provider>
  );
}

export function useTerrain() {
  const context = useContext(TerrainContext);
  if (context === undefined) {
    throw new Error("useTerrain must be used within a TerrainProvider");
  }
  return context;
}
