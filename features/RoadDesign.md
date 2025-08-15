# Road Drawing System Design

## Overview

The road drawing system allows users to create realistic road networks with different types of roads, proper elevation, and visual hierarchy. Roads are drawn as continuous paths with proper 3D geometry and realistic materials.

## Road Types

### 1. Residential Roads

- **Width**: 6m (default)
- **Color**: #404040 (dark gray)
- **Elevation**: 0.02m above ground
- **Thickness**: 0.08m
- **Use Case**: Standard suburban streets, neighborhood roads
- **Features**:
  - Center line markings (dashed yellow)
  - Side line markings (solid white)
  - Moderate elevation for clear separation from terrain
  - Crosswalk markings at intersections

### 2. Highway Roads

- **Width**: 8m (default)
- **Color**: #383838 (darker gray)
- **Elevation**: 0.03m above ground
- **Thickness**: 0.1m
- **Use Case**: High-speed arterials, main thoroughfares
- **Features**:
  - Prominent center line markings
  - Clear side demarcation
  - Highest elevation for visual prominence
  - No crosswalk markings (limited pedestrian access)

### 3. Dirt Roads

- **Width**: 4m (default)
- **Color**: #8B4513 (brown)
- **Elevation**: 0.01m above ground
- **Thickness**: 0.05m
- **Use Case**: Rural paths, unpaved access roads
- **Features**:
  - No road markings
  - Minimal elevation (nearly flush with terrain)
  - Thinnest profile for rustic appearance
  - Natural, earthy color

### 4. Pedestrian Paths

- **Width**: 2m (default)
- **Color**: #606060 (medium gray)
- **Elevation**: 0.015m above ground
- **Thickness**: 0.04m
- **Use Case**: Walking paths, bike lanes, sidewalks
- **Features**:
  - Side line markings only
  - Narrow width for foot traffic
  - Crosswalk markings where appropriate
  - Subtle elevation

## Drawing Process

### Starting a Road

1. Select the Road tool from the toolbar
2. Choose road type (Residential, Highway, Dirt, Pedestrian)
3. Adjust width if needed (2m - 12m range)
4. Click on the terrain to place the first point

### Continuing the Road

1. Click to place additional points
2. Each click extends the road path
3. Roads automatically generate smooth geometry between points
4. Visual preview shows the road as you draw

### Finishing the Road

1. **Double-click** to complete the road
2. **ESC** to cancel the current road
3. **Ctrl+U** to undo the last point

### Road Geometry

- Roads are generated as 3D meshes with proper thickness
- Smooth curves can be added between segments
- Automatic width calculation creates realistic road strips
- Proper normals ensure correct lighting and shadows

## Visual Features

### Elevation System

- Roads sit above the terrain at appropriate heights
- Different road types have different elevations for visual hierarchy
- Prevents z-fighting with the ground plane
- Creates realistic depth and shadow casting

### Road Markings

- Center lines (yellow, dashed for most road types)
- Side lines (white, solid)
- Markings render above the road surface
- Configurable per road type

### Selection Indicators

- **Green sphere**: Start point
- **Red sphere**: End point
- **Blue spheres**: Intermediate points
- **Yellow boxes**: Control points for curves
- Selection indicators appear above the road surface

### Materials and Lighting

- Realistic road surface materials with appropriate roughness
- Proper metalness values for asphalt vs dirt
- Responsive to scene lighting
- Subtle emissive glow when selected

## Technical Implementation

### Geometry Generation

```typescript
// Roads are generated as extruded strips with proper thickness
const roadGeometry = generateRoadGeometry(
  points, // Array of RoadPoint coordinates
  width, // Road width in meters
  elevation, // Height above terrain
  thickness // Road depth/thickness
);
```

### State Management

- Road drawing state is managed in `SelectionAndPlacement.tsx`
- UI controls connect through `useRoadDrawingControls()` hook
- Real-time preview during drawing
- Persistent road objects in scene store

### Coordinate System

- Roads use world coordinates (X, Z plane)
- Y-axis represents elevation above terrain
- Grid snapping available for precise alignment
- Sub-meter precision for smooth curves

## User Interface

### Road Drawing Panel

- **Road Type Selector**: 2x2 grid of road type buttons
- **Width Control**: Slider (2-12m) + numeric input
- **Drawing Status**: Real-time feedback and point count
- **Control Buttons**: Undo, Cancel during drawing

### Visual Feedback

- **Preview Mode**: Semi-transparent road preview while drawing
- **Point Indicators**: Colored spheres for different point types
- **Instructions**: Context-sensitive help text
- **Progress Display**: Current point count and next action

### Keyboard Shortcuts

- **ESC**: Cancel current road drawing
- **Ctrl+U**: Undo last point
- **Double-click**: Finish road
- **R**: Switch to road tool (when implemented)

## Best Practices

### Road Layout

1. Start with main arterials (highways)
2. Add residential connectors
3. Include pedestrian paths where needed
4. Use dirt roads for rural/natural areas

### Visual Hierarchy

1. Highways should be most prominent (highest, widest)
2. Residential roads for neighborhood structure
3. Pedestrian paths for detail and accessibility
4. Dirt roads for natural/rural character

### Performance Considerations

- Roads use optimized geometry generation
- Efficient batching for road markings
- LOD system for distant roads (future enhancement)
- Reasonable polygon counts for complex networks

## Future Enhancements

### Planned Features

- **Curved Segments**: Bezier curve support for smooth turns
- **Intersections**: Automatic intersection detection and generation
- **Road Networks**: Connectivity analysis and optimization
- **Traffic Elements**: Stop signs, traffic lights, crosswalks
- **Elevation Profiles**: Hills, bridges, underpasses

### Advanced Materials

- **Texture Mapping**: Asphalt, concrete, dirt textures
- **Wear Patterns**: Realistic road aging and weathering
- **Seasonal Variants**: Snow, rain effects on road appearance
- **Night Mode**: Reflective markings and street lighting

This design ensures roads look realistic, professional, and integrate seamlessly with the 3D environment while providing an intuitive drawing experience.
