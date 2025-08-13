import React, { useMemo } from "react";
import * as THREE from "three";
import { useStore } from "@/store/useStore";
import { RoadObj, RoadPoint } from "@/store/storeTypes";

interface RoadComponentProps {
  data: RoadObj;
}

// Road type configurations
const ROAD_CONFIGS = {
  residential: {
    width: 6,
    color: "#404040",
    centerLine: true,
    centerLineDashed: true,
    sideLines: true,
    centerLineColor: "#ffff00",
    sideLineColor: "#ffffff",
    centerLineWidth: 0.15,
    sideLineWidth: 0.1,
  },
  highway: {
    width: 8,
    color: "#383838",
    centerLine: true,
    centerLineDashed: true,
    sideLines: true,
    centerLineColor: "#ffff00",
    sideLineColor: "#ffffff",
    centerLineWidth: 0.2,
    sideLineWidth: 0.15,
  },
  dirt: {
    width: 4,
    color: "#8B4513",
    centerLine: false,
    centerLineDashed: false,
    sideLines: false,
    centerLineColor: "#000000",
    sideLineColor: "#000000",
    centerLineWidth: 0,
    sideLineWidth: 0,
  },
  pedestrian: {
    width: 2,
    color: "#606060",
    centerLine: false,
    centerLineDashed: false,
    sideLines: true,
    centerLineColor: "#000000",
    sideLineColor: "#ffffff",
    centerLineWidth: 0,
    sideLineWidth: 0.05,
  },
};

function createDashedLineGeometry(
  points: THREE.Vector3[],
  dashSize = 0.5,
  gapSize = 0.5
): THREE.BufferGeometry {
  const vertices: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];
    const distance = start.distanceTo(end);
    const direction = end.clone().sub(start).normalize();

    let currentDistance = 0;
    let isDash = true;
    let vertexIndex = vertices.length / 3;

    while (currentDistance < distance) {
      const segmentLength = isDash ? dashSize : gapSize;
      const endDistance = Math.min(currentDistance + segmentLength, distance);

      if (isDash) {
        const segStart = start
          .clone()
          .add(direction.clone().multiplyScalar(currentDistance));
        const segEnd = start
          .clone()
          .add(direction.clone().multiplyScalar(endDistance));

        vertices.push(segStart.x, segStart.y, segStart.z);
        vertices.push(segEnd.x, segEnd.y, segEnd.z);

        indices.push(vertexIndex, vertexIndex + 1);
        vertexIndex += 2;
      }

      currentDistance = endDistance;
      isDash = !isDash;
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.setIndex(indices);
  return geometry;
}

function createBezierCurve(
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

function generateRoadGeometry(
  roadPoints: RoadPoint[],
  width: number
): {
  roadGeometry: THREE.BufferGeometry;
  centerLinePoints: THREE.Vector3[];
  roadPath: THREE.Vector3[];
} {
  if (roadPoints.length < 2) {
    return {
      roadGeometry: new THREE.BufferGeometry(),
      centerLinePoints: [],
      roadPath: [],
    };
  }

  const roadPath: THREE.Vector3[] = [];
  const roadVertices: number[] = [];
  const roadIndices: number[] = [];

  // Generate path points (including curves)
  for (let i = 0; i < roadPoints.length - 1; i++) {
    const start = new THREE.Vector3(roadPoints[i].x, 0, roadPoints[i].z);
    const end = new THREE.Vector3(roadPoints[i + 1].x, 0, roadPoints[i + 1].z);

    if (roadPoints[i].controlPoint) {
      const control = new THREE.Vector3(
        roadPoints[i].controlPoint?.x,
        0,
        roadPoints[i].controlPoint?.z
      );
      const curvePoints = createBezierCurve(start, end, control);
      roadPath.push(...curvePoints);
    } else {
      if (i === 0) roadPath.push(start);
      roadPath.push(end);
    }
  }

  // Generate road geometry from path
  const halfWidth = width / 2;
  let vertexIndex = 0;

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
      // Average direction for smooth corners
      const prev = roadPath[i - 1].clone().sub(point).normalize();
      const next = roadPath[i + 1].clone().sub(point).normalize();
      direction = prev.add(next).normalize();
    }

    const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x);

    const leftPoint = point
      .clone()
      .add(perpendicular.clone().multiplyScalar(halfWidth));
    const rightPoint = point
      .clone()
      .add(perpendicular.clone().multiplyScalar(-halfWidth));

    roadVertices.push(
      leftPoint.x,
      leftPoint.y,
      leftPoint.z,
      rightPoint.x,
      rightPoint.y,
      rightPoint.z
    );

    if (i > 0) {
      const baseIndex = vertexIndex - 2;
      // Create quad from previous and current points
      roadIndices.push(
        baseIndex,
        baseIndex + 1,
        baseIndex + 2,
        baseIndex + 1,
        baseIndex + 3,
        baseIndex + 2
      );
    }

    vertexIndex += 2;
  }

  const roadGeometry = new THREE.BufferGeometry();
  roadGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(roadVertices, 3)
  );
  roadGeometry.setIndex(roadIndices);
  roadGeometry.computeVertexNormals();

  return {
    roadGeometry,
    centerLinePoints: roadPath,
    roadPath,
  };
}

export function Road({ data }: RoadComponentProps) {
  const selectedId = useStore((s) => s.selectedId);
  const isSelected = selectedId === data.id;

  const roadConfig = ROAD_CONFIGS[data.roadType] || ROAD_CONFIGS.residential;
  const roadWidth = data.width || roadConfig.width;
  const roadColor = data.color || roadConfig.color;

  const geometries = useMemo(() => {
    return generateRoadGeometry(data.points, roadWidth);
  }, [data.points, roadWidth]);

  const centerLineDashedGeometry = useMemo(() => {
    if (
      !roadConfig.centerLine ||
      !roadConfig.centerLineDashed ||
      geometries.centerLinePoints.length === 0
    ) {
      return null;
    }
    return createDashedLineGeometry(geometries.centerLinePoints, 1, 0.5);
  }, [
    geometries.centerLinePoints,
    roadConfig.centerLine,
    roadConfig.centerLineDashed,
  ]);

  const centerLineSolidGeometry = useMemo(() => {
    if (
      !roadConfig.centerLine ||
      roadConfig.centerLineDashed ||
      geometries.centerLinePoints.length === 0
    ) {
      return null;
    }
    const geometry = new THREE.BufferGeometry();
    const vertices = geometries.centerLinePoints.flatMap((p) => [
      p.x,
      p.y + 0.001,
      p.z,
    ]);
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3)
    );
    return geometry;
  }, [
    geometries.centerLinePoints,
    roadConfig.centerLine,
    roadConfig.centerLineDashed,
  ]);

  const sideLineGeometries = useMemo(() => {
    if (!roadConfig.sideLines || geometries.roadPath.length === 0) {
      return { left: null, right: null };
    }

    const halfWidth = roadWidth / 2;
    const leftPoints: THREE.Vector3[] = [];
    const rightPoints: THREE.Vector3[] = [];

    for (let i = 0; i < geometries.roadPath.length; i++) {
      const point = geometries.roadPath[i];
      let direction: THREE.Vector3;

      if (i === 0 && geometries.roadPath.length > 1) {
        direction = geometries.roadPath[i + 1].clone().sub(point).normalize();
      } else if (i === geometries.roadPath.length - 1) {
        direction = point
          .clone()
          .sub(geometries.roadPath[i - 1])
          .normalize();
      } else {
        const prev = geometries.roadPath[i - 1].clone().sub(point).normalize();
        const next = geometries.roadPath[i + 1].clone().sub(point).normalize();
        direction = prev.add(next).normalize();
      }

      const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x);
      leftPoints.push(
        point.clone().add(perpendicular.clone().multiplyScalar(halfWidth * 0.9))
      );
      rightPoints.push(
        point
          .clone()
          .add(perpendicular.clone().multiplyScalar(-halfWidth * 0.9))
      );
    }

    const leftGeometry = new THREE.BufferGeometry();
    const rightGeometry = new THREE.BufferGeometry();

    leftGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        leftPoints.flatMap((p) => [p.x, p.y + 0.001, p.z]),
        3
      )
    );
    rightGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        rightPoints.flatMap((p) => [p.x, p.y + 0.001, p.z]),
        3
      )
    );

    return { left: leftGeometry, right: rightGeometry };
  }, [geometries.roadPath, roadConfig.sideLines, roadWidth]);

  return (
    <group
      userData={{ objectId: data.id }}
      position={data.position}
      rotation={data.rotation}
      scale={data.scale}
    >
      {/* Road surface */}
      <mesh geometry={geometries.roadGeometry}>
        <meshStandardMaterial
          color={roadColor}
          emissive={
            isSelected ? new THREE.Color(0x004400) : new THREE.Color(0x000000)
          }
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      </mesh>

      {/* Center line - dashed */}
      {centerLineDashedGeometry && (
        <line>
          <bufferGeometry attach="geometry">
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array(
                  geometries.centerLinePoints.flatMap((p) => [
                    p.x,
                    p.y + 0.001,
                    p.z,
                  ])
                ),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={roadConfig.centerLineColor}
            linewidth={roadConfig.centerLineWidth * 10}
          />
        </line>
      )}

      {/* Center line - solid */}
      {centerLineSolidGeometry && (
        <line>
          <bufferGeometry attach="geometry">
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array(
                  geometries.centerLinePoints.flatMap((p) => [
                    p.x,
                    p.y + 0.001,
                    p.z,
                  ])
                ),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={roadConfig.centerLineColor}
            linewidth={roadConfig.centerLineWidth * 10}
          />
        </line>
      )}

      {/* Side lines */}
      {sideLineGeometries.left && (
        <line>
          <bufferGeometry attach="geometry">
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array(
                  sideLineGeometries.left.attributes.position.array
                ),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={roadConfig.sideLineColor}
            linewidth={roadConfig.sideLineWidth * 10}
          />
        </line>
      )}
      {sideLineGeometries.right && (
        <line>
          <bufferGeometry attach="geometry">
            <bufferAttribute
              attach="attributes-position"
              args={[
                new Float32Array(
                  sideLineGeometries.right.attributes.position.array
                ),
                3,
              ]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color={roadConfig.sideLineColor}
            linewidth={roadConfig.sideLineWidth * 10}
          />
        </line>
      )}

      {/* Selection indicators */}
      {isSelected && (
        <group>
          {/* Bounding box indicator */}
          {data.points.map((point, index) => (
            <mesh key={index} position={[point.x, 0.1, point.z]}>
              <sphereGeometry args={[0.2]} />
              <meshStandardMaterial color="#00ff00" transparent opacity={0.7} />
            </mesh>
          ))}

          {/* Control points for curves */}
          {data.points.map(
            (point, index) =>
              point.controlPoint && (
                <group key={`control-${index}`}>
                  <mesh
                    position={[point.controlPoint.x, 0.1, point.controlPoint.z]}
                  >
                    <boxGeometry args={[0.3, 0.1, 0.3]} />
                    <meshStandardMaterial
                      color="#ffff00"
                      transparent
                      opacity={0.7}
                    />
                  </mesh>
                  {/* Control line */}
                  <line>
                    <bufferGeometry attach="geometry">
                      <bufferAttribute
                        attach="attributes-position"
                        args={[
                          new Float32Array([
                            point.x,
                            0.1,
                            point.z,
                            point.controlPoint.x,
                            0.1,
                            point.controlPoint.z,
                          ]),
                          3,
                        ]}
                      />
                    </bufferGeometry>
                    <lineBasicMaterial color="#ffff00" />
                  </line>
                </group>
              )
          )}
        </group>
      )}
    </group>
  );
}

export default Road;
