// File: src/utils/saveLoadManager.ts (New)
import { SceneObj } from "@/store/storeTypes";
import { SceneSaveLoad, SaveData } from "./saveLoad";
import { DebugSystem } from "./debugSystem";
import { useState } from "react";

export class SaveLoadManager {
  private static instance: SaveLoadManager;
  private debugSystem = DebugSystem.getInstance();

  static getInstance(): SaveLoadManager {
    if (!this.instance) {
      this.instance = new SaveLoadManager();
    }
    return this.instance;
  }

  async saveScene(
    objects: SceneObj[],
    metadata?: { name?: string; description?: string }
  ) {
    try {
      this.debugSystem.log("info", "Saving scene", {
        objectCount: objects.length,
      });

      const saveData = SceneSaveLoad.saveScene(objects, {
        ...metadata,
        savedAt: new Date().toISOString(),
        objectCounts: this.getObjectCounts(objects),
      });

      // Save to localStorage as backup
      localStorage.setItem("last-save", saveData);

      // Create download
      const blob = new Blob([saveData], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      return { success: true, url, data: saveData };
    } catch (error) {
      this.debugSystem.log("error", "Save failed", error);
      return { success: false, error: error as Error };
    }
  }

  async loadScene(
    source: string | File
  ): Promise<{ success: boolean; objects?: SceneObj[]; error?: Error }> {
    try {
      let jsonData: string;

      if (typeof source === "string") {
        jsonData = source;
      } else {
        jsonData = await this.readFile(source);
      }

      this.debugSystem.log("info", "Loading scene from data");
      const objects = SceneSaveLoad.loadScene(jsonData);

      this.debugSystem.log("info", "Scene loaded successfully", {
        objectCount: objects.length,
        objectCounts: this.getObjectCounts(objects),
      });

      return { success: true, objects };
    } catch (error) {
      this.debugSystem.log("error", "Load failed", error);
      return { success: false, error: error as Error };
    }
  }

  async autoSave(objects: SceneObj[]) {
    try {
      const saveData = SceneSaveLoad.saveScene(objects, {
        name: "Auto Save",
        description: `Auto-saved at ${new Date().toLocaleString()}`,
        isAutoSave: true,
      });

      localStorage.setItem("auto-save", saveData);
      localStorage.setItem("auto-save-timestamp", Date.now().toString());

      this.debugSystem.log("info", "Auto-save completed", {
        objectCount: objects.length,
      });
    } catch (error) {
      this.debugSystem.log("error", "Auto-save failed", error);
    }
  }

  getAutoSaveData(): { data: SaveData; timestamp: number } | null {
    try {
      const data = localStorage.getItem("auto-save");
      const timestamp = localStorage.getItem("auto-save-timestamp");

      if (data && timestamp) {
        return {
          data: JSON.parse(data),
          timestamp: parseInt(timestamp),
        };
      }
    } catch (error) {
      this.debugSystem.log("error", "Failed to get auto-save data", error);
    }

    return null;
  }

  private readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  }

  private getObjectCounts(objects: SceneObj[]) {
    return objects.reduce((acc, obj) => {
      acc[obj.type] = (acc[obj.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }
}

// React hook for save/load operations
export function useSaveLoad() {
  const manager = SaveLoadManager.getInstance();
  const [isLoading, setIsLoading] = useState(false);
  const [lastSave, setLastSave] = useState<Date | null>(null);

  const saveScene = async (objects: SceneObj[], name?: string) => {
    setIsLoading(true);
    try {
      const result = await manager.saveScene(objects, { name });
      if (result.success) {
        setLastSave(new Date());

        // Trigger download
        const a = document.createElement("a");
        a.href = result.url!;
        a.download = `${name || "scene"}.json`;
        a.click();
        URL.revokeObjectURL(result.url!);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const loadScene = async (file: File) => {
    setIsLoading(true);
    try {
      return await manager.loadScene(file);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveScene,
    loadScene,
    autoSave: manager.autoSave.bind(manager),
    getAutoSaveData: manager.getAutoSaveData.bind(manager),
    isLoading,
    lastSave,
  };
}
