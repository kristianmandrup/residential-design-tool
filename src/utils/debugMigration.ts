/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/debugMigration.ts - Development tools
import { useStore } from "@/store";
import { SceneObj, RoadObj } from "@/store/storeTypes";
import { validateRoadObj, ensureCompleteSceneObj } from "@/utils/typeMigration";

export class DebugMigrationTools {
  /**
   * Analyzes all objects in the store and reports issues
   */
  static analyzeStore(objects: SceneObj[]): {
    total: number;
    valid: number;
    invalid: SceneObj[];
    incomplete: SceneObj[];
    roads: {
      total: number;
      valid: number;
      invalid: RoadObj[];
    };
  } {
    console.log("🔍 Analyzing store objects...");

    const invalid: SceneObj[] = [];
    const incomplete: SceneObj[] = [];
    const invalidRoads: RoadObj[] = [];

    let validCount = 0;
    let validRoadCount = 0;
    let totalRoadCount = 0;

    objects.forEach((obj) => {
      try {
        // Check if object is complete
        const completeObj = ensureCompleteSceneObj(obj as any);
        const wasIncomplete =
          JSON.stringify(obj) !== JSON.stringify(completeObj);

        if (wasIncomplete) {
          incomplete.push(obj);
          console.log("⚠️ Incomplete object:", obj.id, obj.type);
        }

        // Special validation for roads
        if (obj.type === "road") {
          totalRoadCount++;
          if (!validateRoadObj(obj as RoadObj)) {
            invalidRoads.push(obj as RoadObj);
            console.log("❌ Invalid road:", obj.id);
          } else {
            validRoadCount++;
          }
        }

        if (!wasIncomplete) {
          validCount++;
        }
      } catch (error: any) {
        invalid.push(obj);
        console.log("❌ Invalid object:", obj.id, obj.type, error.message);
      }
    });

    const report = {
      total: objects.length,
      valid: validCount,
      invalid,
      incomplete,
      roads: {
        total: totalRoadCount,
        valid: validRoadCount,
        invalid: invalidRoads,
      },
    };

    console.log("📊 Analysis Report:", report);
    return report;
  }

  /**
   * Fixes all issues found in the store
   */
  static fixStoreIssues(
    objects: SceneObj[],
    updateObject: (id: string, patch: Partial<SceneObj>) => void,
    removeObject: (id: string) => void
  ): {
    fixed: number;
    removed: number;
    errors: string[];
  } {
    console.log("🔧 Fixing store issues...");

    let fixedCount = 0;
    let removedCount = 0;
    const errors: string[] = [];

    objects.forEach((obj) => {
      try {
        const completeObj = ensureCompleteSceneObj(obj as any);
        const wasIncomplete =
          JSON.stringify(obj) !== JSON.stringify(completeObj);

        if (wasIncomplete) {
          // Special validation for roads
          if (obj.type === "road" && !validateRoadObj(completeObj as RoadObj)) {
            console.log("🗑️ Removing invalid road:", obj.id);
            removeObject(obj.id);
            removedCount++;
          } else {
            console.log("🔧 Fixing object:", obj.id, obj.type);
            updateObject(obj.id, completeObj);
            fixedCount++;
          }
        }
      } catch (error: any) {
        const errorMsg = `Failed to fix ${obj.id} (${obj.type}): ${error.message}`;
        errors.push(errorMsg);
        console.log("🗑️ Removing unfixable object:", obj.id);
        removeObject(obj.id);
        removedCount++;
      }
    });

    const result = { fixed: fixedCount, removed: removedCount, errors };
    console.log("🔧 Fix Results:", result);
    return result;
  }

  /**
   * Creates a detailed report of a specific object
   */
  static inspectObject(obj: any): {
    isValid: boolean;
    isComplete: boolean;
    issues: string[];
    suggestions: string[];
    completeVersion?: SceneObj;
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let isValid = false;
    let isComplete = false;
    let completeVersion: SceneObj | undefined;

    try {
      // Check basic structure
      if (!obj.id) issues.push("Missing ID");
      if (!obj.type) issues.push("Missing type");
      if (!obj.position) issues.push("Missing position");

      // Try to create complete version
      completeVersion = ensureCompleteSceneObj(obj);
      isComplete = JSON.stringify(obj) === JSON.stringify(completeVersion);

      if (!isComplete) {
        issues.push("Object is incomplete");
        suggestions.push("Use ensureCompleteSceneObj() to fix");
      }

      // Special checks for roads
      if (obj.type === "road") {
        if (!obj.points || obj.points.length < 2) {
          issues.push("Road has insufficient points");
          suggestions.push("Add more points or remove road");
        }

        if (obj.points) {
          const invalidPoints = obj.points.filter(
            (p: any) =>
              typeof p.x !== "number" ||
              typeof p.z !== "number" ||
              isNaN(p.x) ||
              isNaN(p.z)
          );
          if (invalidPoints.length > 0) {
            issues.push(`Road has ${invalidPoints.length} invalid points`);
            suggestions.push("Fix or remove invalid points");
          }
        }

        if (!obj.width || obj.width <= 0) {
          issues.push("Road has invalid width");
          suggestions.push("Set width to a positive number");
        }

        isValid = validateRoadObj(completeVersion as RoadObj);
      } else {
        isValid = true; // Other types are valid if they can be completed
      }
    } catch (error: any) {
      issues.push(`Failed to process object: ${error.message}`);
      suggestions.push("Object may need to be recreated or removed");
    }

    return {
      isValid,
      isComplete,
      issues,
      suggestions,
      completeVersion,
    };
  }
}

// React hook for using debug tools in development
export function useDebugMigration() {
  const { objects, updateObject, removeObject } = useStore();

  const analyzeStore = () => DebugMigrationTools.analyzeStore(objects);

  const fixAllIssues = () =>
    DebugMigrationTools.fixStoreIssues(objects, updateObject, removeObject);

  const inspectObject = (id: string) => {
    const obj = objects.find((o) => o.id === id);
    return obj ? DebugMigrationTools.inspectObject(obj) : null;
  };

  return {
    analyzeStore,
    fixAllIssues,
    inspectObject,
  };
}

// Console commands for development (you can call these from browser console)
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).debugMigration = DebugMigrationTools;
}
