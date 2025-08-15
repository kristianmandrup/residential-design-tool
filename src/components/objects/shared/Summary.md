# Objects Shared Summary

This directory contains shared utilities, types, and components that provide the foundation for the generic drawing system. It includes type definitions, drawing hooks, intersection detection, and visual components that are reused across different object types.

## Exported Types and Interfaces

### [`DrawingPoint`](./types.ts:6)

- **Type**: `RoadPoint` (re-exported from store types)
- **Purpose**: Represents a point in 2D space with optional control point for curves
- **Properties**:
  - `x: number` - X coordinate
  - `z: number` - Z coordinate
  - `controlPoint?: { x: number; z: number }` - Optional control point for Bezier curves

### [`MarkingConfig`](./types.ts:9)

- **Type**: Interface
- **Purpose**: Configuration for road/water markings and visual elements
- **Properties**:
  - `enabled: boolean` - Whether marking is enabled
  - `color: string` - Marking color
  - `width: number` - Marking width
  - `style: "solid" | "dashed" | "dotted"` - Marking style
  - `dashLength?: number` - Length of dashes (for dashed style)
  - `gapLength?: number` - Length of gaps (for dashed style)
  - `offset?: number` - Distance from object edge

### [`ObjectVisualConfig`](./types.ts:20)

- **Type**: Interface
- **Purpose**: Comprehensive visual configuration for objects
- **Properties**:
  - `centerLine?: MarkingConfig` - Center line markings
  - `sideLines?: MarkingConfig` - Side line markings
  - `edges?: MarkingConfig` - Edge markings
  - `surfaces?` - Surface material properties (color, roughness, metalness, emissive)
  - `curbs?` - Curb configuration (enabled, height, width, color)

### [`DrawingPreview`](./types.ts:40)

- **Type**: Interface
- **Purpose**: Preview data for objects during drawing
- **Properties**:
  - `points: DrawingPoint[]` - Preview points
  - `type: string` - Object type
  - `color: string` - Preview color
  - `elevation?: number` - Preview elevation
  - `thickness?: number` - Preview thickness
  - `width?: number` - Preview width
  - `radius?: number` - Preview radius
  - `opacity?: number` - Preview opacity
  - `visualConfig?: ObjectVisualConfig` - Visual configuration

### [`ObjectGeometryResult`](./types.ts:53)

- **Type**: Interface
- **Purpose**: Result object from geometry generation
- **Properties**:
  - `mainGeometry: THREE.BufferGeometry` - Main object geometry
  - `pathPoints: THREE.Vector3[]` - Points along the path
  - `centerLinePoints: THREE.Vector3[]` - Points along center line
  - `bounds?` - Bounding box information

### [`GenericIntersection`](./types.ts:68)

- **Type**: Interface
- **Purpose**: Represents an intersection between multiple objects
- **Properties**:
  - `id: string` - Unique intersection ID
  - `position: { x: number; z: number }` - Intersection position
  - `connectedObjects: string[]` - IDs of connected objects
  - `objectTypes: string[]` - Types of connected objects
  - `type: "T-junction" | "cross" | "Y-junction" | "multi-way" | "L-corner" | "end"`
  - `angle: number` - Intersection angle
  - `radius: number` - Intersection radius
  - `elevation: number` - Intersection elevation
  - `visualConfig?: ObjectVisualConfig` - Visual configuration

### [`EnhancedDrawingBehavior`](./types.ts:98)

- **Type**: Interface
- **Purpose**: Enhanced drawing behavior with visual features
- **Properties**:
  - `config: ObjectTypeConfig` - Basic configuration
  - `validatePoints: (points: DrawingPoint[]) => boolean` - Point validation
  - `createObject: (points: DrawingPoint[], variant?: string, customProps?: Partial<T>) => T` - Object creation
  - `getPreview: (points: DrawingPoint[], variant?: string) => DrawingPreview | null` - Preview generation
  - `getInstructions: (pointCount: number) => string` - Drawing instructions
  - `isFinished: (points: DrawingPoint[], isDoubleClick: boolean, isEnterKey: boolean) => boolean` - Finish condition
  - `generateGeometry?: (points: DrawingPoint[], variant?: string, elevation?: number) => ObjectGeometryResult` - Geometry generation
  - `getVisualConfig?: (variant?: string) => ObjectVisualConfig` - Visual configuration getter
  - `getIntersectionRadius?: (variant?: string) => number` - Intersection radius
  - `canIntersectWith?: (otherType: string) => boolean` - Intersection compatibility

## Exported Hooks

### [`useEnhancedGenericDrawing()`](./enhancedGenericDrawing.ts:25)

- **Type**: `(state: EnhancedGenericDrawingState, actions: EnhancedGenericDrawingActions, behavior: EnhancedDrawingBehavior<T>, gridSize?: number, allObjects?: SceneObj[]) => EnhancedDrawingResult<T>`
- **Purpose**: Enhanced generic drawing hook with intersection detection and visual features
- **Parameters**:
  - `state: EnhancedGenericDrawingState` - Drawing state
  - `actions: EnhancedGenericDrawingActions` - Drawing actions
  - `behavior: EnhancedDrawingBehavior<T>` - Drawing behavior
  - `gridSize?: number` - Grid size for snapping (default: 1)
  - `allObjects?: SceneObj[]` - All scene objects for intersection detection
- **Returns**: [`EnhancedDrawingResult`](./types.ts:205) with enhanced drawing capabilities
- **Features**:
  - **Intersection Detection**: Real-time intersection detection with visual feedback
  - **Auto-Optimization**: Automatic object connection optimization at intersections
  - **Enhanced Preview**: Visual preview with configurable opacity and elevation
  - **Grid Snapping**: Configurable grid snapping with intersection snapping
  - **Curve Support**: Bezier curve support with control point visualization
  - **Visual Configuration**: Dynamic visual configuration based on object type
  - **State Management**: Comprehensive drawing state management
  - **Error Handling**: Robust error handling and validation

### [`useGenericDrawing()`](./genericDrawing.ts:124)

- **Type**: `(state: GenericDrawingState, actions: GenericDrawingActions, behavior: DrawingBehavior<T>, gridSize?: number) => GenericDrawingResult`
- **Purpose**: Legacy generic drawing hook (for backwards compatibility)
- **Features**: Basic drawing functionality without intersection detection

## Exported Visual Components

### [`GenericPreview`](./GenericPreview.tsx:15)

- **Type**: React Functional Component
- **Purpose**: Visual preview component for objects during drawing
- **Props**:
  - `preview: DrawingPreview` - Preview data
  - `generateGeometry?: (points: DrawingPoint[], variant?: string, elevation?: number) => ObjectGeometryResult` - Custom geometry generator
- **Features**:
  - **Point Indicators**: Color-coded point markers (green=start, red=end, blue=middle)
  - **Control Points**: Yellow control point indicators with connection lines
  - **Center Line**: Yellow center line visualization
  - **Construction Guidelines**: White guide lines between points
  - **Ghost Effect**: Semi-transparent preview for single-point objects
  - **Type-Specific Elevation**: Different elevations for roads, walls, and water
  - **Fallback Geometry**: Built-in fallback geometry generation

### [`GenericMarkings`](./GenericMarkings.tsx:25)

- **Type**: React Functional Component
- **Purpose**: Renders road markings, curbs, and visual elements
- **Props**:
  - `centerLinePoints: THREE.Vector3[]` - Center line points
  - `pathPoints: THREE.Vector3[]` - Object path points
  - `visualConfig: ObjectVisualConfig` - Visual configuration
  - `objectWidth: number` - Object width
  - `objectElevation: number` - Object elevation
  - `objectThickness: number` - Object thickness
  - `objectType: string` - Object type ("road", "wall", "water")
- **Features**:
  - **Dashed Lines**: Configurable dashed line generation with dash/gap patterns
  - **Solid Lines**: Solid center line rendering
  - **Side Lines**: Configurable side line positioning
  - **Curbs**: 3D curb geometry generation
  - **Edge Markings**: Edge markings for walls and water
  - **Type-Specific Rendering**: Different rendering logic for different object types
  - **3D Mesh Rendering**: Uses 3D meshes for dashes and curbs

### [`GenericSelectionIndicators`](./GenericSelectionIndicators.tsx:31)

- **Type**: React Functional Component
- **Purpose**: Visual indicators for selected objects
- **Props**:
  - `points: DrawingPoint[]` - Object points
  - `isSelected: boolean` - Whether object is selected
  - `objectElevation: number` - Object elevation
  - `objectThickness?: number` - Object thickness
  - `objectType: string` - Object type
  - `objectWidth?: number` - Object width
  - `objectDepth?: number` - Object depth
  - `config?: Partial<SelectionConfig>` - Selection configuration
- **Features**:
  - **Point Indicators**: Color-coded spheres for start/end/middle points
  - **Control Points**: Yellow box indicators for control points
  - **Path Lines**: Lines connecting points with different colors for curves
  - **Bounding Box**: Wireframe bounding box for complex objects
  - **Direction Arrows**: Direction indicators for linear objects
  - **Object Type Indicator**: Colored sphere indicating object type
  - **Debug Information**: Development-mode debug indicators

## Exported Intersection Functions

### [`detectGenericIntersections()`](./GenericIntersectionDetection.ts:211)

- **Type**: `(objects: GenericObjectData[], tolerance?: number) => GenericIntersection[]`
- **Purpose**: Detects intersections between multiple objects
- **Features**:
  - **Multi-Type Support**: Handles roads, walls, and water intersections
  - **Tolerance-Based**: Configurable tolerance for intersection detection
  - **Object Type Matrix**: Configurable intersection compatibility matrix
  - **Segment-Based**: Uses line segment intersection mathematics
  - **Intersection Classification**: Automatically classifies intersection types

### [`generateIntersectionGeometry()`](./GenericIntersectionDetection.ts:303)

- **Type**: `(intersection: GenericIntersection) => THREE.BufferGeometry`
- **Purpose**: Generates 3D geometry for intersection surfaces
- **Features**:
  - **Type-Specific Geometry**: Different geometry for different intersection types
  - **Proper Elevation**: Places intersections at correct elevation
  - **Radius Scaling**: Scales intersection size based on connected objects

### [`generateIntersectionMarkings()`](./GenericIntersectionDetection.ts:345)

- **Type**: `(intersection: GenericIntersection) => THREE.Group`
- **Purpose**: Generates visual markings for intersections
- **Features**:
  - **Road Markings**: Crosswalks and lane dividers for road intersections
  - **Wall Markings**: Corner reinforcements for wall intersections
  - **Water Markings**: Flow direction indicators for water intersections

### [`optimizeObjectConnections()`](./GenericIntersectionDetection.ts:495)

- **Type**: `(objects: GenericObjectData[], intersections: GenericIntersection[]) => GenericObjectData[]`
- **Purpose**: Optimizes object connections at intersections
- **Features**:
  - **Endpoint Snapping**: Snaps object endpoints to intersection centers
  - **Distance-Based**: Only snaps objects within configurable distance
  - **Non-Destructive**: Returns optimized copies without modifying originals

## Exported Utilities

### [`GenericDrawingUtils`](./genericDrawing.ts:68)

- **Type**: Static utility class
- **Purpose**: Common utility functions for drawing operations
- **Methods**:
  - `snapToGrid(x, z, gridSize, enabled)` - Snaps position to grid
  - `validatePoints(points)` - Validates point coordinates
  - `calculateBounds(points)` - Calculates bounding box from points
  - `generateId(type)` - Generates unique IDs

## Data Structures

### [`GenericObjectData`](./types.ts:163)

- **Type**: Interface
- **Purpose**: Generic object data for intersection detection
- **Properties**:
  - `id: string` - Object ID
  - `type: string` - Object type
  - `points: DrawingPoint[]` - Object points
  - `width?: number` - Object width
  - `elevation?: number` - Object elevation
  - `thickness?: number` - Object thickness
  - `variant?: string` - Object variant

### [`EnhancedGenericDrawingState`](./types.ts:174)

- **Type**: Interface
- **Purpose**: Enhanced drawing state
- **Properties**:
  - `isDrawing: boolean` - Whether currently drawing
  - `tempPoints: DrawingPoint[]` - Temporary points during drawing
  - `lastClickTime: number | null` - Last click time for double-click detection
  - `selectedType: T` - Selected object type
  - `snapToGrid: boolean` - Whether grid snapping is enabled
  - `showPreview: boolean` - Whether preview is shown
  - `showIntersections: boolean` - Whether intersection visualization is shown
  - `autoOptimize: boolean` - Whether auto-optimization is enabled

## Dependencies

- **React**: Core React functionality and hooks
- **Three.js**: 3D mathematics and geometry utilities
- **Store Types**: SceneObj and RoadPoint interfaces
- **Nanoid**: ID generation utility

## Usage Patterns

### Enhanced Drawing Hook

```typescript
import { useEnhancedGenericDrawing } from "@/components/objects/shared";

const result = useEnhancedGenericDrawing(
  state,
  actions,
  behavior,
  gridSize,
  allObjects
);

// Use enhanced features
const intersections = result.getIntersections();
const preview = result.getPreview();
const canIntersect = result.canIntersectWith("road");
```

### Preview Component

```typescript
import { GenericPreview } from "@/components/objects/shared";

<GenericPreview
  preview={previewData}
  generateGeometry={customGeometryGenerator}
/>;
```

### Intersection Detection

```typescript
import { detectGenericIntersections } from "@/components/objects/shared";

const intersections = detectGenericIntersections(objectData);
```

## Integration

The shared components are used by:

- **Object Behaviors**: All enhanced drawing behaviors
- **Object Components**: Road, wall, water, and other object components
- **Scene System**: Main scene interaction and selection
- **Panel System**: Property panels for object configuration
- **Geometry System**: Road geometry generation and intersection handling

## Assessment: Shared vs Geometry Folder

The `shared` and `geometry` folders serve different purposes:

### Shared Folder (`/shared`)

- **Purpose**: Generic drawing system foundation
- **Scope**: Cross-object utilities and interfaces
- **Features**: Drawing hooks, intersection detection, visual components
- **Reusability**: High - used by all object types

### Geometry Folder (`/geometry`)

- **Purpose**: Specialized geometry generation
- **Scope**: Road-specific geometry calculations
- **Features**: Bezier curves, road surface generation, preview geometry
- **Reusability**: Medium - could be extended for other path-based objects

**Conclusion**: Both folders are valuable and serve distinct purposes. The `shared` folder provides the generic foundation, while the `geometry` folder provides specialized mathematical calculations. They complement each other without significant overlap.
