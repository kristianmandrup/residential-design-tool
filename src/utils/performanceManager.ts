import * as THREE from "three";
import { SceneObj } from "@/store/storeTypes";
import { useEffect, useState } from "react";

export class PerformanceManager {
  private static instance: PerformanceManager;
  private geometryCache = new Map<string, THREE.BufferGeometry>();
  private materialCache = new Map<string, THREE.Material>();
  private textureCache = new Map<string, THREE.Texture>();
  private instancedMeshes = new Map<string, THREE.InstancedMesh>();

  // Performance monitoring
  private renderStats = {
    frameCount: 0,
    lastFPSCheck: Date.now(),
    currentFPS: 0,
    averageFPS: 0,
    triangleCount: 0,
    drawCalls: 0,
  };

  static getInstance(): PerformanceManager {
    if (!this.instance) {
      this.instance = new PerformanceManager();
    }
    return this.instance;
  }

  // Enhanced geometry caching with cleanup
  getCachedGeometry(
    key: string,
    generator: () => THREE.BufferGeometry
  ): THREE.BufferGeometry {
    if (this.geometryCache.has(key)) {
      return this.geometryCache.get(key)!.clone();
    }

    const geometry = generator();
    this.geometryCache.set(key, geometry);

    // Limit cache size
    if (this.geometryCache.size > 50) {
      this.cleanupOldestCache("geometry");
    }

    return geometry.clone();
  }

  // Enhanced material caching
  getCachedMaterial(
    key: string,
    generator: () => THREE.Material
  ): THREE.Material {
    if (this.materialCache.has(key)) {
      return this.materialCache.get(key)!.clone();
    }

    const material = generator();
    this.materialCache.set(key, material);

    if (this.materialCache.size > 30) {
      this.cleanupOldestCache("material");
    }

    return material.clone();
  }

  // Instanced rendering for repeated objects
  getInstancedMesh(
    type: string,
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    count: number
  ): THREE.InstancedMesh {
    const key = `${type}_${count}`;

    if (this.instancedMeshes.has(key)) {
      return this.instancedMeshes.get(key)!;
    }

    const mesh = new THREE.InstancedMesh(geometry, material, count);
    this.instancedMeshes.set(key, mesh);
    return mesh;
  }

  // Performance monitoring
  updateFrameStats() {
    this.renderStats.frameCount++;
    const now = Date.now();
    const deltaTime = now - this.renderStats.lastFPSCheck;

    if (deltaTime >= 1000) {
      this.renderStats.currentFPS = Math.round(
        (this.renderStats.frameCount * 1000) / deltaTime
      );
      this.renderStats.averageFPS = Math.round(
        (this.renderStats.averageFPS + this.renderStats.currentFPS) / 2
      );
      this.renderStats.frameCount = 0;
      this.renderStats.lastFPSCheck = now;
    }
  }

  getPerformanceStats() {
    return {
      ...this.renderStats,
      cacheStats: {
        geometries: this.geometryCache.size,
        materials: this.materialCache.size,
        textures: this.textureCache.size,
        instancedMeshes: this.instancedMeshes.size,
      },
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  private estimateMemoryUsage(): {
    geometries: number;
    materials: number;
    total: number;
  } {
    let geometryMemory = 0;
    let materialMemory = 0;

    this.geometryCache.forEach((geometry) => {
      const attributes = geometry.attributes;
      Object.values(attributes).forEach((attr) => {
        geometryMemory += attr.array.byteLength;
      });
    });

    // Rough estimation for materials
    materialMemory = this.materialCache.size * 1024; // ~1KB per material

    return {
      geometries: Math.round(geometryMemory / 1024), // KB
      materials: Math.round(materialMemory / 1024), // KB
      total: Math.round((geometryMemory + materialMemory) / 1024), // KB
    };
  }

  private cleanupOldestCache(type: "geometry" | "material") {
    if (type === "geometry") {
      const firstKey = this.geometryCache.keys().next().value;
      if (firstKey) {
        const geometry = this.geometryCache.get(firstKey);
        geometry?.dispose();
        this.geometryCache.delete(firstKey);
      }
    } else {
      const firstKey = this.materialCache.keys().next().value;
      if (firstKey) {
        const material = this.materialCache.get(firstKey);
        material?.dispose();
        this.materialCache.delete(firstKey);
      }
    }
  }

  // Optimize scene objects
  optimizeSceneObjects(objects: SceneObj[]): {
    instanceGroups: Map<string, SceneObj[]>;
    recommendations: string[];
  } {
    const instanceGroups = new Map<string, SceneObj[]>();
    const recommendations: string[] = [];

    // Group similar objects for instancing
    objects.forEach((obj) => {
      const key = `${obj.type}_${JSON.stringify(obj.scale)}`;
      if (!instanceGroups.has(key)) {
        instanceGroups.set(key, []);
      }
      instanceGroups.get(key)!.push(obj);
    });

    // Generate recommendations
    instanceGroups.forEach((group) => {
      if (group.length > 5) {
        recommendations.push(
          `Consider instancing ${group.length} ${group[0].type} objects for better performance`
        );
      }
    });

    if (objects.length > 100) {
      recommendations.push(
        "Scene has many objects - consider LOD (Level of Detail) system"
      );
    }

    return { instanceGroups, recommendations };
  }

  clearAll() {
    this.geometryCache.forEach((geo) => geo.dispose());
    this.materialCache.forEach((mat) => mat.dispose());
    this.textureCache.forEach((tex) => tex.dispose());

    this.geometryCache.clear();
    this.materialCache.clear();
    this.textureCache.clear();
    this.instancedMeshes.clear();
  }
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  const [stats, setStats] = useState(
    PerformanceManager.getInstance().getPerformanceStats()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      PerformanceManager.getInstance().updateFrameStats();
      setStats(PerformanceManager.getInstance().getPerformanceStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return stats;
}
