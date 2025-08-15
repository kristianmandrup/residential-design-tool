# Objects Behaviors Summary

This directory contains enhanced drawing behaviors for different object types, providing specialized drawing logic, validation, and geometry generation for roads, walls, and water objects.

## Exported Behaviors

### [`enhancedRoadDrawingBehavior`](./enhancedRoadDrawingBehavior.ts:17)

- **Type**: EnhancedDrawingBehavior<RoadObj>
- **Purpose**: Specialized drawing behavior for road objects with curve support and intersection detection
- **Features**:
  - **Configuration**:
    - Type: "road"
    - Minimum points: 2
    - Curve support: enabled
    - Intersection support: enabled
    - Default road type: "residential"
    - Default width: 6m
    - Default elevation: 0.02m
    - Default thickness: 0.08m
  - **Validation**: Requires at least 2 valid points
  - **Object Creation**: Creates road objects with proper grid sizing based on bounds
  - **Preview Generation**: Provides visual preview with road-specific styling
  - **Instructions**: Dynamic instructions based on point count and curve capability
  - **Geometry Generation**: Uses specialized road geometry generator with path optimization
  - **Intersection Support**: Can intersect with roads, walls, and water objects
  - **Intersection Radius**: Calculated as road width / 2

### [`enhancedWallDrawingBehavior`](./enhancedWallDrawingBehavior.ts:16)

- **Type**: EnhancedDrawingBehavior<WallObj>
- **Purpose**: Specialized drawing behavior for wall objects with segment-based creation
- **Features**:
  - **Configuration**:
    - Type: "wall"
    - Minimum points: 2
    - Curve support: disabled
    - Intersection support: enabled
    - Default length: 4m
    - Default height: 2m
    - Default thickness: 0.2m
    - Default type: "concrete"
  - **Validation**: Requires at least 2 valid points
  - **Object Creation**: Creates individual wall segments between consecutive points
    - Calculates center position and rotation for each segment
    - Handles wall type-specific properties
    - Generates proper grid dimensions
  - **Preview Generation**: Shows wall segments with appropriate styling
  - **Instructions**: Simple point-to-point drawing instructions
  - **Geometry Generation**: Creates box geometry for each wall segment
    - Proper rotation and positioning
    - Vertex and index optimization
  - **Intersection Support**: Can intersect with roads and walls
  - **Intersection Radius**: Calculated as wall thickness / 2

### [`enhancedWaterDrawingBehavior`](./enhancedWaterDrawingBehavior.ts:16)

- **Type**: EnhancedDrawingBehavior<WaterObj>
- **Purpose**: Specialized drawing behavior for water objects with circular and rectangular shapes
- **Features**:
  - **Configuration**:
    - Type: "water"
    - Minimum points: 1
    - Maximum points: 4
    - Curve support: disabled
    - Intersection support: enabled
    - Default shape: "circular"
    - Default transparency: 0.8
    - Default wave height: 0.1
    - Default type: "pond"
  - **Validation**: Requires at least 1 valid point
  - **Object Creation**: Supports two modes:
    - **Single point**: Creates circular water with 2m radius
    - **Multiple points**: Creates rectangular water based on bounds
  - **Preview Generation**: Different preview modes based on point count
    - Single point: Circular preview
    - Multiple points: Rectangular preview
  - **Instructions**: Context-aware instructions for different drawing modes
  - **Geometry Generation**:
    - Circular: Uses THREE.CircleGeometry
    - Rectangular: Uses THREE.PlaneGeometry
    - Proper rotation and positioning
  - **Intersection Support**: Can intersect with roads and water objects
  - **Intersection Radius**: Fixed 1m radius for water intersections

## Behavior Interface

### [`EnhancedDrawingBehavior<T>`](../shared/types.ts:98)

- **Type**: Generic interface for object-specific drawing behaviors
- **Properties**:
  - `config`: Behavior configuration with defaults and variants
  - `validatePoints`: (points: DrawingPoint[]) => boolean
  - `createObject`: (points: DrawingPoint[], variant?: string) => T
  - `getPreview`: (points: DrawingPoint[], variant?: string) => DrawingPreview
  - `getInstructions`: (pointCount: number) => string
  - `isFinished`: (points: DrawingPoint[], isDoubleClick: boolean, isEnterKey: boolean) => boolean
  - `generateGeometry`: (points: DrawingPoint[], variant?: string, elevation?: number) => ObjectGeometryResult
  - `getVisualConfig`: (variant?: string) => ObjectVisualConfig
  - `getIntersectionRadius`: (variant?: string) => number
  - `canIntersectWith`: (otherType: string) => boolean

## Dependencies

- **Store Types**: RoadObj, WallObj, WaterObj interfaces
- **Configuration**: Object-specific config imports
- **Shared Types**: EnhancedDrawingBehavior, DrawingPoint, DrawingPreview, etc.
- **Geometry**: Specialized geometry generators (road-specific)
- **Utilities**: GenericDrawingUtils for common operations

## Usage Pattern

```typescript
import { enhancedRoadDrawingBehavior } from "@/components/objects/behaviors";

// In drawing system
const behavior = enhancedRoadDrawingBehavior;

// Validate points
const isValid = behavior.validatePoints(points);

// Create object
const roadObject = behavior.createObject(points, "highway");

// Generate preview
const preview = behavior.getPreview(points, "residential");

// Check if drawing is complete
const isComplete = behavior.isFinished(points, isDoubleClick, isEnterKey);

// Generate geometry
const geometry = behavior.generateGeometry(points, "residential", elevation);
```

## Key Features

- **Type-Specific Logic**: Each behavior implements object-specific drawing rules
- **Variant Support**: Multiple variants per object type with different properties
- **Intersection System**: Built-in intersection detection and handling
- **Geometry Optimization**: Efficient geometry generation for each object type
- **Preview System**: Real-time visual feedback during drawing
- **Validation**: Comprehensive point validation for each object type
- **Grid Integration**: Proper grid sizing and positioning
- **Error Handling**: Graceful fallbacks for geometry generation failures

## Integration

These behaviors are used by the enhanced drawing system in:

- [`useEnhancedGenericDrawing`](../shared/enhancedGenericDrawing.ts:25) hook
- Object-specific drawing components
- Scene interaction handlers
- Preview and validation systems
