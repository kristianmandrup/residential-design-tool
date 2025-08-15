/* eslint-disable @typescript-eslint/no-explicit-any */
// File: src/utils/debugSystem.ts (New)
import { SceneObj } from "@/store/storeTypes";
import { PerformanceManager } from "./performanceManager";
import { useState } from "react";

export class DebugSystem {
  private static instance: DebugSystem;
  private debugMode = process.env.NODE_ENV === "development";
  private logs: Array<{
    timestamp: number;
    level: string;
    message: string;
    data?: any;
  }> = [];

  static getInstance(): DebugSystem {
    if (!this.instance) {
      this.instance = new DebugSystem();
    }
    return this.instance;
  }

  log(level: "info" | "warn" | "error", message: string, data?: any) {
    if (!this.debugMode) return;

    const logEntry = {
      timestamp: Date.now(),
      level,
      message,
      data,
    };

    this.logs.push(logEntry);

    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    // Console output with emoji
    const emoji = { info: "🔍", warn: "⚠️", error: "❌" }[level];
    console[level](`${emoji} [Debug] ${message}`, data || "");
  }

  analyzeScene(objects: SceneObj[]) {
    const analysis = {
      objectCounts: this.getObjectCounts(objects),
      performance: PerformanceManager.getInstance().getPerformanceStats(),
      issues: this.detectIssues(objects),
      recommendations: this.generateRecommendations(objects),
    };

    this.log("info", "Scene Analysis Complete", analysis);
    return analysis;
  }

  private getObjectCounts(objects: SceneObj[]) {
    const counts = objects.reduce((acc, obj) => {
      acc[obj.type] = (acc[obj.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      ...counts,
      total: objects.length,
    };
  }

  private detectIssues(objects: SceneObj[]): string[] {
    const issues: string[] = [];

    // Check for overlapping objects
    const positions = objects.map(
      (obj) => `${obj.position[0]},${obj.position[2]}`
    );
    const duplicatePositions = positions.filter(
      (pos, i, arr) => arr.indexOf(pos) !== i
    );
    if (duplicatePositions.length > 0) {
      issues.push(
        `${duplicatePositions.length} objects have overlapping positions`
      );
    }

    // Check for invalid roads
    const invalidRoads = objects.filter(
      (obj) => obj.type === "road" && (!obj.points || obj.points.length < 2)
    );
    if (invalidRoads.length > 0) {
      issues.push(`${invalidRoads.length} roads have insufficient points`);
    }

    // Check for extreme positions
    const extremeObjects = objects.filter(
      (obj) =>
        Math.abs(obj.position[0]) > 1000 || Math.abs(obj.position[2]) > 1000
    );
    if (extremeObjects.length > 0) {
      issues.push(
        `${extremeObjects.length} objects are positioned extremely far from origin`
      );
    }

    return issues;
  }

  private generateRecommendations(objects: SceneObj[]): string[] {
    const recommendations: string[] = [];

    if (objects.length > 50) {
      recommendations.push(
        "Consider using instanced rendering for repeated objects"
      );
    }

    if (objects.length > 200) {
      recommendations.push("Scene is large - consider implementing LOD system");
    }

    const roadCount = objects.filter((obj) => obj.type === "road").length;
    if (roadCount > 10) {
      recommendations.push(
        "Many roads detected - consider road intersection optimization"
      );
    }

    return recommendations;
  }

  exportDebugData() {
    const debugData = {
      timestamp: Date.now(),
      logs: this.logs,
      performance: PerformanceManager.getInstance().getPerformanceStats(),
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
    };

    const blob = new Blob([JSON.stringify(debugData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `debug-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  clearLogs() {
    this.logs = [];
  }
}

// React hook for debug panel
export function useDebugPanel() {
  const debugSystem = DebugSystem.getInstance();
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    setIsOpen,
    debugSystem,
    exportData: () => debugSystem.exportDebugData(),
    clearLogs: () => debugSystem.clearLogs(),
  };
}
