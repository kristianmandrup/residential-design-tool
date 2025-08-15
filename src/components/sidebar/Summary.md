# Sidebar Components Summary

This document provides a comprehensive overview of all types, components, and functions exported from the `src/components/sidebar` directory, along with their interfaces and usage patterns.

## Exported Components

### Main Components

#### [`Sidebar`](src/components/sidebar/Sidebar.tsx:26)

**Main sidebar container component that manages the entire UI**

- **Purpose**: Primary sidebar container with collapsible sections and tab navigation
- **Props**: None (uses context hooks internally)
- **Features**:
  - Collapsible state management
  - Section-based navigation (tools, drawing, objects, scene, project, etc.)
  - Active tool indicator
  - Object count badges
  - Responsive design with compact mode

**Usage**:

```tsx
import { Sidebar } from "@/components/sidebar";

<Sidebar />;
```

#### [`ToolPalette`](src/components/sidebar/ToolPalette.tsx:18)

**Tool selection interface with categorized tools**

- **Props**:

  ```typescript
  interface ToolPaletteProps {
    compact?: boolean; // Optional: renders compact version
  }
  ```

- **Features**:
  - Tool categories: Navigation, Structures, Infrastructure, Nature
  - Keyboard shortcuts display
  - Object count badges per tool
  - Tool descriptions and icons
  - Compact mode for sidebar sections

**Usage**:

```tsx
import { ToolPalette } from "@/components/sidebar";

<ToolPalette />           // Full version
<ToolPalette compact />   // Compact version
```

#### [`ObjectList`](src/components/sidebar/ObjectList.tsx:8)

**Scene object browser with selection and management**

- **Props**: None (uses scene store internally)
- **Features**:
  - Grouped by object type (buildings, trees, roads, walls, water)
  - Selection state management
  - Delete functionality
  - Object count badges
  - Scrollable list for large scenes

**Usage**:

```tsx
import { ObjectList } from "@/components/sidebar";

<ObjectList />;
```

#### [`SceneControls`](src/components/sidebar/SceneControls.tsx:9)

**Scene-level controls and settings**

- **Props**: None (uses context hooks internally)
- **Features**:
  - Grid visibility and snap controls
  - Undo/Redo actions
  - Keyboard shortcuts reference
  - Tool shortcuts (S, R, B, T, W, A)

**Usage**:

```tsx
import { SceneControls } from "@/components/sidebar";

<SceneControls />;
```

#### [`DrawingControls`](src/components/sidebar/DrawingControls.tsx:13)

**Active drawing interface for road, wall, and water drawing**

- **Props**: None (uses drawing context internally)
- **Features**:
  - Real-time drawing progress
  - Type-specific controls (road types, wall types, water types)
  - Point management and undo functionality
  - Drawing instructions and shortcuts
  - Auto-hides when no drawing is active

**Usage**:

```tsx
import { DrawingControls } from "@/components/sidebar";

<DrawingControls />;
```

#### [`EnhancedDrawingControls`](src/components/sidebar/EnhancedDrawingControls.tsx:37)

**Advanced drawing controls with enhanced features**

- **Props**:

  ```typescript
  interface EnhancedDrawingControlsProps {
    roadDrawing?: DrawingState & DrawingActions;
    wallDrawing?: DrawingState & DrawingActions;
    waterDrawing?: DrawingState & DrawingActions;
  }

  interface DrawingState {
    isDrawing: boolean;
    tempPoints: Array<{ x: number; z: number }>;
    selectedType: string;
    showPreview?: boolean;
    showIntersections?: boolean;
    autoOptimize?: boolean;
  }

  interface DrawingActions {
    undoLastPoint: () => void;
    cancelDrawing: () => void;
    finishDrawing: () => void;
    togglePreview?: () => void;
    toggleIntersections?: () => void;
    toggleAutoOptimize?: () => void;
    setSelectedType: (type: string) => void;
  }
  ```

- **Features**:
  - Enhanced drawing features (preview, intersection detection, auto-optimize)
  - Type-specific controls for each drawing mode
  - Keyboard shortcuts panel
  - Advanced drawing state management

**Usage**:

```tsx
import { EnhancedDrawingControls } from "@/components/sidebar";

<EnhancedDrawingControls
  roadDrawing={roadDrawingState}
  wallDrawing={wallDrawingState}
  waterDrawing={waterDrawingState}
/>;
```

#### [`ProjectManager`](src/components/sidebar/ProjectManager.tsx:22)

**Project save/load functionality**

- **Props**: None (uses scene store internally)
- **Features**:
  - Project naming and JSON export
  - Local storage persistence
  - Project list management
  - File import/export
  - Delete confirmation dialogs

**Usage**:

```tsx
import { ProjectManager } from "@/components/sidebar";

<ProjectManager />;
```

#### [`SearchPanel`](src/components/sidebar/SearchPanel.tsx:19)

**Object search and filtering interface**

- **Props**: None (uses scene store internally)
- **Features**:
  - Text search by name or type
  - Type filtering
  - Advanced sorting options
  - Object selection and deletion
  - Quick actions (select all, focus first)

**Usage**:

```tsx
import { SearchPanel } from "@/components/sidebar";

<SearchPanel />;
```

#### [`TipsPanel`](src/components/sidebar/TipsPanel.tsx:10)

**Context-sensitive help and tips**

- **Props**: None (uses context hooks internally)
- **Features**:
  - Tool-specific tips
  - Keyboard shortcuts reference
  - Best practices guide
  - Tabbed interface (Current, Shortcuts, Best Practices)
  - Dynamic content based on active tool/drawing mode

**Usage**:

```tsx
import { TipsPanel } from "@/components/sidebar";

<TipsPanel />;
```

#### [`IntersectionPanel`](src/components/sidebar/IntersectionPanel.tsx:27)

**Intersection detection and management**

- **Props**:

  ```typescript
  interface IntersectionPanelProps {
    intersections: GenericIntersection[];
    onSelectIntersection?: (intersection: GenericIntersection) => void;
    onDeleteIntersection?: (intersection: GenericIntersection) => void;
  }

  interface GenericIntersection {
    id: string;
    type:
      | "cross"
      | "T-junction"
      | "Y-junction"
      | "L-corner"
      | "multi-way"
      | "end";
    position: { x: number; z: number };
    radius: number;
    elevation: number;
    connectedObjects: string[];
    objectTypes: string[];
  }
  ```

- **Features**:
  - Intersection type categorization
  - Position and radius display
  - Connected object visualization
  - Selection and deletion callbacks
  - Icon-based type representation

**Usage**:

```tsx
import { IntersectionPanel } from "@/components/sidebar";

<IntersectionPanel
  intersections={intersections}
  onSelectIntersection={handleSelect}
  onDeleteIntersection={handleDelete}
/>;
```

## Exported Types and Interfaces

### Drawing Types

- `DrawingState`: State interface for drawing operations
- `DrawingActions`: Action interface for drawing controls
- `ToolPaletteProps`: Props for tool palette component
- `IntersectionPanelProps`: Props for intersection management

### Context Dependencies

All components rely on the following contexts:

- `useTool` from `@/contexts/ToolContext`
- `useSceneStore` from `@/store/useSceneStore`
- `useGenericDrawingContext` from `@/contexts/GenericDrawingContext`
- `useGrid` from `@/contexts/GridContext`

## Key Features Overview

### 1. **Modular Architecture**

- Each component is self-contained with specific responsibilities
- Components can be used independently or together
- Consistent UI patterns across all components

### 2. **State Management**

- Centralized state via Zustand store (`useSceneStore`)
- Drawing state managed via `GenericDrawingContext`
- Tool state via `ToolContext`

### 3. **Responsive Design**

- Compact and full view modes
- Collapsible sidebar functionality
- Adaptive layouts for different screen sizes

### 4. **User Experience**

- Context-sensitive help and tips
- Keyboard shortcuts throughout
- Visual feedback for all interactions
- Progress indicators for long operations

### 5. **Extensibility**

- Type-safe interfaces for easy extension
- Modular component structure
- Consistent prop patterns
- Hook-based architecture

## Common Patterns

### Component Structure

```tsx
// Most components follow this pattern:
export function ComponentName({ ...props }: ComponentNameProps) {
  // Context hooks
  const { state, actions } = useRelevantContext();

  // Derived state
  const computedValue = useMemo(() => { ... }, [dependencies]);

  // Event handlers
  const handleAction = () => { ... };

  // JSX with consistent card-based layout
  return (
    <Card className="w-full">
      <CardHeader>...</CardHeader>
      <CardContent>...</CardContent>
    </Card>
  );
}
```

### Styling Patterns

- Consistent use of shadcn/ui components
- Card-based layout for all panels
- Responsive grid systems
- Icon-based visual indicators
- Badge counters for object counts

### Event Handling

- Consistent click handlers for selection
- Stop propagation for nested interactions
- Keyboard shortcuts integration
- Confirmation dialogs for destructive actions

This summary provides a comprehensive overview of the sidebar components system, enabling AI assistants to quickly understand the available components, their interfaces, and how they work together within the broader application context.
