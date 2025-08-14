// src/components/build-objects/shared/index.ts
// Core types and interfaces
export * from "./types";

// Enhanced drawing hook
export { useEnhancedGenericDrawing } from "./enhancedGenericDrawing";

// Visual components
export { default as GenericMarkings } from "./GenericMarkings";
export { default as GenericSelectionIndicators } from "./GenericSelectionIndicators";
export { default as GenericPreview } from "./GenericPreview";

// Intersection system
export {
  detectGenericIntersections,
  generateIntersectionGeometry,
  generateIntersectionMarkings,
  createGenericIntersectionComponent,
  optimizeObjectConnections,
  processGenericObjectSystem,
} from "./GenericIntersectionDetection";

// Legacy generic drawing (for backwards compatibility)
// export * from "./genericDrawing";
