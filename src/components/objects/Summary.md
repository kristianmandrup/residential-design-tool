# Objects Components Summary

This directory contains React Three Fiber components that render 3D objects in the scene, along with supporting infrastructure for enhanced drawing behaviors, visual configurations, and shared utilities.

## Exported Components

### Main Object Components

#### [`Building`](./BuildingObj.tsx:9)

- **Type**: React Functional Component
- **Purpose**: Renders multi-story building objects with floors, windows, and roofs
- **Props**:
  - `data: BuildingObj` - Building object configuration
- **Features**:
  - Multi-story rendering with configurable floor count
  - Per-floor window configuration with toggle controls
  - Dynamic window placement based on building dimensions
  - Roof rendering using separate RoofObj component
  - Selection highlighting with wireframe overlay
  - userData assignment for object identification
  - Emissive materials for selection feedback

#### [`Tree`](./TreeObj.tsx:9)

- **Type**: React Functional Component
- **Purpose**: Renders tree objects with trunk and foliage
- **Props**:
  - `data: TreeObj` - Tree object configuration
- **Features**:
  - Cylindrical trunk with tapered geometry
  - Spherical foliage with configurable color
  - Grid-based scaling for consistent sizing
  - Selection highlighting
  - userData assignment for object identification
  - Emissive materials for selection feedback

#### [`Road`](./EnhancedRoadObj.tsx:15)

- **Type**: React Functional Component (alias for EnhancedRoad)
- **Purpose**: Renders road objects with complex geometry and markings
- **Props**:
  - `data: RoadObj` - Road object with points and configuration
- **Features**:
  - Dynamic road geometry generation from point arrays
  - Configurable road types (residential, highway, dirt, pedestrian)
  - Center line and edge markings using GenericMarkings
  - Selection indicators with point visualization
  - Shadow casting and receiving
  - Intersection detection support
  - Development mode debugging indicators

#### [`Wall`](./EnhancedWallObj.tsx:16)

- **Type**: React Functional Component (alias for EnhancedWall)
- **Purpose**: Renders wall objects with configurable types and dimensions
- **Props**:
  - `data: WallObj` - Wall object configuration
- **Features**:
  - Wall type configuration (concrete, brick, wood, stone)
  - Dynamic length and height adjustment
  - Point-based positioning with rotation
  - Visual markings and selection indicators
  - userData assignment for object identification
  - Shadow casting and receiving

#### [`Water`](./EnhancedWaterObj.tsx:16)

- **Type**: React Functional Component (alias for EnhancedWater)
- **Purpose**: Renders water objects with transparency and shape options
- **Props**:
  - `data: WaterObj` - Water object configuration
- **Features**:
  - Shape support (circular and rectangular)
  - Transparency with configurable opacity
  - Water type configuration (pond, lake, river, pool)
  - Surface-level rendering with proper orientation
  - Selection indicators and visual feedback
  - userData assignment for object identification

#### [`Roof`](./RoofObj.tsx:9)

- **Type**: React Functional Component
- **Purpose**: Renders roof objects for buildings
- **Props**:
  - `type?: string` (default: "flat")
  - `color?: string` (default: "#666")
  - `width?: number` (default: 2.4)
  - `depth?: number` (default: 2.4)
- **Features**:
  - Multiple roof types: flat, gabled, hipped
  - Proportional sizing based on building dimensions
  - Proper positioning relative to building height
  - Material configuration for realistic appearance

### Shared Visual Components

#### [`GenericMarkings`](./shared/GenericMarkings.tsx:25)

- **Type**: React Functional Component
- **Purpose**: Renders road markings, curbs, and edge lines for various object types
- **Props**:
  - `centerLinePoints: THREE.Vector3[]` - Center line points
  - `pathPoints: THREE.Vector3[]` - Object path points
  - `visualConfig: ObjectVisualConfig` - Visual configuration
  - `objectWidth: number` - Object width
  - `objectElevation: number` - Object elevation
  - `objectThickness: number` - Object thickness
  - `objectType: string` - Object type ("road", "wall", "water")
- **Features**:
  - Dashed and solid line generation
  - Configurable dash patterns and spacing
  - Curb geometry generation
  - Type-specific elevation adjustments
  - Side lines and edge markings
  - Performance-optimized geometry generation

#### [`GenericSelectionIndicators`](./shared/GenericSelectionIndicators.tsx:31)

- **Type**: React Functional Component
- **Purpose**: Renders selection indicators for objects
- **Props**:
  - `points: DrawingPoint[]` - Object points
  - `isSelected: boolean` - Selection state
  - `objectElevation: number` - Object elevation
  - `objectThickness?: number` - Object thickness
  - `objectType: string` - Object type
  - `objectWidth?: number` - Object width
  - `objectDepth?: number` - Object depth
  - `config?: Partial<SelectionConfig>` - Custom configuration
- **Features**:
  - Point indicators with color coding (start/end/middle)
  - Control point visualization for curves
  - Path lines between points
  - Bounding box for complex objects
  - Direction arrows for linear objects
  - Object type indicators
  - Development mode debug information

#### [`GenericPreview`](./shared/GenericPreview.tsx:15)

- **Type**: React Functional Component
- **Purpose**: Renders preview geometry during object creation
- **Props**:
  - `preview: DrawingPreview` - Preview data
  - `generateGeometry?: Function` - Custom geometry generator
- **Features**:
  - Type-specific preview elevation
  - Point and control point visualization
  - Center line preview for multi-point objects
  - Ghost effects for single point objects
  - Construction guidelines
  - Fallback geometry generation
  - Transparent materials for preview effect

## Enhanced Drawing System

### [`useEnhancedGenericDrawing`](./shared/enhancedGenericDrawing.ts:25)

- **Type**: Custom React Hook
- **Purpose**: Provides enhanced drawing capabilities with visual features
- **Params**:
  - `state: EnhancedGenericDrawingState` - Drawing state
  - `actions: EnhancedGenericDrawingActions` - Drawing actions
  - `behavior: EnhancedDrawingBehavior` - Drawing behavior configuration
  - `gridSize?: number` - Grid size for snapping
  - `allObjects?: SceneObj[]` - All scene objects for intersection detection
- **Features**:
  - Intersection detection and optimization
  - Grid snapping with intersection snapping
  - Curve support with control points
  - Visual preview generation
  - Auto-optimization of object connections
  - Enhanced validation and error handling
  - Drawing instructions and feedback

## Configuration System

### Object Configs

- **Road Configs**: Type-specific road configurations with visual settings
- **Wall Configs**: Material and dimension configurations for wall types
- **Water Configs**: Transparency and appearance settings for water objects

### Drawing Behaviors

- **Enhanced Road Drawing**: Road-specific drawing behavior with intersection support
- **Enhanced Wall Drawing**: Wall drawing with type-specific constraints
- **Enhanced Water Drawing**: Water shape and size handling

## Type Definitions

### Core Types

- [`DrawingPoint`](./shared/types.ts:6): 2D point with optional control point
- [`ObjectVisualConfig`](./shared/types.ts:20): Visual configuration for objects
- [`MarkingConfig`](./shared/types.ts:9): Road marking configuration
- [`SelectionConfig`](./shared/types.ts:148): Selection indicator configuration
- [`EnhancedDrawingBehavior`](./shared/types.ts:98): Enhanced drawing behavior interface

### Geometry Types

- [`ObjectGeometryResult`](./shared/types.ts:53): Generated geometry data
- [`GenericIntersection`](./shared/types.ts:68): Intersection detection data
- [`ObjectSegment`](./shared/types.ts:87): Object segment data

## Dependencies

- **React**: Core React functionality
- **Three.js**: 3D rendering and math utilities
- **React Three Fiber**: React renderer for Three.js
- **Zustand**: State management for scene objects
- **Store Types**: TypeScript interfaces for object types

## Usage Patterns

### Basic Object Rendering

```typescript
import { Building, Tree, Road } from "@/components/objects";

// In scene rendering
<Building data={buildingData} />
<Tree data={treeData} />
<Road data={roadData} />
```

### Enhanced Drawing Hook

```typescript
import { useEnhancedGenericDrawing } from "@/components/objects/shared";

const drawing = useEnhancedGenericDrawing(state, actions, behavior);
```

### Visual Components

```typescript
import { GenericMarkings, GenericSelectionIndicators } from "@/components/objects/shared";

// In object components
<GenericMarkings {...markingProps} />
<GenericSelectionIndicators {...selectionProps} />
```

## Key Features

- **Modular Architecture**: Separate components for different object types
- **Enhanced Drawing**: Advanced drawing system with intersection detection
- **Visual Consistency**: Unified visual appearance across object types
- **Performance Optimized**: Efficient geometry generation and rendering
- **Type Safety**: Comprehensive TypeScript definitions
- **Extensibility**: Configurable behaviors and visual settings
- **Development Support**: Debug indicators and logging
