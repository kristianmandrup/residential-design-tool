/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from "three";

// src/utils/performanceOptimizations.ts
export class EnhancedDrawingPerformance {
  private static instance: EnhancedDrawingPerformance;
  private geometryCache = new Map<string, THREE.BufferGeometry>();
  private materialCache = new Map<string, THREE.Material>();
  private intersectionCache = new Map<string, any[]>();

  static getInstance(): EnhancedDrawingPerformance {
    if (!this.instance) {
      this.instance = new EnhancedDrawingPerformance();
    }
    return this.instance;
  }

  // Cache geometry based on points hash
  getCachedGeometry(
    points: any[],
    width: number,
    elevation: number
  ): THREE.BufferGeometry | null {
    const key = this.generateGeometryKey(points, width, elevation);
    return this.geometryCache.get(key) || null;
  }

  setCachedGeometry(
    points: any[],
    width: number,
    elevation: number,
    geometry: THREE.BufferGeometry
  ): void {
    const key = this.generateGeometryKey(points, width, elevation);
    this.geometryCache.set(key, geometry);

    // Limit cache size
    if (this.geometryCache.size > 100) {
      const firstKey = this.geometryCache.keys().next().value;
      if (firstKey !== undefined) {
        const oldGeometry = this.geometryCache.get(firstKey);
        if (oldGeometry) {
          oldGeometry.dispose();
        }
        this.geometryCache.delete(firstKey);
      }
    }
  }

  private generateGeometryKey(
    points: any[],
    width: number,
    elevation: number
  ): string {
    const pointsHash = points
      .map((p) => `${p.x.toFixed(2)},${p.z.toFixed(2)}`)
      .join("|");
    return `${pointsHash}_${width}_${elevation}`;
  }

  // Clear caches
  clearCaches(): void {
    this.geometryCache.forEach((geometry) => geometry.dispose());
    this.materialCache.forEach((material) => material.dispose());
    this.geometryCache.clear();
    this.materialCache.clear();
    this.intersectionCache.clear();
  }

  // Performance monitoring
  getPerformanceStats() {
    return {
      geometryCache: this.geometryCache.size,
      materialCache: this.materialCache.size,
      intersectionCache: this.intersectionCache.size,
    };
  }
}
