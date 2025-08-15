# Shared Components Summary

This directory contains reusable React components that provide common UI patterns used across the panel components. These components help maintain consistency, reduce duplication, and improve maintainability across all object panels.

## Exported Components

### [`CollapsibleSection`](./CollapsibleSection.tsx:11)

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

### [`PositionInputs`](./PositionInputs.tsx:7)

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

### [`GridSizeFields`](./GridSizeFields.tsx:17)

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

### [`ElevationControl`](./ElevationControl.tsx:11)

- **Type**: React Functional Component
- **Purpose**: Standard elevation slider with badge display
- **Props**:
  - `objectId: string` - Object ID for updates
  - `elevation?: number` (default: 0)
  - `label?: string` (default: "Elevation")
  - `min?: number` (default: -5), `max?: number` (default: 5)
  - `step?: number` (default: 0.1)
  - `className?: string` - Additional CSS classes
- **Features**:
  - Real-time elevation updates
  - Formatted value display with unit
  - Configurable range and precision
  - Consistent styling across panels

### [`QuickActions`](./QuickActions.tsx:7)

- **Type**: React Functional Component
- **Purpose**: Configurable grid of action buttons
- **Props**:
  - `actions: QuickAction[]` - Array of action configurations
  - `label?: string` (default: "Quick Actions")
  - `className?: string` - Additional CSS classes
- **Features**:
  - Configurable button layout (2-column grid)
  - Customizable button variants and sizes
  - Flexible action definitions
  - Consistent styling and spacing

### [`StatisticsGrid`](./StatisticsGrid.tsx:7)

- **Type**: React Functional Component
- **Purpose**: Flexible statistics display with customizable columns
- **Props**:
  - `statistics: Statistic[]` - Array of statistic configurations
  - `columns?: 2 | 3 | 4` (default: 2)
  - `className?: string` - Additional CSS classes
- **Features**:
  - Configurable grid layout (2-4 columns)
  - Customizable value formatting
  - Consistent card styling
  - Flexible label and unit display

### [`ColorPalette`](./ColorPalette.tsx:7)

- **Type**: React Functional Component
- **Purpose**: Grid-based color selection with optional labels
- **Props**:
  - `colors: ColorOption[]` - Array of color options
  - `selectedColor?: string` - Currently selected color
  - `onColorChange: (color: string) => void` - Selection callback
  - `className?: string` - Additional CSS classes
  - `size?: "sm" | "md" | "lg"` (default: "md")
  - `showLabels?: boolean` (default: false)
- **Features**:
  - Configurable color button sizes
  - Optional color labels
  - Visual selection feedback
  - Responsive grid layout

### [`TypeSelector`](./TypeSelector.tsx:7)

- **Type**: React Functional Component
- **Purpose**: Enhanced select dropdown with descriptions and icons
- **Props**:
  - `options: TypeOption[]` - Array of type options
  - `value: string` - Currently selected value
  - `onValueChange: (value: string) => void` - Selection callback
  - `label?: string` - Optional label text
  - `className?: string` - Additional CSS classes
  - `placeholder?: string` (default: "Select type...")
- **Features**:
  - Rich option display with icons and descriptions
  - Consistent styling with standard select components
  - Configurable labels and placeholders
  - Accessible keyboard navigation

### [`DimensionSlider`](./DimensionSlider.tsx:7)

- **Type**: React Functional Component
- **Purpose**: Slider with value badge and range labels
- **Props**:
  - `value: number` - Current value
  - `onValueChange: (value: number) => void` - Change callback
  - `label: string` - Display label
  - `unit?: string` (default: "m")
  - `min?: number` (default: 0.5), `max?: number` (default: 10)
  - `step?: number` (default: 0.5)
  - `className?: string` - Additional CSS classes
  - `showRangeLabels?: boolean` (default: false)
  - `formatValue?: (value: number) => string` - Custom value formatting
- **Features**:
  - Real-time value display with badge
  - Optional range labels
  - Customizable value formatting
  - Consistent styling across dimension controls

## Design Principles

### Consistency

- All components follow consistent naming conventions
- Uniform prop interfaces and styling patterns
- Consistent spacing and typography

### Flexibility

- Configurable props for different use cases
- Optional features that can be enabled/disabled
- Customizable styling through className props

### Type Safety

- Full TypeScript support with proper interfaces
- Strict type checking for props and callbacks
- Proper typing of generic components

### Accessibility

- Proper ARIA labels and keyboard navigation
- Semantic HTML structure
- Focus management and screen reader support

## Usage Examples

### ElevationControl

```typescript
import { ElevationControl } from "@/components/panels/shared";

<ElevationControl
  objectId={building.id}
  elevation={building.elevation}
  min={-10}
  max={10}
  step={0.05}
/>;
```

### StatisticsGrid

```typescript
import { StatisticsGrid } from "@/components/panels/shared";

<StatisticsGrid
  statistics={[
    { label: "Area", value: "150.5", unit: "m²" },
    { label: "Height", value: "12.3", unit: "m" },
    { label: "Volume", value: "1851.15", unit: "m³" },
  ]}
  columns={3}
/>;
```

### TypeSelector

```typescript
import { TypeSelector } from "@/components/panels/shared";

<TypeSelector
  options={[
    {
      value: "residential",
      label: "🏘️ Residential",
      description: "Standard suburban roads",
    },
    {
      value: "highway",
      label: "🛣️ Highway",
      description: "High-speed arterials",
    },
  ]}
  value={road.roadType}
  onValueChange={handleTypeChange}
  label="Road Type"
/>;
```

## Dependencies

- **React**: Core React functionality
- **UI Components**: From `@/components/ui` (Card, Button, Select, Slider, Input, etc.)
- **Icons**: Lucide React icons (for some components)
- **Store**: Zustand store hooks for state management
- **Utils**: Tailwind CSS classes and utility functions

## Benefits

1. **Reduced Duplication**: Common UI patterns are centralized
2. **Improved Maintainability**: Changes propagate across all panels
3. **Consistent UX**: All panels use the same component patterns
4. **Type Safety**: Full TypeScript support with proper interfaces
5. **Flexibility**: Configurable components for different use cases
6. **Accessibility**: Built-in accessibility features
7. **Testing**: Easier to test individual components in isolation
