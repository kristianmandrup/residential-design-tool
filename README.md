# Next.js + TypeScript Mini City-Builder Designer

A minimal, working city-builder designer built with Next.js, TypeScript, Tailwind CSS, and @react-three/fiber.

## Features

- Placeable Buildings (stacked floors + roof on top) with windows
- Roads, Trees, Walls
- Toolbar to select tools and placement options
- Sidebar to view/edit selected object's properties (colors, floors, roof type)
- Basic click-to-place + selection via raycasting

## Installation

Install dependencies:

```bash
npm install three @react-three/fiber @react-three/drei zustand
```

Initialize Tailwind CSS:

```bash
npx tailwindcss init -p
```

Copy the configuration files and components from this project.

## Project Structure

```txt
├── context/
│   └── EditorContext.tsx      # Global state management
├── components/
│   ├── Building.tsx           # Building component with floors and roof
│   ├── Roof.tsx              # Roof component (flat, gabled, hipped)
│   ├── Tree.tsx              # Tree component
│   ├── Road.tsx              # Road component
│   ├── Wall.tsx              # Wall component
│   ├── Scene.tsx             # 3D scene with raycasting
│   ├── Toolbar.tsx           # Tool selection toolbar
│   └── Sidebar.tsx           # Property editor sidebar
├── pages/
│   ├── _app.tsx              # Next.js app wrapper
│   └── index.tsx             # Main page
├── styles/
│   └── globals.css          # Global styles with Tailwind
├── tailwind.config.js        # Tailwind configuration
└── README.md                 # This file
```

## Usage

1. Select a tool from the left toolbar (S=Select, B=Building, T=Tree, R=Road, W=Wall)
2. Click in the 3D scene to place objects
3. Select objects to edit their properties in the right sidebar
4. Use mouse to orbit around the scene (left-click drag)
5. Use mouse to zoom (scroll wheel)

## Technical Details

- Uses React Three Fiber for 3D rendering
- Implements custom raycasting for object selection
- State management with React Context
- Dynamic imports to avoid SSR issues with 3D components
- TypeScript for type safety

## Notes

- This is a compact, pragmatic implementation to get you started. It focuses on an easy-to-understand state model and simple placement/selection logic.
- You can extend this with transform controls, save/load (serialize objects to JSON), snapping to grid, undo/redo, advanced roof geometry, procedural windows, textures, and performance optimizations.
- To make this production-ready, add: better selection highlighting, gizmos for move/rotate/scale (use TransformControls from @react-three/drei), collision avoidance, and a more robust UI for drawing multi-segment roads.
- Because we used client components and dynamic import for the Scene, this works in Next.js pages router. If you use the app router, move components into the client scope as needed.
