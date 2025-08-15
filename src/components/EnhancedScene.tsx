import React, { useRef, useEffect, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, Grid, Environment } from "@react-three/drei";
import { useSceneStore } from "@/store";
import { useEnhancedGenericPointerEvents } from "@/hooks/useEnhancedGenericPointerEvents";
import { useGenericDrawingContext } from "@/contexts/GenericDrawingContext";

// Enhanced components
import GenericPreview from "@/components/objects/shared/GenericPreview";
import {
  createGenericIntersectionComponent,
  processGenericObjectSystem,
} from "@/components/objects/shared/GenericIntersectionDetection";

// Enhanced object components
import {
  EnhancedRoad,
  EnhancedWater,
  EnhancedWall,
  Building,
  Tree,
} from "@/components/objects";

// Import enhanced drawing behaviors
import { enhancedRoadDrawingBehavior } from "@/components/objects/behaviors/enhancedRoadDrawingBehavior";
import {
  enhancedWallDrawingBehavior,
  enhancedWaterDrawingBehavior,
} from "@/components/objects/behaviors";
import {
  EnhancedDrawingControls,
  IntersectionPanel,
  ToolPalette,
} from "./sidebar";

interface EnhancedSceneProps {
  showGrid?: boolean;
  showEnvironment?: boolean;
  enablePerformanceOptimizations?: boolean;
}

function SceneContent({ showGrid = true }: { showGrid?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { camera, scene } = useThree();
  const store = useSceneStore();
  const drawingContext = useGenericDrawingContext();

  // Setup enhanced pointer events
  const pointerEvents = useEnhancedGenericPointerEvents(
    {
      canvas: canvasRef.current || document.createElement("canvas"), // Fallback for SSR
      camera,
      scene,
      gridSize: 1.0,
      snap: store.snapEnabled,
      objects: store.objects,
    },
    {
      addObject: store.addObject,
      updateObject: store.updateObject,
      removeObject: store.removeObject,
      getAllObjects: () => store.objects,
      setSelectedId: store.setSelectedId,
      setSelectedIds: store.setSelectedIds,
    },
    { selectedId: store.selectedId, selectedIds: store.selectedIds },
    {
      selectedTool: "select" as const, // Default tool
      setSelectedTool: () => {}, // Placeholder - not implemented in store
    }
  );

  // Process intersections for all objects with points
  const { processedObjects, intersections } = useMemo(() => {
    const objectsWithPoints = store.objects.filter(
      (obj) => "points" in obj && Array.isArray(obj.points)
    );

    if (objectsWithPoints.length === 0) {
      return { processedObjects: [], intersections: [] };
    }

    const genericObjects = objectsWithPoints.map((obj) => ({
      id: obj.id,
      type: obj.type,
      points: obj.points,
      width: ("width" in obj ? (obj.width as number) : undefined) || 2,
      elevation:
        ("elevation" in obj ? (obj.elevation as number) : undefined) || 0,
      thickness:
        ("thickness" in obj ? (obj.thickness as number) : undefined) || 0.1,
      variant: "roadType" in obj ? (obj.roadType as string) : "default",
    }));

    const result = processGenericObjectSystem(genericObjects);
    return {
      processedObjects: result.optimizedObjects,
      intersections: result.intersections,
    };
  }, [store.objects]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      pointerEvents.handleKeyDown(event);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pointerEvents]);

  // Create intersection components
  const intersectionComponents = useMemo(() => {
    return intersections.map((intersection) => {
      const component = createGenericIntersectionComponent(intersection);
      return { id: intersection.id, component };
    });
  }, [intersections]);

  return (
    <>
      {/* Grid */}
      {showGrid && (
        <Grid
          args={[50, 50]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#444444"
          sectionSize={10}
          sectionThickness={1}
          sectionColor="#666666"
          fadeDistance={100}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={false}
        />
      )}

      {/* Enhanced Objects */}
      {store.objects.map((object) => {
        switch (object.type) {
          case "road":
            return <EnhancedRoad key={object.id} data={object} />;
          case "wall":
            return <EnhancedWall key={object.id} data={object} />;
          case "water":
            return <EnhancedWater key={object.id} data={object} />;
          case "building":
            // Keep existing building component
            return <Building key={object.id} data={object} />;
          case "tree":
            // Keep existing tree component
            return <Tree key={object.id} data={object} />;
          default:
            console.warn(`Unknown object type: ${object.type}`);
            return null;
        }
      })}

      {/* Intersection Components */}
      {intersectionComponents.map(({ id, component }) => (
        <primitive key={`intersection-${id}`} object={component} />
      ))}

      {/* Drawing Previews */}
      {pointerEvents.roadDrawing.isDrawing &&
        pointerEvents.roadDrawing.getPreview() && (
          <GenericPreview
            preview={pointerEvents.roadDrawing.getPreview()!}
            generateGeometry={enhancedRoadDrawingBehavior.generateGeometry}
          />
        )}

      {pointerEvents.wallDrawing.isDrawing &&
        pointerEvents.wallDrawing.getPreview() && (
          <GenericPreview
            preview={pointerEvents.wallDrawing.getPreview()!}
            generateGeometry={enhancedWallDrawingBehavior.generateGeometry}
          />
        )}

      {pointerEvents.waterDrawing.isDrawing &&
        pointerEvents.waterDrawing.getPreview() && (
          <GenericPreview
            preview={pointerEvents.waterDrawing.getPreview()!}
            generateGeometry={enhancedWaterDrawingBehavior.generateGeometry}
          />
        )}

      {/* Lights */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Camera Controls */}
      <OrbitControls
        makeDefault
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2.5}
        minDistance={2}
        maxDistance={100}
      />
    </>
  );
}

export function EnhancedScene({
  showGrid = true,
  showEnvironment = true,
  enablePerformanceOptimizations = true,
}: EnhancedSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const store = useSceneStore();
  const drawingContext = useGenericDrawingContext();

  // Get active drawing state for UI
  const isAnyDrawing =
    drawingContext.isDrawingRoad ||
    drawingContext.isDrawingWall ||
    drawingContext.isDrawingWater;

  // Setup pointer events once canvas is available
  const pointerEvents = useMemo(() => {
    if (!canvasRef.current) return null;

    // This will be properly initialized in SceneContent
    return null;
  }, [canvasRef.current]);

  // Calculate intersections for UI
  const intersections = useMemo(() => {
    const objectsWithPoints = store.objects.filter(
      (obj) => "points" in obj && Array.isArray(obj.points)
    );

    if (objectsWithPoints.length === 0) return [];

    const genericObjects = objectsWithPoints.map((obj) => {
      // Use proper type narrowing to ensure points property exists
      if ("points" in obj && Array.isArray(obj.points)) {
        return {
          id: obj.id,
          type: obj.type,
          points: obj.points,
          width: ("width" in obj ? (obj.width as number) : undefined) || 2,
          elevation:
            ("elevation" in obj ? (obj.elevation as number) : undefined) || 0,
          thickness:
            ("thickness" in obj ? (obj.thickness as number) : undefined) || 0.1,
        };
      }
      // Fallback for objects that don't have points (shouldn't happen due to filter)
      return {
        id: obj.id,
        type: obj.type,
        points: [],
        width: 2,
        elevation: 0,
        thickness: 0.1,
      };
    });

    const result = processGenericObjectSystem(genericObjects);
    return result.intersections;
  }, [store.objects]);

  const handleCanvasPointerDown = (event: React.PointerEvent) => {
    if (canvasRef.current) {
      // Convert React pointer event to native PointerEvent
      const nativeEvent = event.nativeEvent;
      // The actual pointer handling is done in SceneContent via useThree
    }
  };

  return (
    <div className="enhanced-scene-container">
      {/* 3D Canvas */}
      <Canvas
        ref={canvasRef}
        shadows={enablePerformanceOptimizations}
        camera={{ position: [10, 10, 10], fov: 50 }}
        onPointerDown={handleCanvasPointerDown}
        style={{ width: "100vw", height: "100vh" }}
        gl={{
          antialias: enablePerformanceOptimizations,
          alpha: false,
          preserveDrawingBuffer: false,
        }}
        performance={{
          min: enablePerformanceOptimizations ? 0.2 : 0.5,
          max: 1,
          debounce: 200,
        }}
      >
        {showEnvironment && (
          <Environment preset="city" background={false} blur={0.8} />
        )}

        <SceneContent showGrid={showGrid} />
      </Canvas>

      {/* UI Overlays */}
      <div className="ui-overlays">
        {/* Tool Palette */}
        <ToolPalette compact={true} />

        {/* Enhanced Drawing Controls - only show when drawing */}
        {isAnyDrawing && (
          <EnhancedDrawingControls
            roadDrawing={{
              isDrawing: drawingContext.isDrawingRoad,
              tempPoints: drawingContext.tempRoadPoints,
              selectedType: drawingContext.selectedRoadType,
              showPreview: true,
              showIntersections: true,
              autoOptimize: true,
              undoLastPoint: drawingContext.undoLastRoadPoint,
              cancelDrawing: drawingContext.cancelRoadDrawing,
              finishDrawing: () => {},
              togglePreview: () => {},
              toggleIntersections: () => {},
              toggleAutoOptimize: () => {},
              setSelectedType: drawingContext.setSelectedRoadType,
            }}
            wallDrawing={{
              isDrawing: drawingContext.isDrawingWall,
              tempPoints: drawingContext.tempWallPoints,
              selectedType: drawingContext.selectedWallType,
              showPreview: true,
              showIntersections: true,
              autoOptimize: true,
              undoLastPoint: drawingContext.undoLastWallPoint,
              cancelDrawing: drawingContext.cancelWallDrawing,
              finishDrawing: () => {},
              togglePreview: () => {},
              toggleIntersections: () => {},
              toggleAutoOptimize: () => {},
              setSelectedType: drawingContext.setSelectedWallType,
            }}
            waterDrawing={{
              isDrawing: drawingContext.isDrawingWater,
              tempPoints: drawingContext.tempWaterPoints,
              selectedType: drawingContext.selectedWaterType,
              showPreview: true,
              showIntersections: true,
              autoOptimize: true,
              undoLastPoint: drawingContext.undoLastWaterPoint,
              cancelDrawing: drawingContext.cancelWaterDrawing,
              finishDrawing: () => {},
              togglePreview: () => {},
              toggleIntersections: () => {},
              toggleAutoOptimize: () => {},
              setSelectedType: drawingContext.setSelectedWaterType,
            }}
          />
        )}

        {/* Intersection Panel - only show when intersections exist */}
        {intersections.length > 0 && (
          <IntersectionPanel
            intersections={intersections}
            onSelectIntersection={(intersection) => {
              // Focus camera on intersection
              console.log("Selected intersection:", intersection);
            }}
            onDeleteIntersection={(intersection) => {
              // Handle intersection deletion if needed
              console.log("Delete intersection:", intersection);
            }}
          />
        )}

        {/* Performance Monitor (Development Only) */}
        {process.env.NODE_ENV === "development" &&
          enablePerformanceOptimizations && (
            <div className="performance-monitor">
              <div>Objects: {store.objects.length}</div>
              <div>Intersections: {intersections.length}</div>
              <div>Drawing: {isAnyDrawing ? "Active" : "Idle"}</div>
            </div>
          )}

        {/* Help Panel */}
        <div className="help-panel">
          <details>
            <summary>🔧 Controls</summary>
            <div className="help-content">
              <h4>Tools</h4>
              <ul>
                <li>
                  <kbd>S</kbd> - Select
                </li>
                <li>
                  <kbd>R</kbd> - Road
                </li>
                <li>
                  <kbd>W</kbd> - Wall
                </li>
                <li>
                  <kbd>A</kbd> - Water
                </li>
                <li>
                  <kbd>B</kbd> - Building
                </li>
                <li>
                  <kbd>T</kbd> - Tree
                </li>
              </ul>

              <h4>Drawing</h4>
              <ul>
                <li>
                  <kbd>Enter</kbd> - Finish
                </li>
                <li>
                  <kbd>Esc</kbd> - Cancel
                </li>
                <li>
                  <kbd>Ctrl+Z</kbd> - Undo Point
                </li>
                <li>
                  <kbd>C</kbd> - Add Curve (Roads)
                </li>
              </ul>

              <h4>Enhanced Features</h4>
              <ul>
                <li>
                  <kbd>P</kbd> - Toggle Preview
                </li>
                <li>
                  <kbd>I</kbd> - Toggle Intersections
                </li>
                <li>
                  <kbd>O</kbd> - Toggle Optimization
                </li>
              </ul>
            </div>
          </details>
        </div>
      </div>

      {/* Load enhanced styles */}
      <style>{`
        .enhanced-scene-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }
        
        .ui-overlays {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          z-index: 1000;
        }
        
        .ui-overlays > * {
          pointer-events: auto;
        }
        
        .performance-monitor {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          font-family: monospace;
          font-size: 12px;
          display: flex;
          gap: 15px;
          z-index: 1001;
        }
        
        .help-panel {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
          max-width: 250px;
        }
        
        .help-panel summary {
          padding: 10px 15px;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.05);
          color: white;
          font-weight: 500;
          user-select: none;
        }
        
        .help-panel summary:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .help-content {
          padding: 15px;
          color: white;
          font-size: 12px;
        }
        
        .help-content h4 {
          margin: 0 0 8px 0;
          color: #00ff88;
          font-size: 13px;
        }
        
        .help-content ul {
          margin: 0 0 15px 0;
          padding-left: 15px;
        }
        
        .help-content li {
          margin: 4px 0;
          line-height: 1.4;
        }
        
        .help-content kbd {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 3px;
          padding: 2px 4px;
          font-size: 10px;
          color: #00ff88;
          margin-right: 5px;
        }
      `}</style>
    </div>
  );
}

// Export with performance wrapper for production
export default React.memo(EnhancedScene);
