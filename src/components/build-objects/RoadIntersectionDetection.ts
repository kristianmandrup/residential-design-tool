import * as THREE from "three";
import { RoadPoint } from "@/store/storeTypes";

export interface RoadData {
  id: string;
  points: RoadPoint[];
  width: number;
  roadType: string;
}

export interface Intersection {
  id: string;
  position: { x: number; z: number };
  connectedRoads: string[];
  type: "T-junction" | "cross" | "Y-junction" | "multi-way";
  angle: number;
  radius: number;
}

export interface RoadSegment {
  roadId: string;
  startPoint: RoadPoint;
  endPoint: RoadPoint;
  controlPoint?: RoadPoint;
}

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
 * Convert road points to line segments
 */
function roadToSegments(road: RoadData): RoadSegment[] {
  const segments: RoadSegment[] = [];

  for (let i = 0; i < road.points.length - 1; i++) {
    segments.push({
      roadId: road.id,
      startPoint: road.points[i],
      endPoint: road.points[i + 1],
      controlPoint: road.points[i].controlPoint,
    });
  }

  return segments;
}

/**
 * Detect intersections between roads
 */
export function detectIntersections(
  roads: RoadData[],
  tolerance: number = 0.5
): Intersection[] {
  const intersections: Intersection[] = [];
  const segments = roads.flatMap((road) => roadToSegments(road));

  // Check all segment pairs for intersections
  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      const seg1 = segments[i];
      const seg2 = segments[j];

      // Skip if same road
      if (seg1.roadId === seg2.roadId) continue;

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
            // Add road to existing intersection
            if (!existingIntersection.connectedRoads.includes(seg1.roadId)) {
              existingIntersection.connectedRoads.push(seg1.roadId);
            }
            if (!existingIntersection.connectedRoads.includes(seg2.roadId)) {
              existingIntersection.connectedRoads.push(seg2.roadId);
            }
          } else {
            // Create new intersection
            intersections.push({
              id: `intersection-${Date.now()}-${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              position: intersection,
              connectedRoads: [seg1.roadId, seg2.roadId],
              type: "cross", // Will be determined later
              angle: 0,
              radius:
                Math.max(
                  roads.find((r) => r.id === seg1.roadId)?.width || 4,
                  roads.find((r) => r.id === seg2.roadId)?.width || 4
                ) / 2,
            });
          }
        }
      }
    }
  }

  // Classify intersection types based on number of connected roads
  intersections.forEach((intersection) => {
    const roadCount = intersection.connectedRoads.length;
    if (roadCount === 2) {
      intersection.type = "T-junction";
    } else if (roadCount === 3) {
      intersection.type = "Y-junction";
    } else if (roadCount === 4) {
      intersection.type = "cross";
    } else {
      intersection.type = "multi-way";
    }
  });

  return intersections;
}

/**
 * Generate intersection geometry
 */
export function generateIntersectionGeometry(
  intersection: Intersection,
  _roads: RoadData[]
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  const radius = intersection.radius * 1.5; // Make intersection slightly larger

  // Create a circular intersection base
  const segments = 32;
  const vertices: number[] = [];
  const indices: number[] = [];

  // Center vertex
  vertices.push(intersection.position.x, 0.001, intersection.position.z);

  // Outer vertices
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = intersection.position.x + Math.cos(angle) * radius;
    const z = intersection.position.z + Math.sin(angle) * radius;
    vertices.push(x, 0.001, z);
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
 * Generate intersection markings (lines, crosswalks, etc.)
 */
export function generateIntersectionMarkings(
  intersection: Intersection,
  _roads: RoadData[]
): THREE.Group {
  const group = new THREE.Group();

  // Add crosswalk markings for pedestrian intersections
  if (intersection.type === "cross" || intersection.type === "T-junction") {
    const markingGeometry = new THREE.PlaneGeometry(
      0.5,
      intersection.radius * 2
    );
    markingGeometry.rotateX(-Math.PI / 2);

    // Create striped crosswalk pattern
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const x =
        intersection.position.x + Math.cos(angle) * intersection.radius * 0.7;
      const z =
        intersection.position.z + Math.sin(angle) * intersection.radius * 0.7;

      const marking = new THREE.Mesh(
        markingGeometry.clone(),
        new THREE.MeshStandardMaterial({
          color: "#ffffff",
          transparent: true,
          opacity: 0.8,
        })
      );

      marking.position.set(x, 0.002, z);
      marking.rotation.y = angle;
      group.add(marking);
    }
  }

  return group;
}

/**
 * Create intersection component
 */
export function createIntersectionComponent(
  intersection: Intersection,
  roads: RoadData[]
): THREE.Group {
  const group = new THREE.Group();

  // Main intersection surface
  const geometry = generateIntersectionGeometry(intersection, roads);
  const material = new THREE.MeshStandardMaterial({
    color: "#404040",
    roughness: 0.8,
    metalness: 0.1,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.objectId = intersection.id;
  group.add(mesh);

  // Add markings
  const markings = generateIntersectionMarkings(intersection, roads);
  group.add(markings);

  return group;
}

/**
 * Optimize road connections at intersections
 */
export function optimizeRoadConnections(
  roads: RoadData[],
  intersections: Intersection[]
): RoadData[] {
  const optimizedRoads = roads.map((road) => ({ ...road }));

  intersections.forEach((intersection) => {
    intersection.connectedRoads.forEach((roadId) => {
      const road = optimizedRoads.find((r) => r.id === roadId);
      if (!road) return;

      // Check if road endpoints are close to intersection
      const startDist = distance(road.points[0], intersection.position);
      const endDist = distance(
        road.points[road.points.length - 1],
        intersection.position
      );

      const snapDistance = intersection.radius * 0.5;

      // Snap road endpoints to intersection center if they're close
      if (startDist < snapDistance) {
        road.points[0] = {
          x: intersection.position.x,
          z: intersection.position.z,
        };
      }

      if (endDist < snapDistance) {
        road.points[road.points.length - 1] = {
          x: intersection.position.x,
          z: intersection.position.z,
        };
      }
    });
  });

  return optimizedRoads;
}

/**
 * Main function to process roads and generate intersections
 */
export function processRoadSystem(roads: RoadData[]): {
  optimizedRoads: RoadData[];
  intersections: Intersection[];
} {
  // Detect intersections
  const intersections = detectIntersections(roads);

  // Optimize road connections
  const optimizedRoads = optimizeRoadConnections(roads, intersections);

  return {
    optimizedRoads,
    intersections,
  };
}
