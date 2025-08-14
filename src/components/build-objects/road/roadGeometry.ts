// src/components/build-objects/road/roadGeometry.ts - Fixed with Better Error Handling
import * as THREE from "three";
import { RoadPoint } from "@/store/storeTypes";

export interface RoadGeometryResult {
  roadGeometry: THREE.BufferGeometry;
  centerLinePoints: THREE.Vector3[];
  roadPath: THREE.Vector3[];
}

export function createBezierCurve(
  start: THREE.Vector3,
  end: THREE.Vector3,
  control: THREE.Vector3,
  segments = 20
): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const point = new THREE.Vector3()
      .copy(start)
      .multiplyScalar((1 - t) * (1 - t))
      .add(control.clone().multiplyScalar(2 * (1 - t) * t))
      .add(end.clone().multiplyScalar(t * t));
    points.push(point);
  }
  return points;
}

export function generateRoadPath(
  roadPoints: RoadPoint[],
  elevation: number = 0
): THREE.Vector3[] {
  console.log("🛤️ Generating road path from points:", roadPoints);

  if (roadPoints.length === 0) {
    console.log("❌ No road points provided");
    return [];
  }

  if (roadPoints.length === 1) {
    console.log("📍 Single point road");
    return [new THREE.Vector3(roadPoints[0].x, elevation, roadPoints[0].z)];
  }

  const roadPath: THREE.Vector3[] = [];

  // Always add the first point
  roadPath.push(new THREE.Vector3(roadPoints[0].x, elevation, roadPoints[0].z));

  for (let i = 0; i < roadPoints.length - 1; i++) {
    const start = new THREE.Vector3(
      roadPoints[i].x,
      elevation,
      roadPoints[i].z
    );
    const end = new THREE.Vector3(
      roadPoints[i + 1].x,
      elevation,
      roadPoints[i + 1].z
    );

    if (roadPoints[i].controlPoint) {
      // Create curved segment
      const control = new THREE.Vector3(
        roadPoints[i].controlPoint!.x,
        elevation,
        roadPoints[i].controlPoint!.z
      );
      const curvePoints = createBezierCurve(start, end, control, 10);
      // Add curve points except the first one (to avoid duplication)
      roadPath.push(...curvePoints.slice(1));
    } else {
      // Straight segment - just add the end point
      roadPath.push(end);
    }
  }

  console.log(
    "🛤️ Generated path with",
    roadPath.length,
    "points at elevation",
    elevation
  );
  return roadPath;
}

export function generateRoadGeometry(
  roadPoints: RoadPoint[],
  width: number,
  elevation: number = 0,
  thickness: number = 0.1
): RoadGeometryResult {
  console.log("🏗️ Generating road geometry:", {
    pointCount: roadPoints.length,
    width,
    elevation,
    thickness,
  });

  // Validate inputs
  if (!roadPoints || roadPoints.length < 2) {
    console.log("❌ Not enough points for road geometry");
    return {
      roadGeometry: new THREE.BufferGeometry(),
      centerLinePoints: [],
      roadPath: [],
    };
  }

  if (width <= 0 || thickness <= 0) {
    console.log("❌ Invalid width or thickness");
    return {
      roadGeometry: new THREE.BufferGeometry(),
      centerLinePoints: [],
      roadPath: [],
    };
  }

  // Validate all points have valid coordinates
  const validPoints = roadPoints.every(
    (point) =>
      typeof point.x === "number" &&
      typeof point.z === "number" &&
      !isNaN(point.x) &&
      !isNaN(point.z)
  );

  if (!validPoints) {
    console.log("❌ Invalid road points detected", roadPoints);
    return {
      roadGeometry: new THREE.BufferGeometry(),
      centerLinePoints: [],
      roadPath: [],
    };
  }

  try {
    const roadPath = generateRoadPath(roadPoints, elevation);
    if (roadPath.length < 2) {
      console.log("❌ Generated path too short");
      return {
        roadGeometry: new THREE.BufferGeometry(),
        centerLinePoints: [],
        roadPath: [],
      };
    }

    const vertices: number[] = [];
    const indices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];
    const halfWidth = width / 2;

    console.log(
      "🔧 Creating road strip with width:",
      width,
      "elevation:",
      elevation,
      "thickness:",
      thickness
    );

    // Generate road strip vertices for both top and bottom surfaces
    for (let i = 0; i < roadPath.length; i++) {
      const point = roadPath[i];

      // Calculate direction vector for this point
      let direction: THREE.Vector3;

      if (i === 0) {
        // First point - use direction to next
        direction = roadPath[1].clone().sub(point).normalize();
      } else if (i === roadPath.length - 1) {
        // Last point - use direction from previous
        direction = point
          .clone()
          .sub(roadPath[i - 1])
          .normalize();
      } else {
        // Middle point - average of adjacent directions
        const prevDir = point
          .clone()
          .sub(roadPath[i - 1])
          .normalize();
        const nextDir = roadPath[i + 1].clone().sub(point).normalize();
        direction = prevDir.add(nextDir).normalize();

        // If the direction becomes zero (opposite directions), use perpendicular
        if (direction.length() < 0.1) {
          direction = roadPath[i + 1]
            .clone()
            .sub(roadPath[i - 1])
            .normalize();
        }
      }

      // Calculate perpendicular vector (rotate direction 90 degrees in XZ plane)
      const perpendicular = new THREE.Vector3(
        -direction.z,
        0,
        direction.x
      ).normalize();

      // Create top surface points (at road elevation + thickness)
      const topY = elevation + thickness;
      const topLeftPoint = point
        .clone()
        .add(perpendicular.clone().multiplyScalar(halfWidth));
      topLeftPoint.y = topY;
      const topRightPoint = point
        .clone()
        .add(perpendicular.clone().multiplyScalar(-halfWidth));
      topRightPoint.y = topY;

      // Create bottom surface points (at road elevation)
      const bottomY = elevation;
      const bottomLeftPoint = point
        .clone()
        .add(perpendicular.clone().multiplyScalar(halfWidth));
      bottomLeftPoint.y = bottomY;
      const bottomRightPoint = point
        .clone()
        .add(perpendicular.clone().multiplyScalar(-halfWidth));
      bottomRightPoint.y = bottomY;

      // Add vertices (top left, top right, bottom left, bottom right)
      vertices.push(
        topLeftPoint.x,
        topLeftPoint.y,
        topLeftPoint.z,
        topRightPoint.x,
        topRightPoint.y,
        topRightPoint.z,
        bottomLeftPoint.x,
        bottomLeftPoint.y,
        bottomLeftPoint.z,
        bottomRightPoint.x,
        bottomRightPoint.y,
        bottomRightPoint.z
      );

      // Add normals (up for top surface, down for bottom surface)
      normals.push(
        0,
        1,
        0, // top left
        0,
        1,
        0, // top right
        0,
        -1,
        0, // bottom left
        0,
        -1,
        0 // bottom right
      );

      // Add UVs
      const u = i / (roadPath.length - 1);
      uvs.push(
        0,
        u, // top left
        1,
        u, // top right
        0,
        u, // bottom left
        1,
        u // bottom right
      );
    }

    // Generate triangle indices for road surface
    for (let i = 0; i < roadPath.length - 1; i++) {
      const baseIndex = i * 4;

      // Top surface triangles
      indices.push(baseIndex, baseIndex + 4, baseIndex + 1);
      indices.push(baseIndex + 1, baseIndex + 4, baseIndex + 5);

      // Bottom surface triangles (reversed winding for correct normals)
      indices.push(baseIndex + 2, baseIndex + 3, baseIndex + 6);
      indices.push(baseIndex + 3, baseIndex + 7, baseIndex + 6);

      // Left side triangles
      indices.push(baseIndex, baseIndex + 2, baseIndex + 4);
      indices.push(baseIndex + 2, baseIndex + 6, baseIndex + 4);

      // Right side triangles
      indices.push(baseIndex + 1, baseIndex + 5, baseIndex + 3);
      indices.push(baseIndex + 3, baseIndex + 5, baseIndex + 7);
    }

    // Add end caps
    if (roadPath.length >= 2) {
      const startBase = 0;
      const endBase = (roadPath.length - 1) * 4;

      // Start cap
      indices.push(startBase, startBase + 2, startBase + 1);
      indices.push(startBase + 1, startBase + 2, startBase + 3);

      // End cap
      indices.push(endBase, endBase + 1, endBase + 2);
      indices.push(endBase + 1, endBase + 3, endBase + 2);
    }

    console.log("📐 Generated geometry:", {
      vertices: vertices.length / 3,
      triangles: indices.length / 3,
      pathPoints: roadPath.length,
      indicesLength: indices.length,
    });

    // Validate arrays
    if (vertices.length === 0 || indices.length === 0) {
      console.log("❌ Empty geometry arrays");
      return {
        roadGeometry: new THREE.BufferGeometry(),
        centerLinePoints: [],
        roadPath: [],
      };
    }

    // Create geometry
    const roadGeometry = new THREE.BufferGeometry();
    roadGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    roadGeometry.setAttribute(
      "normal",
      new THREE.Float32BufferAttribute(normals, 3)
    );
    roadGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    roadGeometry.setIndex(indices);

    // Compute vertex normals for better lighting
    roadGeometry.computeVertexNormals();

    // Validate final geometry
    const positionCount = roadGeometry.attributes.position.count;
    const indexCount = roadGeometry.index ? roadGeometry.index.count : 0;

    console.log("✅ Final geometry validation:", {
      positionCount,
      indexCount,
      triangleCount: indexCount / 3,
      hasPosition: !!roadGeometry.attributes.position,
      hasIndex: !!roadGeometry.index,
    });

    if (positionCount === 0 || indexCount === 0) {
      console.log("❌ Invalid final geometry");
      return {
        roadGeometry: new THREE.BufferGeometry(),
        centerLinePoints: [],
        roadPath: [],
      };
    }

    return {
      roadGeometry,
      centerLinePoints: roadPath,
      roadPath,
    };
  } catch (error) {
    console.error("❌ Error in generateRoadGeometry:", error);
    return {
      roadGeometry: new THREE.BufferGeometry(),
      centerLinePoints: [],
      roadPath: [],
    };
  }
}

// Simplified preview geometry for drawing mode
export function generatePreviewGeometry(
  roadPoints: RoadPoint[],
  width: number,
  elevation: number = 0.01,
  thickness: number = 0.02
): RoadGeometryResult {
  if (roadPoints.length === 0) {
    return {
      roadGeometry: new THREE.BufferGeometry(),
      centerLinePoints: [],
      roadPath: [],
    };
  }

  if (roadPoints.length === 1) {
    // Single point - small circle with elevation
    const point = roadPoints[0];
    const circleGeometry = new THREE.CircleGeometry(0.3, 8);
    circleGeometry.rotateX(-Math.PI / 2);
    circleGeometry.translate(point.x, elevation + thickness, point.z);

    return {
      roadGeometry: circleGeometry,
      centerLinePoints: [
        new THREE.Vector3(point.x, elevation + thickness, point.z),
      ],
      roadPath: [new THREE.Vector3(point.x, elevation + thickness, point.z)],
    };
  }

  // For multiple points in preview, use the same logic as final geometry but with preview settings
  return generateRoadGeometry(roadPoints, width, elevation, thickness);
}
