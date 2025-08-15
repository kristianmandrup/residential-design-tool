# Objects Configs Summary

This directory contains configuration objects for different object types, defining their physical properties, visual appearance, and behavior settings. These configs are used by drawing behaviors, object components, and visual systems.

## Exported Configurations

### Road Configs

#### [`ROAD_CONFIGS`](./roadConfigs.ts:1)

- **Type**: `Record<RoadType, RoadConfig>`
- **Purpose**: Configuration definitions for different road types
- **Variants**:
  - **residential**: Standard residential roads (6m wide)
  - **highway**: Major highways (8m wide)
  - **dirt**: Unpaved dirt roads (4m wide)
  - **pedestrian**: Pedestrian walkways (2m wide)

#### [`RoadType`](./roadConfigs.ts:135)

- **Type**: `keyof typeof ROAD_CONFIGS`
- **Purpose**: TypeScript type for road type enumeration
- **Values**: `"residential" | "highway" | "dirt" | "pedestrian"`

#### Road Configuration Structure:

```typescript
{
  width: number; // Road width in meters
  color: string; // Base road color
  elevation: number; // Road elevation above ground
  thickness: number; // Road thickness
  visualConfig: {
    // Visual appearance settings
    centerLine: MarkingConfig; // Center line markings
    sideLines: MarkingConfig; // Side line markings
    surfaces: SurfaceConfig; // Surface material properties
    curbs: CurbConfig; // Curb settings
  }
}
```

### Wall Configs

#### [`WALL_CONFIGS`](./wallConfigs.ts:1)

- **Type**: `Record<WallType, WallConfig>`
- **Purpose**: Configuration definitions for different wall types
- **Variants**:
  - **brick**: Brick walls (20cm thick, 2m high)
  - **concrete**: Concrete walls (25cm thick, 2.5m high)
  - **wood**: Wooden fences (15cm thick, 1.8m high)
  - **stone**: Stone walls (30cm thick, 2.2m high)

#### [`WallType`](./wallConfigs.ts:82)

- **Type**: `keyof typeof WALL_CONFIGS`
- **Purpose**: TypeScript type for wall type enumeration
- **Values**: `"brick" | "concrete" | "wood" | "stone"`

#### Wall Configuration Structure:

```typescript
{
  color: string; // Wall color
  thickness: number; // Wall thickness in meters
  height: number; // Wall height in meters
  visualConfig: {
    // Visual appearance settings
    edges: MarkingConfig; // Edge markings and lines
    surfaces: SurfaceConfig; // Surface material properties
  }
}
```

### Water Configs

#### [`WATER_CONFIGS`](./waterConfigs.ts:1)

- **Type**: `Record<WaterType, WaterConfig>`
- **Purpose**: Configuration definitions for different water types
- **Variants**:
  - **pond**: Small ponds (80% transparency, 5cm waves)
  - **lake**: Large lakes (70% transparency, 10cm waves)
  - **river**: Flowing rivers (60% transparency, 15cm waves)
  - **pool**: Swimming pools (90% transparency, 2cm waves)

#### [`WaterType`](./waterConfigs.ts:98)

- **Type**: `keyof typeof WATER_CONFIGS`
- **Purpose**: TypeScript type for water type enumeration
- **Values**: `"pond" | "lake" | "river" | "pool"`

#### Water Configuration Structure:

```typescript
{
  color: string; // Water color
  transparency: number; // Transparency value (0-1)
  waveHeight: number; // Wave height in meters
  visualConfig: {
    // Visual appearance settings
    edges: MarkingConfig; // Edge markings
    centerLine: MarkingConfig; // Center line for rivers
    surfaces: SurfaceConfig; // Surface material properties
  }
}
```

## Configuration Interfaces

### [`MarkingConfig`](../shared/types.ts:9)

- **Purpose**: Configuration for road markings, lines, and edges
- **Properties**:
  - `enabled: boolean` - Whether the marking is enabled
  - `color: string` - Marking color
  - `width: number` - Marking width
  - `style: "solid" | "dashed"` - Line style
  - `dashLength?: number` - Dash length for dashed lines
  - `gapLength?: number` - Gap length for dashed lines
  - `offset?: number` - Offset from edge

### [`SurfaceConfig`](../shared/types.ts:30)

- **Purpose**: Configuration for surface material properties
- **Properties**:
  - `color: string` - Surface color
  - `roughness: number` - Material roughness (0-1)
  - `metalness: number` - Material metalness (0-1)
  - `emissive?: string` - Emissive color
  - `emissiveIntensity?: number` - Emissive intensity (0-1)

### [`CurbConfig`](../shared/types.ts:36)

- **Purpose**: Configuration for road curb properties
- **Properties**:
  - `enabled: boolean` - Whether curbs are enabled
  - `height: number` - Curb height
  - `width: number` - Curb width
  - `color: string` - Curb color

## Configuration Features

### Road-Specific Features

- **Marking Systems**: Configurable center lines, side lines, and curbs
- **Surface Properties**: Realistic material properties for different road types
- **Width Variations**: Different widths for different road classifications
- **Elevation Control**: Proper elevation above ground level

### Wall-Specific Features

- **Material Properties**: Realistic surface properties for different wall types
- **Edge Markings**: Configurable edge highlighting and definition
- **Dimension Standards**: Standardized thickness and height values
- **Visual Consistency**: Consistent appearance across wall types

### Water-Specific Features

- **Transparency Control**: Variable transparency for different water types
- **Wave Effects**: Configurable wave heights for realistic water appearance
- **Edge Definition**: Configurable edge marking styles
- **Emissive Properties**: Subtle glowing effects for water surfaces

## Usage Patterns

### Basic Configuration Access

```typescript
import {
  ROAD_CONFIGS,
  WALL_CONFIGS,
  WATER_CONFIGS,
} from "@/components/objects/configs";

// Access road configuration
const residentialRoad = ROAD_CONFIGS.residential;
const highwayRoad = ROAD_CONFIGS.highway;

// Access wall configuration
const brickWall = WALL_CONFIGS.brick;
const concreteWall = WALL_CONFIGS.concrete;

// Access water configuration
const pondWater = WATER_CONFIGS.pond;
const lakeWater = WATER_CONFIGS.lake;
```

### Type-Specific Usage

```typescript
import type {
  RoadType,
  WallType,
  WaterType,
} from "@/components/objects/configs";

function getRoadConfig(type: RoadType) {
  return ROAD_CONFIGS[type];
}

function getWallConfig(type: WallType) {
  return WALL_CONFIGS[type];
}

function getWaterConfig(type: WaterType) {
  return WATER_CONFIGS[type];
}
```

### Visual Configuration Usage

```typescript
// Use visual config in rendering
const visualConfig = ROAD_CONFIGS.residential.visualConfig;

// Apply center line settings
if (visualConfig.centerLine.enabled) {
  // Render center line with config settings
}

// Apply surface material
const material = new THREE.MeshStandardMaterial({
  color: visualConfig.surfaces.color,
  roughness: visualConfig.surfaces.roughness,
  metalness: visualConfig.surfaces.metalness,
});
```

## Dependencies

- **TypeScript**: Type definitions and interfaces
- **Shared Types**: Common configuration interfaces
- **Object Types**: Integration with store object types
- **Visual System**: Integration with rendering components

## Integration Points

### Drawing Behaviors

- Used by enhanced drawing behaviors for object creation
- Provides default values and variant configurations
- Supports type-specific drawing constraints

### Object Components

- Used by object rendering components for visual appearance
- Provides material and geometry configuration
- Supports selection and highlighting styles

### Panel Systems

- Used by property panels for UI controls
- Provides default values and validation ranges
- Supports type-specific property editors

### Preview Systems

- Used by preview generation for consistent appearance
- Provides visual configuration for preview objects
- Supports opacity and transparency settings

## Key Features

- **Type Safety**: Comprehensive TypeScript definitions
- **Consistency**: Uniform configuration structure across object types
- **Extensibility**: Easy to add new object types and variants
- **Performance**: Optimized configuration access patterns
- **Maintainability**: Centralized configuration management
- **Visual Fidelity**: Realistic material and appearance settings
