/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  PointerEventContext,
  StoreActions,
  PointerEventData,
  ToolState,
} from "./types";
import { checkCollision, SceneObject } from "../SceneUtils";

export class PlacementHandler {
  constructor(
    private context: PointerEventContext,
    private actions: StoreActions,
    private toolState: ToolState
  ) {}

  handlePlacement(data: PointerEventData): boolean {
    const { selectedTool } = this.toolState;
    const { addObject } = this.actions;

    // Don't place if we're not in a placement tool
    if (selectedTool === "select" || selectedTool === "road") {
      return false;
    }

    const position: [number, number, number] = [
      data.snappedPosition.x,
      data.snappedPosition.y,
      data.snappedPosition.z,
    ];

    // Check for collisions based on object type
    const hasCollision = this.checkPlacementCollision(selectedTool!, position);
    if (hasCollision) {
      console.warn("Cannot place object - collision detected");
      return false;
    }

    // Create object based on tool type
    const objectData = this.createObjectData(selectedTool!, position);
    if (objectData) {
      addObject(objectData);
      return true;
    }

    return false;
  }

  private checkPlacementCollision(
    objectType: string,
    position: [number, number, number]
  ): boolean {
    const { objects, gridSize, snap } = this.context;

    // Get default grid dimensions for each object type
    const getGridDimensions = (type: string) => {
      switch (type) {
        case "building":
          return { width: 2, depth: 2 };
        case "tree":
          return { width: 1, depth: 1 };
        case "wall":
          return { width: 2, depth: 1 };
        case "water":
          return { width: 1, depth: 1 };
        default:
          return { width: 1, depth: 1 };
      }
    };

    const dimensions = getGridDimensions(objectType);
    return checkCollision(
      position,
      objectType,
      dimensions.width,
      dimensions.depth,
      objects as unknown as SceneObject[],
      gridSize,
      snap
    );
  }

  private createObjectData(
    toolType: string,
    position: [number, number, number]
  ): any {
    const baseData = {
      position,
      rotation: [0, 0, 0] as [number, number, number],
      scale: [1, 1, 1] as [number, number, number],
    };

    switch (toolType) {
      case "building":
        return {
          ...baseData,
          type: "building",
          floors: 2,
          color: "#d9d9d9",
          roofType: "gabled",
          roofColor: "#666666",
          gridWidth: 2,
          gridDepth: 2,
          gridHeight: 1,
        };

      case "tree":
        return {
          ...baseData,
          type: "tree",
          foliageColor: "#2E8B57",
          gridWidth: 1,
          gridDepth: 1,
          gridHeight: 1,
        };

      case "wall":
        return {
          ...baseData,
          type: "wall",
          length: 3,
          height: 1,
          gridWidth: 2,
          gridDepth: 1,
          gridHeight: 1,
        };

      case "water":
        return {
          ...baseData,
          type: "water",
          radius: 1,
          gridWidth: 1,
          gridDepth: 1,
          gridHeight: 0.1,
        };

      default:
        return null;
    }
  }
}
