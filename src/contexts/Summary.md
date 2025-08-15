# Contexts Summary

This document provides a comprehensive overview of all React contexts available in the `src/contexts/` directory, including their exported types, functions, and usage patterns.

## Available Contexts

### 1. ToolContext (`src/contexts/ToolContext.tsx`)

**Purpose**: Manages the currently selected tool in the application.

#### Exported Types

```typescript
type Tool = "select" | "building" | "tree" | "wall" | "road" | "water" | null;

interface ToolState {
  selectedTool: Tool;
  setSelectedTool: (tool: Tool) => void;
}
```

#### Exported Functions

- `useTool()`: Hook to access the tool context
- `ToolProvider`: React provider component

#### Usage

```typescript
import { useTool } from "@/contexts";

const { selectedTool, setSelectedTool } = useTool();
setSelectedTool("building"); // Switch to building tool
```

---

### 2. GenericDrawingContext (`src/contexts/GenericDrawingContext.tsx`)

**Purpose**: Manages drawing state for roads, water, and walls with shared drawing behaviors.

#### Exported Types

```typescript
interface GenericDrawingState {
  isDrawingRoad: boolean;
  tempRoadPoints: DrawingPoint[];
  lastClickTime: number | null;
  selectedRoadType: string;
  roadWidth: number;
  snapToGrid: boolean;

  isDrawingWater: boolean;
  tempWaterPoints: DrawingPoint[];
  selectedWaterType: string;

  isDrawingWall: boolean;
  tempWallPoints: DrawingPoint[];
  selectedWallType: string;
}

interface GenericDrawingActions {
  // Road actions
  setIsDrawingRoad: (isDrawing: boolean) => void;
  setTempRoadPoints: (points: DrawingPoint[]) => void;
  setSelectedRoadType: (type: string) => void;
  setRoadWidth: (width: number) => void;
  cancelRoadDrawing: () => void;
  undoLastRoadPoint: () => void;

  // Water actions
  setIsDrawingWater: (isDrawing: boolean) => void;
  setTempWaterPoints: (points: DrawingPoint[]) => void;
  setSelectedWaterType: (type: string) => void;
  cancelWaterDrawing: () => void;
  undoLastWaterPoint: () => void;

  // Wall actions
  setIsDrawingWall: (isDrawing: boolean) => void;
  setTempWallPoints: (points: DrawingPoint[]) => void;
  setSelectedWallType: (type: string) => void;
  cancelWallDrawing: () => void;
  undoLastWallPoint: () => void;

  // Shared actions
  setLastClickTime: (time: number | null) => void;
  setSnapToGrid: (snap: boolean) => void;
  getInstructions: (type: "road" | "water" | "wall") => string;
}
```

#### Exported Functions

- `useGenericDrawingContext()`: Hook to access the drawing context
- `GenericDrawingProvider`: React provider component

#### Usage

```typescript
import { useGenericDrawingContext } from "@/contexts";

const {
  isDrawingRoad,
  tempRoadPoints,
  setIsDrawingRoad,
  setTempRoadPoints,
  cancelRoadDrawing,
  getInstructions,
} = useGenericDrawingContext();
```

---

### 3. GridContext (`src/contexts/GridContext.tsx`)

**Purpose**: Manages grid visibility and display settings.

#### Exported Types

```typescript
type GridContextType = {
  showGrid: boolean;
  toggleGrid: () => void;
};
```

#### Exported Functions

- `useGrid()`: Hook to access the grid context
- `GridProvider`: React provider component

#### Usage

```typescript
import { useGrid } from "@/contexts";

const { showGrid, toggleGrid } = useGrid();
```

---

### 4. LayoutContext (`src/contexts/LayoutContext.tsx`)

**Purpose**: Manages application layout including sidebar width and canvas dimensions.

#### Exported Types

```typescript
interface LayoutContextType {
  sidebarWidth: number;
  setSidebarWidth: (width: number) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  canvasWidth: number;
  setCanvasWidth: (width: number) => void;
}
```

#### Exported Functions

- `useLayout()`: Hook to access the layout context
- `LayoutProvider`: React provider component

#### Usage

```typescript
import { useLayout } from "@/contexts";

const {
  sidebarWidth,
  setSidebarWidth,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  canvasWidth,
} = useLayout();
```

---

### 5. EditorContext (`src/contexts/EditorContext.tsx`)

**Purpose**: Main editor context managing scene objects, selection, and editor settings.

#### Exported Types

```typescript
// Re-exported from storeTypes
export type {
  SceneObj,
  BuildingObj,
  TreeObj,
  RoadObj,
  WallObj,
  WaterObj,
  RoadPoint,
  RoofType,
  ObjType,
  Tool, // from ToolContext
};

// Aliases for convenience
export type SceneObject = SceneObj;
export type BuildingObject = BuildingObj;
export type TreeObject = TreeObj;
export type RoadObject = RoadObj;
export type WallObject = WallObj;
export type WaterObject = WaterObj;

interface EditorState {
  objects: SceneObj[];
  addObject: (obj: SceneObj) => void;
  updateObject: (id: string, patch: Partial<SceneObj>) => void;
  removeObject: (id: string) => void;
  selectedId: string | null;
  selectedIds: string[];
  setSelectedId: (id: string | null) => void;
  setSelectedIds: (ids: string[]) => void;
  // Scene settings
  gridSize: number;
  setGridSize: (size: number) => void;
  snapEnabled: boolean;
  setSnapEnabled: (enabled: boolean) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
}
```

#### Exported Functions

- `useEditor()`: Hook to access the editor context
- `EditorProvider`: React provider component

#### Usage

```typescript
import { useEditor } from "@/contexts";

const {
  objects,
  addObject,
  updateObject,
  removeObject,
  selectedId,
  selectedIds,
  setSelectedId,
  setSelectedIds,
  gridSize,
  setGridSize,
  snapEnabled,
  setSnapEnabled,
  showGrid,
  setShowGrid,
} = useEditor();
```

---

### 6. ElevationContext (`src/contexts/ElevationContext.tsx`)

**Purpose**: Manages elevation data for grid coordinates, allowing terrain height manipulation.

#### Exported Types

```typescript
interface ElevationContextType {
  gridElevation: { [key: string]: number }; // x,z -> elevation
  setGridElevation: (x: number, z: number, elevation: number) => void;
  getGridElevation: (x: number, z: number) => number;
  clearGridElevation: (x: number, z: number) => void;
  clearAllGridElevation: () => void;
  getGridElevationData: () => { [key: string]: number };
}
```

#### Exported Functions

- `useElevation()`: Hook to access the elevation context
- `ElevationProvider`: React provider component

#### Usage

```typescript
import { useElevation } from "@/contexts";

const {
  gridElevation,
  setGridElevation,
  getGridElevation,
  clearGridElevation,
  clearAllGridElevation,
  getGridElevationData,
} = useElevation();

// Set elevation for a grid coordinate
setGridElevation(5, 3, 2.5); // Set elevation at x=5, z=3 to 2.5

// Get elevation for a grid coordinate
const elevation = getGridElevation(5, 3); // Returns 2.5 or 0 if not set

// Clear elevation for a specific coordinate
clearGridElevation(5, 3);

// Clear all elevation data
clearAllGridElevation();

// Get all elevation data
const allElevationData = getGridElevationData();
```

---

## Index File (`src/contexts/index.ts`)

The index file re-exports all contexts for easy importing:

```typescript
export * from "./ToolContext";
export * from "./GenericDrawingContext";
export * from "./LayoutContext";
export * from "./GridContext";
export * from "./ElevationContext";
```

## Common Usage Patterns

### 1. Setting up providers in your app

```typescript
import {
  ToolProvider,
  GenericDrawingProvider,
  LayoutProvider,
  GridProvider,
  EditorProvider,
  ElevationProvider,
} from "@/contexts";

function App() {
  return (
    <ToolProvider>
      <GenericDrawingProvider>
        <LayoutProvider>
          <GridProvider>
            <EditorProvider>
              <ElevationProvider>{/* Your app components */}</ElevationProvider>
            </EditorProvider>
          </GridProvider>
        </LayoutProvider>
      </GenericDrawingProvider>
    </ToolProvider>
  );
}
```

### 2. Using multiple contexts in a component

```typescript
function MyComponent() {
  const { selectedTool } = useTool();
  const { isDrawingRoad } = useGenericDrawingContext();
  const { showGrid } = useGrid();
  const { objects } = useEditor();
  const { gridElevation } = useElevation();

  // Use all contexts together
  return (
    <div>
      <p>Current tool: {selectedTool}</p>
      <p>Drawing road: {isDrawingRoad ? "Yes" : "No"}</p>
      <p>Grid visible: {showGrid ? "Yes" : "No"}</p>
      <p>Objects in scene: {objects.length}</p>
      <p>Elevation points: {Object.keys(gridElevation).length}</p>
    </div>
  );
}
```

### 3. Type safety with context

```typescript
// All context hooks throw errors if used outside their providers
function SafeComponent() {
  try {
    const { selectedTool } = useTool();
    const { objects } = useEditor();
    // ... component logic
  } catch (error) {
    return <div>Error: {error.message}</div>;
  }
}
```

## Dependencies

- **React**: All contexts use React's Context API and hooks
- **nanoid**: Used by EditorContext for generating unique IDs
- **DrawingPoint**: Used by GenericDrawingContext (imported from `@/components/objects/shared/genericDrawing`)

## Best Practices

1. **Provider Order**: Ensure providers are nested in the correct order (outer to inner: Tool → GenericDrawing → Layout → Grid → Editor → Elevation)
2. **Error Handling**: Always wrap context hooks in try-catch or ensure they're used within their respective providers
3. **Type Safety**: Use the exported types for better TypeScript support
4. **Performance**: Context values are stable and won't cause unnecessary re-renders
5. **Modularity**: Each context has a single responsibility and can be used independently
