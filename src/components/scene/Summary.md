# Scene Components Summary

This directory contains React Three Fiber components that manage the 3D scene, object placement, selection, and transformation functionality.

## Exported Components

### [`Ground`](./Ground.tsx:4)

- **Type**: React Functional Component
- **Purpose**: Renders a ground plane with grass texture
- **Props**: None
- **Features**:
  - Creates procedural grass texture using canvas
  - Uses THREE.Mesh with plane geometry
  - Receives shadows from scene objects
  - Applies grass texture with repeat wrapping

### [`SceneObjects`](./SceneObjects.tsx:5)

- **Type**: React Functional Component
- **Purpose**: Renders all objects in the scene based on store state
- **Props**: None (uses store hooks)
- **Features**:
  - Maps over scene objects from store
  - Renders different object types: building, tree, wall, road, water
  - Adds selection highlights for non-road objects
  - Includes error handling with fallback visualization
  - Uses object-specific components from `@/components/objects`

### [`SceneWrapper`](./SceneWrapper.tsx:16)

- **Type**: React Functional Component
- **Purpose**: Main scene container with lighting, controls, and content
- **Props**:
  - `transformMode`: "translate" | "rotate" | "scale"
  - `setTransformMode`: (mode: "translate" | "rotate" | "scale) => void
- **Features**:
  - Sets up scene lighting (ambient + directional with shadows)
  - Renders ground, objects, selection/placement, and grid
  - Configures OrbitControls with camera constraints
  - Manages transform controls visibility
  - Uses GridContext for grid visibility

### [`SelectionAndPlacement`](./SelectionAndPlacement.tsx:9)

- **Type**: React Functional Component
- **Purpose**: Handles object selection, placement, and road drawing
- **Props**: None (uses multiple contexts and stores)
- **Features**:
  - Object selection via raycasting
  - Object placement with grid snapping
  - Road drawing with preview
  - Keyboard shortcuts (s=select, r=road, b=building, t=tree, w=wall, a=water)
  - Delete key functionality for removing objects
  - Escape/Enter key handling for drawing operations
  - Integration with GenericDrawingContext for road drawing

### [`TransformControlsManager`](./TransformControlsManager.tsx:11)

- **Type**: React Functional Component
- **Purpose**: Manages 3D transform controls for selected objects
- **Props**:
  - `mode`: "translate" | "rotate" | "scale"
  - `setMode`: (mode: "translate" | "rotate" | "scale) => void
  - `showTransformControls`: boolean
- **Features**:
  - Real-time object transformation updates
  - Grid snapping for position, rotation, and scale
  - Rotation snapping to 90-degree increments
  - Updates store state during and after transformations
  - Only renders when object is selected and controls are enabled

### [`TransparentGrid`](./TransparentGrid.tsx:12)

- **Type**: React Functional Component
- **Purpose**: Renders a transparent grid helper
- **Props**:
  - `size?: number` (default: 100)
  - `divisions?: number` (default: 100)
  - `color?: string` (default: "#888")
- **Features**:
  - Uses THREE.GridHelper
  - Transparent material with 0.6 opacity
  - Depth write disabled for proper transparency
  - Slightly elevated position to avoid z-fighting

## Exported Utilities

### [`utils.ts`](./utils.ts:1)

Contains utility functions for scene operations:

#### [`getWorldIntersection()`](./utils.ts:3)

- **Purpose**: Calculate world intersection point from mouse position
- **Params**:
  - `event`: PointerEvent
  - `canvas`: HTMLCanvasElement
  - `camera`: THREE.Camera
- **Returns**: THREE.Vector3 | null

#### [`snapToGrid()`](./utils.ts:19)

- **Purpose**: Snap position to grid if enabled
- **Params**:
  - `position`: THREE.Vector3
  - `gridSize`: number
  - `enabled`: boolean
- **Returns**: THREE.Vector3

#### [`checkCollision()`](./utils.ts:30)

- **Purpose**: Check for collisions between objects on grid
- **Params**:
  - `newPos`: [number, number, number]
  - `newGridWidth`: number
  - `newGridDepth`: number
  - `objects`: SceneObj[]
  - `gridSize`: number
  - `snapEnabled`: boolean
  - `excludeId?: string`
- **Returns**: boolean

## Dependencies

- **React**: Core React functionality
- **Three.js**: 3D rendering and math utilities
- **@react-three/fiber**: React renderer for Three.js
- **@react-three/drei**: Useful helpers for React Three Fiber
- **Zustand**: State management (via store hooks)
- **Contexts**: ToolContext, GridContext, GenericDrawingContext

## Usage Pattern

```typescript
import { SceneWrapper, SceneObjects, Ground } from "@/components/scene";

// Main scene container
<SceneWrapper
  transformMode={transformMode}
  setTransformMode={setTransformMode}
/>

// Individual components can be used separately
<Ground />
<SceneObjects />
```

## Key Features

- **Object Management**: Full CRUD operations for scene objects
- **Selection System**: Raycasting-based object selection
- **Transform Controls**: Interactive 3D transformation tools
- **Grid Snapping**: Precision placement with configurable grid
- **Road Drawing**: Interactive road creation with preview
- **Collision Detection**: Prevents object overlap
- **Keyboard Shortcuts**: Efficient tool switching and operations
- **Error Handling**: Graceful fallbacks for rendering errors
