/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/saveLoad.ts - Example save/load system with migration
import { useStore } from "@/store";
import { SceneObj } from "@/store/storeTypes";
import { ensureCompleteSceneObj } from "@/utils/typeMigration";

export interface SaveData {
  version: string;
  timestamp: number;
  objects: SceneObj[];
  metadata?: {
    name?: string;
    description?: string;
  };
}

export class SceneSaveLoad {
  private static VERSION = "1.0.0";

  static saveScene(
    objects: SceneObj[],
    metadata?: SaveData["metadata"]
  ): string {
    const saveData: SaveData = {
      version: this.VERSION,
      timestamp: Date.now(),
      objects,
      metadata,
    };

    return JSON.stringify(saveData, null, 2);
  }

  static loadScene(jsonData: string): SceneObj[] {
    try {
      const data = JSON.parse(jsonData);

      // Handle different data formats
      if (Array.isArray(data)) {
        // Old format - just an array of objects
        console.log("📁 Loading legacy format data");
        return this.migrateLegacyData(data);
      } else if (data.objects && Array.isArray(data.objects)) {
        // New format with metadata
        console.log(`📁 Loading scene v${data.version || "unknown"}`);
        return this.migrateLegacyData(data.objects);
      } else {
        throw new Error("Invalid save data format");
      }
    } catch (error: any) {
      console.error("❌ Failed to load scene:", error);
      throw new Error(`Failed to load scene: ${error.message}`);
    }
  }

  // 🔥 THIS IS WHERE MIGRATION UTILITIES ARE CRUCIAL
  private static migrateLegacyData(rawObjects: any[]): SceneObj[] {
    console.log(`🔄 Migrating ${rawObjects.length} objects...`);

    const migratedObjects: SceneObj[] = [];
    const errors: string[] = [];

    for (let i = 0; i < rawObjects.length; i++) {
      const rawObj = rawObjects[i];

      try {
        // 🔥 USE MIGRATION UTILITY HERE
        const migratedObj = ensureCompleteSceneObj(rawObj);
        migratedObjects.push(migratedObj);

        console.log(
          `✅ Migrated object ${i + 1}:`,
          migratedObj.type,
          migratedObj.name
        );
      } catch (error: any) {
        const errorMsg = `Failed to migrate object ${i + 1} (${
          rawObj?.type || "unknown"
        }): ${error.message}`;
        console.warn("⚠️", errorMsg);
        errors.push(errorMsg);
      }
    }

    if (errors.length > 0) {
      console.warn(
        `⚠️ Migration completed with ${errors.length} errors:`,
        errors
      );
      // You might want to show this to the user
    }

    console.log(
      `✅ Successfully migrated ${migratedObjects.length}/${rawObjects.length} objects`
    );
    return migratedObjects;
  }

  // Example usage methods
  static saveToLocalStorage(objects: SceneObj[], key: string = "scene-data") {
    try {
      const jsonData = this.saveScene(objects);
      localStorage.setItem(key, jsonData);
      console.log("💾 Scene saved to localStorage");
    } catch (error) {
      console.error("❌ Failed to save to localStorage:", error);
      throw error;
    }
  }

  static loadFromLocalStorage(key: string = "scene-data"): SceneObj[] {
    try {
      const jsonData = localStorage.getItem(key);
      if (!jsonData) {
        throw new Error("No saved data found");
      }

      const objects = this.loadScene(jsonData);
      console.log("📁 Scene loaded from localStorage");
      return objects;
    } catch (error) {
      console.error("❌ Failed to load from localStorage:", error);
      throw error;
    }
  }

  static downloadScene(objects: SceneObj[], filename?: string) {
    try {
      const jsonData = this.saveScene(objects, {
        name: filename || `Scene_${new Date().toISOString().split("T")[0]}`,
        description: `Scene exported on ${new Date().toLocaleString()}`,
      });

      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename || "scene"}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log("💾 Scene downloaded");
    } catch (error) {
      console.error("❌ Failed to download scene:", error);
      throw error;
    }
  }
}

// Example React hook for using this system
export function useSaveLoad() {
  const { objects, overwriteAll } = useStore();

  const saveScene = (filename?: string) => {
    try {
      SceneSaveLoad.saveToLocalStorage(objects);
      SceneSaveLoad.downloadScene(objects, filename);
      return true;
    } catch (error) {
      console.error("Save failed:", error);
      return false;
    }
  };

  const loadScene = (file?: File) => {
    if (file) {
      // Load from file
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = e.target?.result as string;
          const loadedObjects = SceneSaveLoad.loadScene(jsonData);
          overwriteAll(loadedObjects);
        } catch (error) {
          console.error("Load failed:", error);
        }
      };
      reader.readAsText(file);
    } else {
      // Load from localStorage
      try {
        const loadedObjects = SceneSaveLoad.loadFromLocalStorage();
        overwriteAll(loadedObjects);
        return true;
      } catch (error) {
        console.error("Load failed:", error);
        return false;
      }
    }
  };

  return { saveScene, loadScene };
}
