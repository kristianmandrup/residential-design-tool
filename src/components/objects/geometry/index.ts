// Generic geometry system (new unified approach)
export { type GenericGeometryResult, type GeometryConfig } from "./types";

export { createBezierCurve as createGenericBezierCurve } from "./bezierUtils";

export { generateGenericPath } from "./pathUtils";

export { calculateBounds } from "./boundsUtils";

export { generateGenericGeometry } from "./genericGeometry";

export { generatePreviewGeometry as generateGenericPreviewGeometry } from "./previewGeometry";
