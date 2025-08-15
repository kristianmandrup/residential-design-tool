// src/components/objects/geometry/previewGeometry.ts
import { RoadPoint } from "@/store/storeTypes";
import { GeometryConfig, GenericGeometryResult } from "./types";
import { generateGenericGeometry } from "./genericGeometry";

/**
 * Generate preview geometry with simplified settings
 */
export function generatePreviewGeometry(
  points: RoadPoint[],
  config: GeometryConfig
): GenericGeometryResult {
  const previewConfig: GeometryConfig = {
    ...config,
    elevation: config.elevation || 0.01,
    thickness: config.thickness || 0.02,
    width: config.width || 1,
    height: config.height || 0.5,
    segments: 8, // Fewer segments for preview
  };

  return generateGenericGeometry(points, previewConfig);
}
