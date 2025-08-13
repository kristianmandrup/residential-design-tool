export * from "./types";
export * from "./utils";
export * from "./selection";
export * from "./placement";
export * from "./road-drawing";
export * from "./deletion";

// Main event coordinator
import {
  PointerEventContext,
  StoreActions,
  SelectionState,
  RoadDrawingState,
  RoadDrawingActions,
  ToolState,
} from "./types";
import { createPointerEventData } from "./utils";
import { SelectionHandler } from "./selection";
import { PlacementHandler } from "./placement";
import { RoadDrawingHandler } from "./road-drawing";
import { DeletionHandler } from "./deletion";

export class PointerEventCoordinator {
  private selectionHandler: SelectionHandler;
  private placementHandler: PlacementHandler;
  private roadDrawingHandler: RoadDrawingHandler;
  private deletionHandler: DeletionHandler;

  constructor(
    private context: PointerEventContext,
    private storeActions: StoreActions,
    private selectionState: SelectionState,
    private roadState: RoadDrawingState,
    private roadActions: RoadDrawingActions,
    private toolState: ToolState
  ) {
    this.selectionHandler = new SelectionHandler(context, storeActions);
    this.placementHandler = new PlacementHandler(
      context,
      storeActions,
      toolState
    );
    this.roadDrawingHandler = new RoadDrawingHandler(
      context,
      storeActions,
      roadState,
      roadActions
    );
    this.deletionHandler = new DeletionHandler(
      context,
      storeActions,
      selectionState
    );
  }

  handlePointerDown = (event: PointerEvent): void => {
    // Prevent default behavior
    event.preventDefault();

    // Skip if right-click
    if (event.button === 2) return;

    // Create pointer event data
    const data = createPointerEventData(event, this.context);
    if (!data) return;

    // Handle based on current tool
    const { selectedTool } = this.toolState;

    switch (selectedTool) {
      case "road":
        if (this.roadDrawingHandler.handleRoadDrawing(data)) return;
        break;

      case "select":
        if (this.selectionHandler.handleSelection(data)) return;
        break;

      default:
        // Try placement for other tools
        if (this.placementHandler.handlePlacement(data)) return;
        // If placement fails, fall back to selection
        this.selectionHandler.handleSelection(data);
        break;
    }
  };

  handleKeyDown = (event: KeyboardEvent): void => {
    switch (event.key.toLowerCase()) {
      case "delete":
      case "backspace":
        this.deletionHandler.handleDeletion();
        break;

      case "escape":
        if (this.roadState.isDrawingRoad) {
          this.roadDrawingHandler.cancelRoadDrawing();
        }
        break;

      case "u":
        if (this.roadState.isDrawingRoad && event.ctrlKey) {
          event.preventDefault();
          this.roadDrawingHandler.undoLastPoint();
        }
        break;
    }
  };

  // Public methods for external control
  public cancelRoadDrawing(): void {
    this.roadDrawingHandler.cancelRoadDrawing();
  }

  public undoLastRoadPoint(): void {
    this.roadDrawingHandler.undoLastPoint();
  }
}

// Hook for using the pointer event system
export function usePointerEventSystem(
  context: PointerEventContext,
  storeActions: StoreActions,
  selectionState: SelectionState,
  roadState: RoadDrawingState,
  roadActions: RoadDrawingActions,
  toolState: ToolState
) {
  const coordinator = new PointerEventCoordinator(
    context,
    storeActions,
    selectionState,
    roadState,
    roadActions,
    toolState
  );

  return {
    handlePointerDown: coordinator.handlePointerDown,
    handleKeyDown: coordinator.handleKeyDown,
    cancelRoadDrawing: coordinator.cancelRoadDrawing,
    undoLastRoadPoint: coordinator.undoLastRoadPoint,
  };
}
