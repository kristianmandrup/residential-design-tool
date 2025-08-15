// src/components/build-objects/shared/GenericIntersectionDetection.ts
import * as THREE from "three";
import {
  DrawingPoint,
  GenericIntersection,
  ObjectSegment,
  ObjectVisualConfig,
  GenericObjectData,
} from "./types";

/**
 * Calculate distance between two points
 */
function distance(
  p1: { x: number; z: number },
  p2: { x: number; z: number }
): number {
  const dx = p2.x - p1.x;
  const dz = p2.z - p1.z;
  return Math.sqrt(dx * dx + dz * dz);
}

/**
 * Find intersection point between two line segments
 */
function findLineIntersection(
  p1: { x: number; z: number },
  p2: { x: number; z: number },
  p3: { x: number; z: number },
  p4: { x: number; z: number }
): { x: number; z: number } | null {
  const denom = (p1.x - p2.x) * (p3.z - p4.z) - (p1.z - p2.z) * (p3.x - p4.x);
  if (Math.abs(denom) < 1e-10) return null; // Lines are parallel

  const t =
    ((p1.x - p3.x) * (p3.z - p4.z) - (p1.z - p3.z) * (p3.x - p4.x)) / denom;
  const u =
    -((p1.x - p2.x) * (p1.z - p3.z) - (p1.z - p2.z) * (p1.x - p3.x)) / denom;

  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: p1.x + t * (p2.x - p1.x),
      z: p1.z + t * (p2.z - p1.z),
    };
  }

  return null;
}

/**
 * Convert object points to line segments
 */
function objectToSegments(object: GenericObjectData): ObjectSegment[] {
  const segments: ObjectSegment[] = [];

  for (let i = 0; i < object.points.length - 1; i++) {
    segments.push({
      objectId: object.id,
      objectType: object.type,
      startPoint: object.points[i],
      endPoint: object.points[i + 1],
      controlPoint: object.points[i].controlPoint,
      width: object.width || 2,
      elevation: object.elevation || 0,
    });
  }

  return segments;
}

/**
 * Check if two object types can intersect
 */
function canObjectsIntersect(type1: string, type2: string): boolean {
  const intersectionMatrix: Record<string, string[]> = {
    road: ["road", "wall", "water"],
    wall: ["road", "wall"],
    water: ["road", "water"],
    building: [], // Buildings don't typically intersect with paths
    tree: [], // Trees don't intersect with paths
  };

  return intersectionMatrix[type1]?.includes(type2) || false;
}

/**
 * Get intersection type based on connected objects
 */
function getIntersectionType(
  connectedObjects: string[],
  objectTypes: string[]
): GenericIntersection["type"] {
  const roadCount = objectTypes.filter((t) => t === "road").length;
  const wallCount = objectTypes.filter((t) => t === "wall").length;
  const waterCount = objectTypes.filter((t) => t === "water").length;

  const totalConnections = connectedObjects.length;

  // Road-specific classifications
  if (roadCount >= 2) {
    if (totalConnections === 2) return "cross";
    if (totalConnections === 3) return "Y-junction";
    if (totalConnections === 4) return "cross";
    return "multi-way";
  }

  // Wall-specific classifications
  if (wallCount >= 2) {
    if (totalConnections === 2) return "L-corner";
    if (totalConnections === 3) return "T-junction";
    return "multi-way";
  }

  // Mixed type intersections
  if (roadCount === 1 && wallCount === 1) return "T-junction";
  if (roadCount === 1 && waterCount === 1) return "end"; // Road ending at water

  return "cross"; // Default
}

/**
 * Get default visual config for intersection based on object types
 */
function getIntersectionVisualConfig(
  objectTypes: string[]
): ObjectVisualConfig {
  const hasRoad = objectTypes.includes("road");
  const hasWall = objectTypes.includes("wall");
  const hasWater = objectTypes.includes("water");

  // Road-dominant intersections
  if (hasRoad) {
    return {
      centerLine: {
        enabled: true,
        color: "#ffff00",
        width: 0.15,
        style: "dashed",
        dashLength: 0.5,
        gapLength: 0.3,
      },
      sideLines: {
        enabled: true,
        color: "#ffffff",
        width: 0.1,
        style: "solid",
      },
      surfaces: {
        color: "#404040",
        roughness: 0.8,
        metalness: 0.1,
      },
      curbs: {
        enabled: true,
        height: 0.08,
        width: 0.12,
        color: "#666666",
      },
    };
  }

  // Wall-dominant intersections
  if (hasWall) {
    return {
      edges: {
        enabled: true,
        color: "#888888",
        width: 0.05,
        style: "solid",
      },
      surfaces: {
        color: "#bfbfbf",
        roughness: 0.9,
        metalness: 0.05,
      },
    };
  }

  // Water intersections
  if (hasWater) {
    return {
      edges: {
        enabled: true,
        color: "#66bbff",
        width: 0.08,
        style: "solid",
      },
      surfaces: {
        color: "#4FC3F7",
        roughness: 0.1,
        metalness: 0.9,
        emissive: "#003366",
        emissiveIntensity: 0.1,
      },
    };
  }

  // Default
  return {
    surfaces: {
      color: "#808080",
      roughness: 0.7,
      metalness: 0.2,
    },
  };
}

/**
 * Detect intersections between multiple object types
 */
export function detectGenericIntersections(
  objects: GenericObjectData[],
  tolerance: number = 0.5
): GenericIntersection[] {
  const intersections: GenericIntersection[] = [];
  const segments = objects.flatMap((obj) => objectToSegments(obj));

  // Check all segment pairs for intersections
  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      const seg1 = segments[i];
      const seg2 = segments[j];

      // Skip if same object
      if (seg1.objectId === seg2.objectId) continue;

      // Check if these object types can intersect
      if (!canObjectsIntersect(seg1.objectType, seg2.objectType)) continue;

      // For now, handle straight segments only
      // TODO: Add bezier curve intersection detection
      if (!seg1.controlPoint && !seg2.controlPoint) {
        const intersection = findLineIntersection(
          seg1.startPoint,
          seg1.endPoint,
          seg2.startPoint,
          seg2.endPoint
        );

        if (intersection) {
          // Check if this intersection point is close to existing ones
          const existingIntersection = intersections.find(
            (inter) => distance(inter.position, intersection) < tolerance
          );

          if (existingIntersection) {
            // Add objects to existing intersection
            if (
              !existingIntersection.connectedObjects.includes(seg1.objectId)
            ) {
              existingIntersection.connectedObjects.push(seg1.objectId);
              existingIntersection.objectTypes.push(seg1.objectType);
            }
            if (
              !existingIntersection.connectedObjects.includes(seg2.objectId)
            ) {
              existingIntersection.connectedObjects.push(seg2.objectId);
              existingIntersection.objectTypes.push(seg2.objectType);
            }
          } else {
            // Create new intersection
            const objectTypes = [seg1.objectType, seg2.objectType];
            const newIntersection: GenericIntersection = {
              id: `intersection-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              position: intersection,
              connectedObjects: [seg1.objectId, seg2.objectId],
              objectTypes,
              type: "cross", // Will be determined later
              angle: 0,
              elevation: Math.max(seg1.elevation, seg2.elevation),
              radius: Math.max(seg1.width, seg2.width) / 2,
              visualConfig: getIntersectionVisualConfig(objectTypes),
            };

            intersections.push(newIntersection);
          }
        }
      }
    }
  }

  // Classify intersection types based on connected objects
  intersections.forEach((intersection) => {
    intersection.type = getIntersectionType(
      intersection.connectedObjects,
      intersection.objectTypes
    );

    // Update visual config based on final type
    intersection.visualConfig = getIntersectionVisualConfig(
      intersection.objectTypes
    );
  });

  return intersections;
}

/**
 * Generate intersection geometry with proper elevation and typing
 */
export function generateIntersectionGeometry(
  intersection: GenericIntersection
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  const radius = intersection.radius * 1.2; // Make intersection slightly larger
  const elevation = intersection.elevation + 0.001; // Slightly above object surface

  // Create geometry based on intersection type
  const segments = intersection.type === "cross" ? 32 : 16;
  const vertices: number[] = [];
  const indices: number[] = [];

  // Center vertex
  vertices.push(intersection.position.x, elevation, intersection.position.z);

  // Outer vertices
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = intersection.position.x + Math.cos(angle) * radius;
    const z = intersection.position.z + Math.sin(angle) * radius;
    vertices.push(x, elevation, z);
  }

  // Create triangles from center to outer ring
  for (let i = 1; i < segments; i++) {
    indices.push(0, i, i + 1);
  }
  indices.push(0, segments, 1); // Close the circle

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

/**
 * Generate intersection markings based on connected object types
 */
export function generateIntersectionMarkings(
  intersection: GenericIntersection
): THREE.Group {
  const group = new THREE.Group();
  const markingElevation = intersection.elevation + 0.002;

  // Add type-specific markings
  if (intersection.objectTypes.includes("road")) {
    // Road intersection markings (crosswalks, lane dividers)
    addRoadIntersectionMarkings(group, intersection, markingElevation);
  }

  if (intersection.objectTypes.includes("wall")) {
    // Wall intersection markings (corner reinforcements)
    addWallIntersectionMarkings(group, intersection, markingElevation);
  }

  if (intersection.objectTypes.includes("water")) {
    // Water intersection markings (flow indicators)
    addWaterIntersectionMarkings(group, intersection, markingElevation);
  }

  return group;
}

function addRoadIntersectionMarkings(
  group: THREE.Group,
  intersection: GenericIntersection,
  elevation: number
) {
  // Crosswalk markings for road intersections
  if (intersection.type === "cross" || intersection.type === "T-junction") {
    const markingGeometry = new THREE.PlaneGeometry(
      0.4,
      intersection.radius * 1.5
    );
    markingGeometry.rotateX(-Math.PI / 2);

    const numMarkings = intersection.type === "cross" ? 4 : 3;
    for (let i = 0; i < numMarkings; i++) {
      const angle = (i / numMarkings) * Math.PI * 2;
      const x =
        intersection.position.x + Math.cos(angle) * intersection.radius * 0.8;
      const z =
        intersection.position.z + Math.sin(angle) * intersection.radius * 0.8;

      const marking = new THREE.Mesh(
        markingGeometry.clone(),
        new THREE.MeshStandardMaterial({
          color: "#ffffff",
          transparent: true,
          opacity: 0.9,
        })
      );

      marking.position.set(x, elevation, z);
      marking.rotation.y = angle;
      group.add(marking);
    }
  }
}

function addWallIntersectionMarkings(
  group: THREE.Group,
  intersection: GenericIntersection,
  elevation: number
) {
  // Corner reinforcement markings
  const cornerGeometry = new THREE.BoxGeometry(0.1, 0.05, 0.1);
  const cornerMaterial = new THREE.MeshStandardMaterial({
    color: "#999999",
    metalness: 0.3,
    roughness: 0.7,
  });

  const corner = new THREE.Mesh(cornerGeometry, cornerMaterial);
  corner.position.set(
    intersection.position.x,
    elevation,
    intersection.position.z
  );
  group.add(corner);
}

function addWaterIntersectionMarkings(
  group: THREE.Group,
  intersection: GenericIntersection,
  elevation: number
) {
  // Flow direction indicators
  const arrowGeometry = new THREE.ConeGeometry(0.1, 0.2, 4);
  const arrowMaterial = new THREE.MeshStandardMaterial({
    color: "#0099cc",
    transparent: true,
    opacity: 0.7,
  });

  for (let i = 0; i < intersection.connectedObjects.length; i++) {
    const angle = (i / intersection.connectedObjects.length) * Math.PI * 2;
    const x =
      intersection.position.x + Math.cos(angle) * intersection.radius * 0.5;
    const z =
      intersection.position.z + Math.sin(angle) * intersection.radius * 0.5;

    const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial);
    arrow.position.set(x, elevation, z);
    arrow.rotation.y = angle;
    group.add(arrow);
  }
}

/**
 * Create complete intersection component
 */
export function createGenericIntersectionComponent(
  intersection: GenericIntersection
): THREE.Group {
  const group = new THREE.Group();

  // Main intersection surface
  const geometry = generateIntersectionGeometry(intersection);
  const visualConfig =
    intersection.visualConfig ||
    getIntersectionVisualConfig(intersection.objectTypes);

  const material = new THREE.MeshStandardMaterial({
    color: visualConfig.surfaces?.color || "#404040",
    roughness: visualConfig.surfaces?.roughness || 0.8,
    metalness: visualConfig.surfaces?.metalness || 0.1,
    ...(visualConfig.surfaces?.emissive && {
      emissive: visualConfig.surfaces.emissive,
      emissiveIntensity: visualConfig.surfaces.emissiveIntensity || 0.1,
    }),
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.objectId = intersection.id;
  mesh.userData.objectType = "intersection";
  group.add(mesh);

  // Add markings
  const markings = generateIntersectionMarkings(intersection);
  group.add(markings);

  return group;
}

/**
 * Optimize object connections at intersections
 */
export function optimizeObjectConnections(
  objects: GenericObjectData[],
  intersections: GenericIntersection[]
): GenericObjectData[] {
  const optimizedObjects = objects.map((obj) => ({
    ...obj,
    points: [...obj.points],
  }));

  intersections.forEach((intersection) => {
    intersection.connectedObjects.forEach((objectId) => {
      const object = optimizedObjects.find((o) => o.id === objectId);
      if (!object) return;

      // Check if object endpoints are close to intersection
      const startDist = distance(object.points[0], intersection.position);
      const endDist = distance(
        object.points[object.points.length - 1],
        intersection.position
      );

      const snapDistance = intersection.radius * 0.5;

      // Snap object endpoints to intersection center if they're close
      if (startDist < snapDistance) {
        object.points[0] = {
          x: intersection.position.x,
          z: intersection.position.z,
        };
      }

      if (endDist < snapDistance) {
        object.points[object.points.length - 1] = {
          x: intersection.position.x,
          z: intersection.position.z,
        };
      }
    });
  });

  return optimizedObjects;
}

/**
 * Main function to process objects and generate intersections
 */
export function processGenericObjectSystem(objects: GenericObjectData[]): {
  optimizedObjects: GenericObjectData[];
  intersections: GenericIntersection[];
} {
  // Detect intersections
  const intersections = detectGenericIntersections(objects);

  // Optimize object connections
  const optimizedObjects = optimizeObjectConnections(objects, intersections);

  return {
    optimizedObjects,
    intersections,
  };
}

const exports = {
  detectGenericIntersections,
  generateIntersectionGeometry,
  generateIntersectionMarkings,
  createGenericIntersectionComponent,
  optimizeObjectConnections,
  processGenericObjectSystem,
};

export default exports;
