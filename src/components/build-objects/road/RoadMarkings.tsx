// File: src/components/build-objects/road/RoadMarkings.tsx
import React from "react";
import * as THREE from "three";
import { RoadConfig } from "./roadConfig";

interface RoadMarkingsProps {
  centerLinePoints: THREE.Vector3[];
  roadPath: THREE.Vector3[];
  roadConfig: RoadConfig;
  roadWidth: number;
  roadElevation: number;
}

interface DashSegment {
  start: THREE.Vector3;
  end: THREE.Vector3;
  length: number;
  center: THREE.Vector3;
  direction: THREE.Vector3;
  angle: number;
}

export function RoadMarkings({
  centerLinePoints,
  roadPath,
  roadConfig,
  roadWidth,
  roadElevation,
}: RoadMarkingsProps) {
  // Enhanced center line geometry with proper distance tracking
  const centerLineDashes = React.useMemo(() => {
    if (!roadConfig.centerLine || centerLinePoints.length === 0) {
      return [];
    }

    const markingHeight = roadElevation + roadConfig.thickness + 0.02; // Raised for visibility

    if (roadConfig.centerLineDashed) {
      // Create proper 3D dashed line segments with distance tracking
      const dashLength = 1.5; // Length of each dash
      const gapLength = 0.8; // Length of each gap
      const lineWidth = 0.2; // Width of dash (now properly used!)
      const lineHeight = 0.02; // Height/thickness of dash (now properly used!)

      const segments: DashSegment[] = [];
      let currentDistance = 0; // Track cumulative distance along entire road (now properly used!)
      let inDash = true;
      let dashProgress = 0;

      // Start with a dash or gap based on total distance offset
      const initialOffset = currentDistance % (dashLength + gapLength);
      if (initialOffset > dashLength) {
        inDash = false;
        dashProgress = initialOffset - dashLength;
      } else {
        inDash = true;
        dashProgress = initialOffset;
      }

      for (let i = 0; i < centerLinePoints.length - 1; i++) {
        const start = centerLinePoints[i];
        const end = centerLinePoints[i + 1];
        const segmentLength = start.distanceTo(end);
        const direction = end.clone().sub(start).normalize();

        let segmentProgress = 0;

        while (segmentProgress < segmentLength) {
          const remainingInCurrentPhase = inDash
            ? dashLength - dashProgress
            : gapLength - dashProgress;
          const remainingInSegment = segmentLength - segmentProgress;
          const stepDistance = Math.min(
            remainingInCurrentPhase,
            remainingInSegment
          );

          if (inDash) {
            // Create a dash segment using lineWidth and lineHeight
            const dashStart = start
              .clone()
              .add(direction.clone().multiplyScalar(segmentProgress));
            dashStart.y = markingHeight;

            const dashEnd = start
              .clone()
              .add(
                direction.clone().multiplyScalar(segmentProgress + stepDistance)
              );
            dashEnd.y = markingHeight;

            const center = dashStart.clone().add(dashEnd).multiplyScalar(0.5);
            const angle = Math.atan2(direction.z, direction.x);

            segments.push({
              start: dashStart,
              end: dashEnd,
              length: stepDistance,
              center,
              direction: direction.clone(),
              angle,
            });
          }

          dashProgress += stepDistance;
          segmentProgress += stepDistance;
          currentDistance += stepDistance; // Properly accumulate total distance

          if (dashProgress >= (inDash ? dashLength : gapLength)) {
            inDash = !inDash;
            dashProgress = 0;
          }
        }
      }

      console.log(
        `🎨 Generated ${
          segments.length
        } center line dashes over ${currentDistance.toFixed(2)}m total distance`
      );

      return segments.map((segment) => ({
        position: [segment.center.x, segment.center.y, segment.center.z] as [
          number,
          number,
          number
        ],
        rotation: [0, segment.angle, 0] as [number, number, number],
        scale: [segment.length, lineHeight, lineWidth] as [
          number,
          number,
          number
        ],
      }));
    }

    return []; // No dashes for solid lines
  }, [
    centerLinePoints,
    roadConfig.centerLine,
    roadConfig.centerLineDashed,
    roadElevation,
    roadConfig.thickness,
  ]);

  // Solid center line geometry
  const solidCenterLineGeometry = React.useMemo(() => {
    if (
      !roadConfig.centerLine ||
      roadConfig.centerLineDashed ||
      centerLinePoints.length === 0
    ) {
      return null;
    }

    const markingHeight = roadElevation + roadConfig.thickness + 0.02;
    const geometry = new THREE.BufferGeometry();
    const vertices = centerLinePoints.flatMap((p) => [p.x, markingHeight, p.z]);
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    return geometry;
  }, [
    centerLinePoints,
    roadConfig.centerLine,
    roadConfig.centerLineDashed,
    roadElevation,
    roadConfig.thickness,
  ]);

  // Enhanced side lines and curbs
  const sideElements = React.useMemo(() => {
    if (roadPath.length === 0) {
      return { sideLines: null, curbs: null };
    }

    const halfWidth = roadWidth / 2;
    const markingHeight = roadElevation + roadConfig.thickness + 0.02;
    const curbHeight = 0.12; // Exaggerated curb height
    const curbWidth = 0.15; // Exaggerated curb width

    const leftLineVertices: number[] = [];
    const rightLineVertices: number[] = [];
    const leftCurbVertices: number[] = [];
    const rightCurbVertices: number[] = [];

    for (let i = 0; i < roadPath.length; i++) {
      const point = roadPath[i];
      let direction: THREE.Vector3;

      if (i === 0 && roadPath.length > 1) {
        direction = roadPath[i + 1].clone().sub(point).normalize();
      } else if (i === roadPath.length - 1) {
        direction = point
          .clone()
          .sub(roadPath[i - 1])
          .normalize();
      } else {
        const prev = roadPath[i - 1].clone().sub(point).normalize();
        const next = roadPath[i + 1].clone().sub(point).normalize();
        direction = prev.add(next).normalize();
      }

      const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x);

      // Side line points (only if enabled)
      if (roadConfig.sideLines) {
        const leftLinePoint = new THREE.Vector3(
          point.x + perpendicular.x * halfWidth * 0.9,
          markingHeight,
          point.z + perpendicular.z * halfWidth * 0.9
        );
        const rightLinePoint = new THREE.Vector3(
          point.x - perpendicular.x * halfWidth * 0.9,
          markingHeight,
          point.z - perpendicular.z * halfWidth * 0.9
        );

        leftLineVertices.push(
          leftLinePoint.x,
          leftLinePoint.y,
          leftLinePoint.z
        );
        rightLineVertices.push(
          rightLinePoint.x,
          rightLinePoint.y,
          rightLinePoint.z
        );
      }

      // Curb geometry - always create curbs for visual debugging
      const baseY = roadElevation + roadConfig.thickness;

      // Left curb positions
      const leftCurbInner = {
        x: point.x + perpendicular.x * halfWidth,
        y: baseY,
        z: point.z + perpendicular.z * halfWidth,
      };
      const leftCurbOuter = {
        x: point.x + perpendicular.x * (halfWidth + curbWidth),
        y: baseY + curbHeight,
        z: point.z + perpendicular.z * (halfWidth + curbWidth),
      };

      // Right curb positions
      const rightCurbInner = {
        x: point.x - perpendicular.x * halfWidth,
        y: baseY,
        z: point.z - perpendicular.z * halfWidth,
      };
      const rightCurbOuter = {
        x: point.x - perpendicular.x * (halfWidth + curbWidth),
        y: baseY + curbHeight,
        z: point.z - perpendicular.z * (halfWidth + curbWidth),
      };

      // Add curb vertices with proper indexing
      leftCurbVertices.push(
        // Top face vertices
        leftCurbInner.x,
        leftCurbInner.y,
        leftCurbInner.z,
        leftCurbOuter.x,
        leftCurbOuter.y,
        leftCurbOuter.z,
        // Bottom face vertices
        leftCurbInner.x,
        baseY - roadConfig.thickness * 0.3,
        leftCurbInner.z,
        leftCurbOuter.x,
        baseY - roadConfig.thickness * 0.3,
        leftCurbOuter.z
      );

      rightCurbVertices.push(
        // Top face vertices
        rightCurbInner.x,
        rightCurbInner.y,
        rightCurbInner.z,
        rightCurbOuter.x,
        rightCurbOuter.y,
        rightCurbOuter.z,
        // Bottom face vertices
        rightCurbInner.x,
        baseY - roadConfig.thickness * 0.3,
        rightCurbInner.z,
        rightCurbOuter.x,
        baseY - roadConfig.thickness * 0.3,
        rightCurbOuter.z
      );
    }

    // Generate curb indices using the proper base indices for each segment
    const leftCurbIndices: number[] = [];
    const rightCurbIndices: number[] = [];

    for (let i = 0; i < roadPath.length - 1; i++) {
      const leftBase = i * 4; // Each point adds 4 vertices to left curb
      const rightBase = i * 4; // Each point adds 4 vertices to right curb

      // Left curb triangles
      // Top face triangles
      leftCurbIndices.push(leftBase, leftBase + 4, leftBase + 1);
      leftCurbIndices.push(leftBase + 1, leftBase + 4, leftBase + 5);

      // Side face triangles (outer edge)
      leftCurbIndices.push(leftBase + 1, leftBase + 5, leftBase + 3);
      leftCurbIndices.push(leftBase + 3, leftBase + 5, leftBase + 7);

      // Front face triangles
      leftCurbIndices.push(leftBase, leftBase + 1, leftBase + 2);
      leftCurbIndices.push(leftBase + 1, leftBase + 3, leftBase + 2);

      // Right curb triangles (same pattern)
      // Top face triangles
      rightCurbIndices.push(rightBase, rightBase + 4, rightBase + 1);
      rightCurbIndices.push(rightBase + 1, rightBase + 4, rightBase + 5);

      // Side face triangles (outer edge)
      rightCurbIndices.push(rightBase + 1, rightBase + 5, rightBase + 3);
      rightCurbIndices.push(rightBase + 3, rightBase + 5, rightBase + 7);

      // Front face triangles
      rightCurbIndices.push(rightBase, rightBase + 1, rightBase + 2);
      rightCurbIndices.push(rightBase + 1, rightBase + 3, rightBase + 2);
    }

    // Create geometries
    let leftLineGeometry = null;
    let rightLineGeometry = null;
    let leftCurbGeometry = null;
    let rightCurbGeometry = null;

    // Side line geometries (using lineSegments for proper Three.js compatibility)
    if (roadConfig.sideLines && leftLineVertices.length > 0) {
      leftLineGeometry = new THREE.BufferGeometry();
      leftLineGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(leftLineVertices, 3)
      );

      rightLineGeometry = new THREE.BufferGeometry();
      rightLineGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(rightLineVertices, 3)
      );
    }

    // Curb geometries with proper separate indices
    if (leftCurbVertices.length > 0) {
      leftCurbGeometry = new THREE.BufferGeometry();
      leftCurbGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(leftCurbVertices, 3)
      );
      leftCurbGeometry.setIndex(leftCurbIndices);
      leftCurbGeometry.computeVertexNormals();

      rightCurbGeometry = new THREE.BufferGeometry();
      rightCurbGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(rightCurbVertices, 3)
      );
      rightCurbGeometry.setIndex(rightCurbIndices);
      rightCurbGeometry.computeVertexNormals();
    }

    return {
      sideLines: { left: leftLineGeometry, right: rightLineGeometry },
      curbs: { left: leftCurbGeometry, right: rightCurbGeometry },
    };
  }, [
    roadPath,
    roadConfig.sideLines,
    roadWidth,
    roadElevation,
    roadConfig.thickness,
  ]);

  return (
    <group>
      {/* Dashed center line using 3D box meshes */}
      {centerLineDashes.length > 0 && (
        <group>
          {centerLineDashes.map((dash, index) => (
            <mesh
              key={`center-dash-${index}`}
              position={dash.position}
              rotation={dash.rotation}
              scale={dash.scale}
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial
                color="#ffff00"
                emissive="#ffff00"
                emissiveIntensity={0.3}
                roughness={0.7}
                metalness={0.1}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Solid center line using lineSegments */}
      {solidCenterLineGeometry && (
        <lineSegments geometry={solidCenterLineGeometry}>
          <lineBasicMaterial color="#ffff00" />
        </lineSegments>
      )}

      {/* Side lines using lineSegments (fixed Three.js compatibility) */}
      {sideElements.sideLines?.left && (
        <lineSegments geometry={sideElements.sideLines.left}>
          <lineBasicMaterial color="#ffffff" />
        </lineSegments>
      )}

      {sideElements.sideLines?.right && (
        <lineSegments geometry={sideElements.sideLines.right}>
          <lineBasicMaterial color="#ffffff" />
        </lineSegments>
      )}

      {/* Enhanced curbs with bright debugging color */}
      {sideElements.curbs?.left && (
        <mesh geometry={sideElements.curbs.left}>
          <meshStandardMaterial
            color="#FF6B6B"
            emissive="#FF4444"
            emissiveIntensity={0.4}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
      )}

      {sideElements.curbs?.right && (
        <mesh geometry={sideElements.curbs.right}>
          <meshStandardMaterial
            color="#FF6B6B"
            emissive="#FF4444"
            emissiveIntensity={0.4}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
      )}

      {/* Debug info - remove this in production */}
      {process.env.NODE_ENV === "development" && (
        <group>
          {/* Show road bounds with wireframe */}
          <mesh position={[0, roadElevation + roadConfig.thickness + 0.1, 0]}>
            <boxGeometry args={[roadWidth, 0.01, roadPath.length]} />
            <meshBasicMaterial
              color="#00ff00"
              wireframe
              transparent
              opacity={0.2}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
