# Panels Components Summary

This directory contains React components that provide property panels for different object types in the scene. Each panel allows users to configure and modify object properties through a consistent UI pattern.

## Exported Components

### Main Object Panels

#### [`BuildingPanel`](./BuildingPanel.tsx:22)

- **Type**: React Functional Component
- **Purpose**: Property panel for building objects
- **Props**:
  - `building: BuildingObj` - The building object to configure
- **Features**:
  - **Basic Properties**: Position inputs and grid size configuration
  - **Building Configuration**: Floor count slider (1-10 floors) and roof type selection
  - **Colors**: Wall and roof color pickers with preset options
  - **Floor Settings**: Per-floor configuration including window toggles
  - **Statistics**: Total area and height calculations
  - **Quick Actions**: Reset roof and floor buttons

#### [`RoadPanel`](./RoadPanel.tsx:21)

- **Type**: React Functional Component
- **Purpose**: Property panel for road objects
- **Props**:
  - `road: RoadObj` - The road object to configure
- **Features**:
  - **Road Type**: Selection between residential, highway, dirt, and pedestrian roads
  - **Road Width**: Slider control (1-20m) with type-appropriate defaults
  - **Statistics**: Length and area calculations based on road points
  - **Quick Actions**: Reset type and width buttons

#### [`TreePanel`](./TreePanel.tsx:20)

- **Type**: React Functional Component
- **Purpose**: Property panel for tree objects
- **Props**:
  - `tree: TreeObj` - The tree object to configure
- **Features**:
  - **Tree Type**: Selection between oak, pine, maple, and palm trees
  - **Size**: Uniform scaling slider (0.5-3x) affecting all dimensions
  - **Foliage Color**: Color picker with 6 preset options
  - **Statistics**: Height and canopy area calculations
  - **Quick Actions**: Reset type and size buttons

#### [`WallPanel`](./WallPanel.tsx:21)

- **Type**: React Functional Component
- **Purpose**: Property panel for wall objects
- **Props**:
  - `wall: WallObj` - The wall object to configure
- **Features**:
  - **Wall Type**: Selection between concrete, brick, wood, and stone walls
  - **Length**: Slider control (0.5-20m)
  - **Height**: Slider control (0.5-5m) with type-appropriate defaults
  - **Statistics**: Surface area and thickness display
  - **Quick Actions**: Reset type and size buttons

#### [`WaterPanel`](./WaterPanel.tsx:21)

- **Type**: React Functional Component
- **Purpose**: Property panel for water objects
- **Props**:
  - `water: WaterObj` - The water object to configure
- **Features**:
  - **Water Type**: Selection between pond, lake, river, and pool
  - **Shape**: Toggle between circular and rectangular
  - **Size**: Radius control (circular) or size control (rectangular)
  - **Statistics**: Surface area and transparency percentage
  - **Quick Actions**: Reset type and size buttons

### Shared Components

#### [`CollapsibleSection`](./shared/CollapsibleSection.tsx:11)

- **Type**: React Functional Component
- **Purpose**: Reusable collapsible section container
- **Props**:
  - `title: string` - Section title
  - `children: React.ReactNode` - Section content
  - `defaultCollapsed?: boolean` (default: false)
  - `icon?: React.ReactNode` - Optional icon
  - `onToggle?: (collapsed: boolean) => void` - Toggle callback
  - `className?: string` - Additional CSS classes
- **Features**:
  - Animated collapse/expand with chevron icon
  - Custom styling with border and shadow
  - Callback support for toggle events
  - Accessible button-based interaction

#### [`GridSizeFields`](./shared/GridSizeFields.tsx:17)

- **Type**: React Functional Component
- **Purpose**: Input fields for grid dimension configuration
- **Props**:
  - `gridWidth?: number` (default: 2)
  - `gridDepth?: number` (default: 2)
  - `gridHeight?: number` (default: 1)
  - `onGridWidthChange: (value: number) => void`
  - `onGridDepthChange: (value: number) => void`
  - `onGridHeightChange: (value: number) => void`
  - `widthMin?: number` (default: 1), `widthMax?: number` (default: 10)
  - `depthMin?: number` (default: 1), `depthMax?: number` (default: 10)
  - `heightMin?: number` (default: 1), `heightMax?: number` (default: 5)
  - `showHeight?: boolean` (default: true)
- **Features**:
  - Number inputs with validation and min/max constraints
  - Optional height field toggle
  - Responsive grid layout
  - Proper labeling and accessibility

#### [`PositionInputs`](./shared/PositionInputs.tsx:7)

- **Type**: React Functional Component
- **Purpose**: Input fields for object position configuration
- **Props**:
  - `selected: SceneObj` - The selected object
  - `updateObject: (id: string, patch: Partial<SceneObj>) => void` - Update function
- **Features**:
  - X and Z position inputs (Y is typically fixed for ground objects)
  - Real-time object updates
  - Step increment of 0.1 for precision
  - Proper labeling and validation

## Dependencies

- **React**: Core React functionality
- **UI Components**: From `@/components/ui` (Card, Button, Select, Slider, Input, etc.)
- **Icons**: Lucide React icons
- **Store**: Zustand store hooks for state management
- **Utils**: Tailwind CSS classes and utility functions

## Common Patterns

### Panel Structure

All object panels follow a consistent structure:

1. **Card Container**: Standard card styling with header and content
2. **Header**: Title with object type badge and emoji icon
3. **Content Sections**: Organized using CollapsibleSection components
4. **Statistics**: Grid layout showing calculated metrics
5. **Quick Actions**: Reset buttons for common operations

### State Management

- All panels use `useSceneStore` for object updates
- Real-time updates via `updateObject` function
- Local state for UI controls (e.g., selected floor in BuildingPanel)

### Validation

- Input validation with min/max constraints
- Type safety with TypeScript interfaces
- Error handling for invalid values

## Usage Example

```typescript
import { BuildingPanel } from "@/components/panels";

// In a parent component that manages selected objects
{
  selectedObject?.type === "building" && (
    <BuildingPanel building={selectedObject as BuildingObj} />
  );
}
```

## Key Features

- **Consistent UI**: All panels follow the same design patterns
- **Type-Specific Configuration**: Each object type has relevant property controls
- **Real-time Updates**: Changes immediately update the scene
- **Statistics Display**: Calculated metrics for each object type
- **Reset Functionality**: Quick reset buttons for common operations
- **Responsive Design**: Mobile-friendly layouts
- **Accessibility**: Proper labeling and keyboard navigation
