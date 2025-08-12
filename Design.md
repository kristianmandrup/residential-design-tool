# Residential Design Tool - Project Architecture

This document provides an overview of the project structure and the purpose of each major folder and component.

## Project Overview
A Next.js-based 3D residential design tool built with React Three Fiber, featuring an interactive 3D scene where users can place and manipulate buildings, roads, trees, walls, and water features.

## Main Source Folders

### `/src/app/`
Next.js App Router structure containing the main application entry points and API routes.
- **`page.tsx`**: Main application page with provider hierarchy and 3D scene/sidebar layout
- **`layout.tsx`**: Root layout component
- **`globals.css`**: Global CSS styles

### `/src/contexts/`
React Context providers for global state management across the application.
- **`EditorContext.tsx`**: Editor-related state and functionality
- **`GridContext.tsx`**: Grid system configuration and utilities
- **`LayoutContext.tsx`**: Layout state (canvas dimensions, UI positioning)
- **`ToolContext.tsx`**: Tool selection and tool-related state management

### `/src/lib/`
Core library functions and database configuration.
- **`db/`**: Database setup using Drizzle ORM with schema definitions and test utilities
- **`utils.ts`**: General utility functions

### `/src/store/`
Zustand-based state management for the 3D scene and objects.
- **`useStore.tsx`**: Main store provider and hooks
- **`storeTypes.ts`**: TypeScript type definitions for scene objects and store state
- **`storeUtils.ts`**: Store utility functions
- **`roadUtils.ts`**: Specific utilities for road object handling

### `/src/utils/`
Utility functions for specific features.
- **`io.ts`**: Input/output operations (likely for project save/load)

## Component Structure

### `/src/components/`

#### Root Components
- **`MainScene.tsx`**: Main 3D scene wrapper using React Three Fiber Canvas
- **`Building.tsx`**: Building object component
- **`ObjectPalette.tsx`**: Object selection palette
- **`TopMenu.tsx`**: Top navigation/menu bar
- **`TransformHandler.tsx`**: Handles object transformation (move, rotate, scale)

#### `/src/components/bars/`
Navigation and sidebar components.
- **`Sidebar.tsx`**: Main sidebar container
- **`side/`**: Sidebar sections and components

#### `/src/components/bars/side/`
Individual sidebar sections for different functionality.
- **`CollapsibleSection.tsx`**: Reusable collapsible section wrapper
- **`GridSection.tsx`**: Grid configuration controls
- **`ObjectPropertiesSection.tsx`**: Properties panel for selected objects
- **`PaletteSection.tsx`**: Object palette section
- **`ProjectSection.tsx`**: Project management (save/load)
- **`SearchSection.tsx`**: Object search functionality
- **`SelectedSection.tsx`**: Selected object information
- **`TipsSection.tsx`**: User tips and help

#### `/src/components/bars/side/components/`
Reusable form components for object properties.
- **`GridSizeFields.tsx`**: Grid size input controls
- **`ObjectBaseProps.tsx`**: Base properties shared by all objects
- **`PositionInputs.tsx`**: Position coordinate inputs
- **`RotationInput.tsx`**: Rotation angle inputs

#### `/src/components/bars/side/components/object/`
Object-specific property panels.
- **`BuildingProperties.tsx`**: Building-specific property controls
- **`FloorProperties.tsx`**: Individual floor property controls
- **`NewRoadProperties.tsx`**: Properties for road creation/editing
- **`RoadProperties.tsx`**: Existing road property controls
- **`TreeProperties.tsx`**: Tree-specific property controls
- **`WallProperties.tsx`**: Wall-specific property controls
- **`WaterProperties.tsx`**: Water feature property controls

#### `/src/components/build-objects/`
3D object implementations for the scene.
- **`BuildingObj.tsx`**: 3D building object with floors and roofs
- **`NewRoadObj.tsx`**: Road creation object
- **`RoadObj.tsx`**: Rendered road object
- **`RoadDrawing.ts`**: Road drawing logic and utilities
- **`RoadIntersectionDetection.ts`**: Road intersection detection algorithms
- **`RoadPreview.tsx`**: Road preview during creation
- **`RoofObj.tsx`**: Building roof component
- **`TreeObj.tsx`**: 3D tree object
- **`WallObj.tsx`**: 3D wall object
- **`WaterObj.tsx`**: 3D water feature object

#### `/src/components/build-objects/road/`
Detailed road rendering components.
- **`DashedLine.tsx`**: Dashed line rendering for road markings
- **`RoadBase.tsx`**: Base road surface
- **`RoadCurb.tsx`**: Road curb/edge rendering
- **`RoadDetail.tsx`**: Detailed road elements
- **`RoadLines.tsx`**: Road lane markings
- **`RoadSegment.tsx`**: Individual road segment
- **`SideLane.tsx`**: Side lane/shoulder rendering

#### `/src/components/generic/`
Reusable UI components used throughout the application.
- **`Button.tsx`**: Standard button component
- **`ColorField.tsx`**: Color picker input
- **`DeleteButton.tsx`**: Delete action button
- **`InputField.tsx`**: Text input field
- **`Label.tsx`**: Form label component
- **`NumberField.tsx`**: Numeric input field
- **`Section.tsx`**: Content section wrapper
- **`SectionHeader.tsx`**: Section header component
- **`SelectField.tsx`**: Dropdown selection field
- **`SwitchField.tsx`**: Toggle switch component

#### `/src/components/palette/`
Object palette functionality.
- **`PaletteItem.tsx`**: Individual palette item for object selection

#### `/src/components/scene/`
3D scene management and interaction logic.
- **`Ground.tsx`**: Ground plane rendering
- **`KeyboardShortcuts.tsx`**: Keyboard shortcut handling
- **`PointerEventHandlers.tsx`**: Mouse/pointer interaction handling
- **`RoadDrawingLogic.tsx`**: Road drawing interaction logic
- **`SceneObjects.tsx`**: Scene object management and rendering
- **`SceneUtils.tsx`**: Scene utility functions
- **`SceneWrapper.tsx`**: Main scene wrapper with lighting and controls
- **`SelectionAndPlacement.tsx`**: Object selection and placement logic
- **`TransformControlsManager.tsx`**: Transform controls (move/rotate/scale) management
- **`TransformModeUI.tsx`**: Transform mode UI controls
- **`TransparentGrid.tsx`**: Grid overlay rendering

#### `/src/components/ui/`
Additional UI components.
- **`Label.tsx`**: UI label component
- **`Modal.tsx`**: Modal dialog component
- **`Switch.tsx`**: Switch/toggle component
- **`Toggle.tsx`**: Toggle button component

## API Structure

### `/src/app/api/`

#### `/src/app/api/projects/`
Project management API endpoints.
- **`route.ts`**: 
  - `GET`: Fetch all projects
  - `POST`: Create new project
  - `GET_PROJECT`: Fetch specific project (appears to be unused)
- **`[id]/route.ts`**: 
  - `GET`: Fetch project by ID

## Key Features
- **3D Scene**: Interactive 3D environment built with React Three Fiber
- **Object Manipulation**: Place, move, rotate, and scale various objects (buildings, roads, trees, walls, water)
- **Road System**: Advanced road drawing with intersection detection and detailed rendering
- **Project Management**: Save and load projects via API
- **Grid System**: Snap-to-grid functionality for precise placement
- **Undo/Redo**: State management with history tracking
- **Multi-selection**: Select and manipulate multiple objects
- **Property Panels**: Detailed property editing for each object type
- **Responsive UI**: Sidebar-based interface with collapsible sections