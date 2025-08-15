/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/build-objects/shared/enhancedGenericDrawing.ts
import { useCallback, useMemo } from "react";
import { SceneObj } from "@/store/storeTypes";
import {
  DrawingPoint,
  EnhancedDrawingBehavior,
  DrawingPreview,
  ObjectGeometryResult,
  ObjectVisualConfig,
  GenericObjectData,
  EnhancedGenericDrawingState,
  EnhancedGenericDrawingActions,
  EnhancedDrawingResult,
} from "./types";
import { GenericDrawingUtils } from "./genericDrawing";
import {
  detectGenericIntersections,
  optimizeObjectConnections,
} from "./GenericIntersectionDetection";

/**
 * Enhanced generic drawing hook with full visual features
 */
export function useEnhancedGenericDrawing<T extends SceneObj>(
  state: EnhancedGenericDrawingState,
  actions: EnhancedGenericDrawingActions,
  behavior: EnhancedDrawingBehavior<T>,
  gridSize: number = 1,
  allObjects?: SceneObj[]
): EnhancedDrawingResult<T> {
  const {
    isDrawing,
    tempPoints,
    lastClickTime,
    selectedType,
    snapToGrid,
    showPreview,
    showIntersections,
    autoOptimize,
  } = state;

  const {
    setIsDrawing,
    setTempPoints,
    setLastClickTime,
    setSelectedType,
    setSnapToGrid,
    setShowPreview,
    setShowIntersections,
    setAutoOptimize,
    addObject,
    getAllObjects,
    cancelDrawing: baseCancelDrawing,
    undoLastPoint: baseUndoLastPoint,
  } = actions;

  // Convert scene objects to generic object data for intersection detection
  const genericObjects = useMemo(() => {
    const objects = getAllObjects?.() || allObjects || [];
    return objects
      .filter(
        (obj): obj is SceneObj & { points: DrawingPoint[] } =>
          "points" in obj && Array.isArray(obj.points)
      )
      .map(
        (obj): GenericObjectData => ({
          id: obj.id,
          type: obj.type,
          points: obj.points,
          width: "width" in obj ? (obj.width as number) : 2,
          elevation: "elevation" in obj ? (obj.elevation as number) : 0,
          thickness: "thickness" in obj ? (obj.thickness as number) : 0.1,
          variant: "roadType" in obj ? (obj.roadType as string) : selectedType,
        })
      );
  }, [getAllObjects, allObjects, selectedType]);

  // Current object data for intersection detection
  const currentObjectData = useMemo((): GenericObjectData | null => {
    if (!isDrawing || tempPoints.length === 0) return null;

    return {
      id: "temp-drawing",
      type: behavior.config.type,
      points: tempPoints,
      width:
        behavior.getIntersectionRadius?.(selectedType) !== undefined
          ? behavior.getIntersectionRadius(selectedType) * 2
          : 2,
      elevation:
        behavior.config.defaults?.elevation !== undefined
          ? (behavior.config.defaults.elevation as number)
          : 0,
      thickness:
        behavior.config.defaults?.thickness !== undefined
          ? (behavior.config.defaults.thickness as number)
          : 0.1,
      variant: selectedType,
    };
  }, [isDrawing, tempPoints, behavior, selectedType]);

  // Detect intersections with current drawing
  const intersections = useMemo(() => {
    if (
      !showIntersections ||
      !currentObjectData ||
      !behavior.config.allowIntersections
    ) {
      return [];
    }

    const allObjectsForDetection = [...genericObjects, currentObjectData];
    return detectGenericIntersections(allObjectsForDetection);
  }, [
    showIntersections,
    currentObjectData,
    genericObjects,
    behavior.config.allowIntersections,
  ]);

  // Get optimized objects
  const optimizedObjects = useMemo(() => {
    if (!autoOptimize || intersections.length === 0) {
      return genericObjects;
    }

    return optimizeObjectConnections(genericObjects, intersections);
  }, [autoOptimize, genericObjects, intersections]);

  // Handle drawing clicks with enhanced features
  const handleDrawingClick = useCallback(
    (event: PointerEvent, worldPosition: { x: number; z: number }): boolean => {
      const now = Date.now();
      const isDoubleClick = Boolean(lastClickTime && now - lastClickTime < 350);
      const isEnterFinish = Boolean(
        event.type === "keydown" && (event as any).key === "Enter"
      );

      // Snap to grid if enabled
      const snappedPosition = GenericDrawingUtils.snapToGrid(
        worldPosition.x,
        worldPosition.z,
        gridSize,
        snapToGrid
      );

      // Snap to intersections if enabled and nearby
      let finalPosition = snappedPosition;
      if (showIntersections && intersections.length > 0) {
        const nearbyIntersection = intersections.find((intersection) => {
          const distance = Math.sqrt(
            Math.pow(intersection.position.x - snappedPosition.x, 2) +
              Math.pow(intersection.position.z - snappedPosition.z, 2)
          );
          return distance < 0.5; // Snap within 0.5 units
        });

        if (nearbyIntersection) {
          finalPosition = {
            x: nearbyIntersection.position.x,
            z: nearbyIntersection.position.z,
          };
        }
      }

      console.log(`🎨 Enhanced ${behavior.config.name} drawing click:`, {
        isDoubleClick,
        isEnterFinish,
        currentPoints: tempPoints.length,
        newPosition: finalPosition,
        snappedToIntersection: finalPosition !== snappedPosition,
      });

      // Check if we should finish
      if (behavior.isFinished(tempPoints, isDoubleClick, isEnterFinish)) {
        return finishDrawing();
      }

      // Don't add points on finish attempts
      if (isDoubleClick || isEnterFinish) {
        return false;
      }

      // Check if we've reached max points
      if (
        behavior.config.maxPoints &&
        tempPoints.length >= behavior.config.maxPoints
      ) {
        console.log(`⚠️ Max points (${behavior.config.maxPoints}) reached`);
        return finishDrawing();
      }

      // Add new point
      const newPoint: DrawingPoint = {
        x: Math.round(finalPosition.x * 100) / 100,
        z: Math.round(finalPosition.z * 100) / 100,
      };

      // Validate point
      if (!GenericDrawingUtils.validatePoints([newPoint])) {
        console.error("❌ Invalid point coordinates:", newPoint);
        return false;
      }

      const newPoints = [...tempPoints, newPoint];
      setTempPoints(newPoints);
      setIsDrawing(true);
      setLastClickTime(now);

      console.log("📍 Enhanced point added, total:", newPoints.length);
      return true;
    },
    [
      lastClickTime,
      gridSize,
      snapToGrid,
      showIntersections,
      intersections,
      behavior,
      tempPoints,
      setTempPoints,
      setIsDrawing,
      setLastClickTime,
    ]
  );

  // Enhanced finish drawing with intersection optimization
  const finishDrawing = useCallback((): boolean => {
    if (tempPoints.length < behavior.config.minPoints) {
      console.log(
        `❌ Need at least ${behavior.config.minPoints} points to create ${behavior.config.name}`
      );
      return false;
    }

    if (!behavior.validatePoints(tempPoints)) {
      console.error("❌ Invalid points for", behavior.config.name);
      return false;
    }

    try {
      // Apply intersection optimization if enabled
      let finalPoints = tempPoints;
      if (autoOptimize && intersections.length > 0 && currentObjectData) {
        const optimizedResult = optimizeObjectConnections(
          [currentObjectData],
          intersections
        );
        finalPoints = optimizedResult[0]?.points || tempPoints;
      }

      const objectData = behavior.createObject(finalPoints, selectedType);

      console.log(`🎨 Creating enhanced ${behavior.config.name}:`, {
        originalPoints: tempPoints.length,
        finalPoints: finalPoints.length,
        optimized: finalPoints !== tempPoints,
        intersections: intersections.length,
      });

      addObject(objectData);

      // Reset state
      setTempPoints([]);
      setIsDrawing(false);
      setLastClickTime(null);

      console.log(`✅ Enhanced ${behavior.config.name} created successfully`);
      return true;
    } catch (error) {
      console.error(
        `❌ Failed to create enhanced ${behavior.config.name}:`,
        error
      );
      return false;
    }
  }, [
    tempPoints,
    behavior,
    selectedType,
    autoOptimize,
    intersections,
    currentObjectData,
    addObject,
    setTempPoints,
    setIsDrawing,
    setLastClickTime,
  ]);

  // Enhanced cancel drawing
  const cancelDrawing = useCallback(() => {
    console.log(`❌ Cancelling enhanced ${behavior.config.name} drawing`);
    setTempPoints([]);
    setIsDrawing(false);
    setLastClickTime(null);
    baseCancelDrawing();
  }, [
    behavior.config.name,
    setTempPoints,
    setIsDrawing,
    setLastClickTime,
    baseCancelDrawing,
  ]);

  // Enhanced undo last point
  const undoLastPoint = useCallback(() => {
    if (tempPoints.length > 0) {
      const newPoints = tempPoints.slice(0, -1);
      setTempPoints(newPoints);
      if (newPoints.length === 0) {
        setIsDrawing(false);
      }
      console.log("↶ Undid last point, remaining:", newPoints.length);
      baseUndoLastPoint();
    }
  }, [tempPoints, setTempPoints, setIsDrawing, baseUndoLastPoint]);

  // Add curve to last segment (if supported)
  const addCurveToLastSegment = useCallback(() => {
    if (!behavior.config.allowCurves || tempPoints.length < 2) return;

    const lastIndex = tempPoints.length - 2;
    const lastPoint = tempPoints[lastIndex];
    const currentPoint = tempPoints[lastIndex + 1];

    const midX = (lastPoint.x + currentPoint.x) / 2;
    const midZ = (lastPoint.z + currentPoint.z) / 2;
    const dx = currentPoint.x - lastPoint.x;
    const dz = currentPoint.z - lastPoint.z;
    const length = Math.sqrt(dx * dx + dz * dz);

    if (length > 0) {
      const perpX = -dz / length;
      const perpZ = dx / length;
      const offset = length * 0.3;

      const controlPoint = {
        x: midX + perpX * offset,
        z: midZ + perpZ * offset,
      };

      const newPoints = [...tempPoints];
      newPoints[lastIndex] = { ...lastPoint, controlPoint };
      setTempPoints(newPoints);
      console.log("🔄 Added curve to segment");
    }
  }, [behavior.config.allowCurves, tempPoints, setTempPoints]);

  // Get enhanced preview data
  const getPreview = useCallback((): DrawingPreview | null => {
    if (!isDrawing || tempPoints.length === 0 || !showPreview) return null;
    return behavior.getPreview(tempPoints, selectedType);
  }, [isDrawing, tempPoints, showPreview, behavior, selectedType]);

  // Get current geometry
  const getCurrentGeometry = useCallback((): ObjectGeometryResult | null => {
    if (!isDrawing || tempPoints.length === 0 || !behavior.generateGeometry)
      return null;
    try {
      return behavior.generateGeometry(tempPoints, selectedType);
    } catch (error) {
      console.warn("Failed to generate current geometry:", error);
      return null;
    }
  }, [isDrawing, tempPoints, behavior, selectedType]);

  // Get visual config
  const getVisualConfig = useCallback((): ObjectVisualConfig | null => {
    if (!behavior.getVisualConfig) return null;
    return behavior.getVisualConfig(selectedType);
  }, [behavior, selectedType]);

  // Get drawing instructions
  const getDrawingInstructions = useCallback((): string => {
    const baseInstructions = behavior.getInstructions(tempPoints.length);

    if (tempPoints.length > 0) {
      const enhancedInstructions = [baseInstructions];

      if (behavior.config.allowCurves && tempPoints.length >= 2) {
        enhancedInstructions.push("Press 'C' for curves");
      }

      if (intersections.length > 0) {
        enhancedInstructions.push(
          `${intersections.length} intersection(s) detected`
        );
      }

      return enhancedInstructions.join(" • ");
    }

    return baseInstructions;
  }, [behavior, tempPoints.length, intersections.length]);

  // Enhanced action callbacks
  const togglePreview = useCallback(() => {
    setShowPreview(!showPreview);
  }, [showPreview, setShowPreview]);

  const toggleIntersections = useCallback(() => {
    setShowIntersections(!showIntersections);
  }, [showIntersections, setShowIntersections]);

  const toggleAutoOptimize = useCallback(() => {
    setAutoOptimize(!autoOptimize);
  }, [autoOptimize, setAutoOptimize]);

  const getIntersections = useCallback(() => intersections, [intersections]);
  const getOptimizedObjects = useCallback(
    () => optimizedObjects,
    [optimizedObjects]
  );

  const canIntersectWith = useCallback(
    (otherType: string): boolean => {
      return behavior.canIntersectWith?.(otherType) || false;
    },
    [behavior]
  );

  const getIntersectionRadius = useCallback((): number => {
    return behavior.getIntersectionRadius?.(selectedType) || 1;
  }, [behavior, selectedType]);

  return {
    // Core state
    isDrawing,
    tempPoints,
    selectedType,
    snapToGrid,

    // Enhanced state
    showPreview,
    showIntersections,
    autoOptimize,

    // Core actions
    handleDrawingClick,
    finishDrawing,
    cancelDrawing,
    undoLastPoint,
    addCurveToLastSegment,

    // Enhanced actions
    setSelectedType,
    setSnapToGrid,
    togglePreview,
    toggleIntersections,
    toggleAutoOptimize,

    // Visual data getters
    getPreview,
    getDrawingInstructions,
    getVisualConfig,
    getCurrentGeometry,

    // Intersection system
    getIntersections,
    getOptimizedObjects,
    canIntersectWith,
    getIntersectionRadius,

    // Config
    config: behavior.config,
    behavior,
  };
}

export default useEnhancedGenericDrawing;
