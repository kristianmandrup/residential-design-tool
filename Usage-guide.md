# Residential Design Tool - Usage Guide

## Getting Started

### Basic Navigation

- **Mouse Controls**:
  - Left click + drag to rotate the camera around the scene
  - Right click + drag to pan the camera
  - Scroll wheel to zoom in/out
- **Object Selection**: Click on any object to select it
- **Deselect**: Click on empty space to deselect objects

## Object Placement

### Using the Palette

1. **Select Tool**: Click on any palette item (Building, Tree, Wall, Road, Water)
2. **Paint Mode**: Once selected, you're in paint mode - click anywhere to place objects
3. **Exit Paint Mode**: Press the Escape key to return to selection mode

### Paint Mode Features

- **Continuous Placement**: Keep clicking to place multiple objects of the same type
- **Visual Feedback**: The selected tool remains highlighted in the palette
- **Quick Switching**: Click a different palette item to switch to that object type

## Object Manipulation

### Transform Controls

When an object is selected, you'll see transform controls appear:

- **Move Tool** (default): Drag the arrows to move objects along specific axes
- **Rotate Tool**: Drag the curved handles to rotate objects
- **Scale Tool**: Drag the boxes to scale objects uniformly

### Transform Mode Selection

- Use the TransformModeUI panel (bottom-right corner) to switch between modes
- Each mode has a different color: Blue (Move), Green (Rotate), Purple (Scale)

### Grid Snapping

- **Enabled by Default**: Objects snap to the grid when moved
- **Adjust Grid Size**: Use the grid size input in the sidebar (right panel)
- **Toggle Snapping**: Grid snapping can be toggled on/off in the sidebar

## Building Customization

### Building Properties

When a building is selected, you can customize:

- **Floors**: Adjust the number of floors (1+)
- **Wall Color**: Click the color picker to change wall colors
- **Roof Type**: Choose from Flat, Gabled, or Hipped roofs
- **Roof Color**: Customize roof color independently
- **Window Color**: Change window colors for different appearances

### Building Height

- Use the floors slider to create taller or shorter buildings
- Each floor is approximately 1.8 units high
- Windows are automatically added to each floor

## Advanced Features

### Road Construction

1. **Select Road Tool**: Click the Road palette item
2. **Draw Roads**: Click to place road segments
3. **Multi-segment**: Hold Ctrl and click multiple times to create complex roads
4. **Finish**: Double-click to complete the road

### Water Features

- **Placement**: Select Water tool and click to place water elements
- **Sizing**: Adjust the radius property in the sidebar for different sizes
- **Appearance**: Water appears as semi-transparent blue cylinders

### Object Deletion

- **Keyboard**: Select an object and press the Delete key
- **Button**: Select an object and click the "Delete" button in the sidebar

## Project Management

### Saving Your Work

1. **Save**: Click the "Save" button in the sidebar
2. **File Format**: Your project is saved as a JSON file
3. **Name**: The default filename is "layout.json"

### Loading Projects

1. **Load**: Click the "Load" button in the sidebar
2. **File Selection**: Choose a JSON file to load
3. **Replace**: Loading a project replaces the current scene

### Keyboard Shortcuts

- **Delete**: Remove selected object
- **Escape**: Exit paint mode / deselect tool
- **U**: Randomize building color (when building is selected)

## Tips and Tricks

### Efficient Design

- Use paint mode for quick object placement
- Adjust grid size for precision placement
- Group similar objects together for organized designs

### Building Design

- Start with fewer floors and add more as needed
- Use contrasting colors for walls and roofs
- Experiment with different window colors

### Landscape Design

- Place water features before buildings for better planning
- Use trees to create natural boundaries
- Vary road widths for different road types

### Common Workflows

1. **Layout Planning**: Use roads and water to establish the basic layout
2. **Building Placement**: Add buildings with appropriate heights
3. **Landscaping**: Add trees and walls for detail
4. **Fine-tuning**: Adjust positions, colors, and sizes

## Troubleshooting

### Objects Not Moving

- Ensure an object is selected (highlighted with bounding box)
- Check that you're in Move mode (blue arrows visible)
- Verify that transform controls are not locked

### Paint Mode Issues

- Press Escape to exit paint mode if stuck
- Try clicking a different palette item to reset
- Check that no other tools are active

### Loading Problems

- Ensure you're selecting a valid JSON file
- Check that the file wasn't corrupted during download
- Try reloading the page if issues persist

## Need Help?

For additional support or to report issues, please check the project documentation or create an issue in the project repository.
