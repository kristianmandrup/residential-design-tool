// src/components/objects/geometry/bezierUtils.ts
import * as THREE from "three";

/**
 * Create Bezier curve points
 */
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
