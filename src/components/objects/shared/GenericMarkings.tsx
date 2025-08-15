// src/components/build-objects/shared/GenericMarkings.tsx
import React, { useMemo } from "react";
import * as THREE from "three";
import { MarkingConfig, ObjectVisualConfig } from "./types";

interface GenericMarkingsProps {
  centerLinePoints: THREE.Vector3[];
  pathPoints: THREE.Vector3[];
  visualConfig: ObjectVisualConfig;
  objectWidth: number;
  objectElevation: number;
  objectThickness: number;
  objectType: string; // "road", "wall", "water"
}

interface DashSegment {
  start: THREE.Vector3;
  end: THREE.Vector3;
  length: number;
  center: THREE.Vector3;
  direction: THREE.Vector3;
  angle: number;
}

export function GenericMarkings({
  centerLinePoints,
  pathPoints,
  visualConfig,
  objectWidth,
  objectElevation,
  objectThickness,
  objectType,
}: GenericMarkingsProps) {
  // Calculate marking elevation based on object type
  const markingElevation = useMemo(() => {
    const baseElevation = objectElevation + objectThickness;
    switch (objectType) {
      case "road":
        return baseElevation + 0.02; // Roads: markings on top
      case "wall":
        return baseElevation + 0.05; // Walls: markings slightly above
      case "water":
        return objectElevation - 0.01; // Water: markings slightly below surface
      default:
        return baseElevation + 0.01;
    }
  }, [objectElevation, objectThickness, objectType]);

  // Generate dashed line segments
  const generateDashSegments = useMemo(() => {
    return (points: THREE.Vector3[], config: MarkingConfig): DashSegment[] => {
      if (!config.enabled || config.style === "solid" || points.length === 0) {
        return [];
      }

      const dashLength = config.dashLength || 1.5;
      const gapLength = config.gapLength || 0.8;
      const lineWidth = config.width;
      const lineHeight = objectThickness * 0.1;

      const segments: DashSegment[] = [];
      let currentDistance = 0;
      let inDash = true;
      let dashProgress = 0;

      // Initialize dash state
      const initialOffset = currentDistance % (dashLength + gapLength);
      if (initialOffset > dashLength) {
        inDash = false;
        dashProgress = initialOffset - dashLength;
      } else {
        inDash = true;
        dashProgress = initialOffset;
      }

      for (let i = 0; i < points.length - 1; i++) {
        const start = points[i];
        const end = points[i + 1];
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
            const dashStart = start
              .clone()
              .add(direction.clone().multiplyScalar(segmentProgress));
            dashStart.y = markingElevation;

            const dashEnd = start
              .clone()
              .add(
                direction.clone().multiplyScalar(segmentProgress + stepDistance)
              );
            dashEnd.y = markingElevation;

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
          currentDistance += stepDistance;

          if (dashProgress >= (inDash ? dashLength : gapLength)) {
            inDash = !inDash;
            dashProgress = 0;
          }
        }
      }

      return segments.map((segment) => ({
        ...segment,
        center: segment.center.clone(),
        start: segment.start.clone(),
        end: segment.end.clone(),
      }));
    };
  }, [markingElevation, objectThickness]);

  // Center line dashes
  const centerLineDashes = useMemo(() => {
    if (!visualConfig.centerLine?.enabled || !centerLinePoints.length) {
      return [];
    }

    return generateDashSegments(centerLinePoints, visualConfig.centerLine);
  }, [centerLinePoints, visualConfig.centerLine, generateDashSegments]);

  // Solid center line geometry
  const solidCenterLineGeometry = useMemo(() => {
    if (
      !visualConfig.centerLine?.enabled ||
      visualConfig.centerLine.style !== "solid" ||
      centerLinePoints.length === 0
    ) {
      return null;
    }

    const geometry = new THREE.BufferGeometry();
    const vertices = centerLinePoints.flatMap((p) => [
      p.x,
      markingElevation,
      p.z,
    ]);
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    return geometry;
  }, [centerLinePoints, visualConfig.centerLine, markingElevation]);

  // Side elements (lines and curbs)
  const sideElements = useMemo(() => {
    if (pathPoints.length === 0) {
      return { sideLines: null, curbs: null };
    }

    const halfWidth = objectWidth / 2;
    const curbHeight = visualConfig.curbs?.height || 0.12;
    const curbWidth = visualConfig.curbs?.width || 0.15;

    const leftLineVertices: number[] = [];
    const rightLineVertices: number[] = [];
    const leftCurbVertices: number[] = [];
    const rightCurbVertices: number[] = [];

    for (let i = 0; i < pathPoints.length; i++) {
      const point = pathPoints[i];
      let direction: THREE.Vector3;

      // Calculate direction at this point
      if (i === 0 && pathPoints.length > 1) {
        direction = pathPoints[i + 1].clone().sub(point).normalize();
      } else if (i === pathPoints.length - 1) {
        direction = point
          .clone()
          .sub(pathPoints[i - 1])
          .normalize();
      } else {
        const prev = pathPoints[i - 1].clone().sub(point).normalize();
        const next = pathPoints[i + 1].clone().sub(point).normalize();
        direction = prev.add(next).normalize();
      }

      const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x);

      // Side line points
      if (visualConfig.sideLines?.enabled) {
        const offset = visualConfig.sideLines.offset || halfWidth * 0.9;

        const leftLinePoint = new THREE.Vector3(
          point.x + perpendicular.x * offset,
          markingElevation,
          point.z + perpendicular.z * offset
        );
        const rightLinePoint = new THREE.Vector3(
          point.x - perpendicular.x * offset,
          markingElevation,
          point.z - perpendicular.z * offset
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

      // Curb geometry
      if (visualConfig.curbs?.enabled) {
        const baseY = objectElevation + objectThickness;

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

        // Add curb vertices
        leftCurbVertices.push(
          leftCurbInner.x,
          leftCurbInner.y,
          leftCurbInner.z,
          leftCurbOuter.x,
          leftCurbOuter.y,
          leftCurbOuter.z,
          leftCurbInner.x,
          baseY - objectThickness * 0.3,
          leftCurbInner.z,
          leftCurbOuter.x,
          baseY - objectThickness * 0.3,
          leftCurbOuter.z
        );

        rightCurbVertices.push(
          rightCurbInner.x,
          rightCurbInner.y,
          rightCurbInner.z,
          rightCurbOuter.x,
          rightCurbOuter.y,
          rightCurbOuter.z,
          rightCurbInner.x,
          baseY - objectThickness * 0.3,
          rightCurbInner.z,
          rightCurbOuter.x,
          baseY - objectThickness * 0.3,
          rightCurbOuter.z
        );
      }
    }

    // Generate curb indices
    const leftCurbIndices: number[] = [];
    const rightCurbIndices: number[] = [];

    for (let i = 0; i < pathPoints.length - 1; i++) {
      const leftBase = i * 4;
      const rightBase = i * 4;

      // Left curb triangles
      leftCurbIndices.push(leftBase, leftBase + 4, leftBase + 1);
      leftCurbIndices.push(leftBase + 1, leftBase + 4, leftBase + 5);
      leftCurbIndices.push(leftBase + 1, leftBase + 5, leftBase + 3);
      leftCurbIndices.push(leftBase + 3, leftBase + 5, leftBase + 7);
      leftCurbIndices.push(leftBase, leftBase + 1, leftBase + 2);
      leftCurbIndices.push(leftBase + 1, leftBase + 3, leftBase + 2);

      // Right curb triangles
      rightCurbIndices.push(rightBase, rightBase + 4, rightBase + 1);
      rightCurbIndices.push(rightBase + 1, rightBase + 4, rightBase + 5);
      rightCurbIndices.push(rightBase + 1, rightBase + 5, rightBase + 3);
      rightCurbIndices.push(rightBase + 3, rightBase + 5, rightBase + 7);
      rightCurbIndices.push(rightBase, rightBase + 1, rightBase + 2);
      rightCurbIndices.push(rightBase + 1, rightBase + 3, rightBase + 2);
    }

    // Create geometries
    let leftLineGeometry = null;
    let rightLineGeometry = null;
    let leftCurbGeometry = null;
    let rightCurbGeometry = null;

    if (visualConfig.sideLines?.enabled && leftLineVertices.length > 0) {
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

    if (visualConfig.curbs?.enabled && leftCurbVertices.length > 0) {
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
    pathPoints,
    visualConfig.sideLines,
    visualConfig.curbs,
    objectWidth,
    markingElevation,
    objectElevation,
    objectThickness,
  ]);

  // Edge markings for walls and water
  const edgeElements = useMemo(() => {
    if (!visualConfig.edges?.enabled || pathPoints.length === 0) {
      return null;
    }

    const edgeVertices: number[] = [];
    const offset = visualConfig.edges.offset || 0.1;

    for (let i = 0; i < pathPoints.length; i++) {
      const point = pathPoints[i];
      edgeVertices.push(point.x, markingElevation + offset, point.z);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(edgeVertices, 3)
    );

    return geometry;
  }, [pathPoints, visualConfig.edges, markingElevation]);

  return (
    <group>
      {/* Dashed center line using 3D box meshes */}
      {centerLineDashes.length > 0 && (
        <group>
          {centerLineDashes.map((dash, index) => (
            <mesh
              key={`center-dash-${index}`}
              position={[dash.center.x, dash.center.y, dash.center.z]}
              rotation={[0, dash.angle, 0]}
              scale={[
                dash.length,
                objectThickness * 0.1,
                visualConfig.centerLine!.width,
              ]}
            >
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial
                color={visualConfig.centerLine!.color}
                emissive={visualConfig.centerLine!.color}
                emissiveIntensity={0.3}
                roughness={0.7}
                metalness={0.1}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Solid center line */}
      {solidCenterLineGeometry && (
        <lineSegments geometry={solidCenterLineGeometry}>
          <lineBasicMaterial
            color={visualConfig.centerLine!.color}
            linewidth={visualConfig.centerLine!.width}
          />
        </lineSegments>
      )}

      {/* Side lines */}
      {sideElements.sideLines?.left && (
        <lineSegments geometry={sideElements.sideLines.left}>
          <lineBasicMaterial
            color={visualConfig.sideLines!.color}
            linewidth={visualConfig.sideLines!.width}
          />
        </lineSegments>
      )}

      {sideElements.sideLines?.right && (
        <lineSegments geometry={sideElements.sideLines.right}>
          <lineBasicMaterial
            color={visualConfig.sideLines!.color}
            linewidth={visualConfig.sideLines!.width}
          />
        </lineSegments>
      )}

      {/* Curbs */}
      {sideElements.curbs?.left && (
        <mesh geometry={sideElements.curbs.left}>
          <meshStandardMaterial
            color={visualConfig.curbs!.color}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
      )}

      {sideElements.curbs?.right && (
        <mesh geometry={sideElements.curbs.right}>
          <meshStandardMaterial
            color={visualConfig.curbs!.color}
            roughness={0.7}
            metalness={0.1}
          />
        </mesh>
      )}

      {/* Edge markings for walls/water */}
      {edgeElements && (
        <lineSegments geometry={edgeElements}>
          <lineBasicMaterial
            color={visualConfig.edges!.color}
            linewidth={visualConfig.edges!.width}
          />
        </lineSegments>
      )}
    </group>
  );
}

export default GenericMarkings;
