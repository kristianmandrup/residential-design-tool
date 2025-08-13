// src/components/bars/side/components/object/RoadAdvancedFeatures.tsx
import React from "react";
import { RoadObj, SceneObj } from "@/store";
import { reverseRoadDirection, cleanupRoadPoints } from "./roadUtils";

interface RoadAdvancedFeaturesProps {
  selected: RoadObj;
  updateObject: (id: string, patch: Partial<SceneObj>) => void;
  onPointSelectionChange: (index: number) => void;
}

export function RoadAdvancedFeatures({
  selected,
  updateObject,
  onPointSelectionChange,
}: RoadAdvancedFeaturesProps) {
  const points = selected.points || [];

  const handleReverseDirection = () => {
    const reversedPoints = reverseRoadDirection(points);
    updateObject(selected.id, { points: reversedPoints });
    onPointSelectionChange(0); // Reset to first point
  };

  const handleCleanupPoints = () => {
    const cleanedPoints = cleanupRoadPoints(points, 0.1);
    if (cleanedPoints.length !== points.length) {
      updateObject(selected.id, { points: cleanedPoints });
      onPointSelectionChange(0); // Reset to first point
      alert(
        `Removed ${points.length - cleanedPoints.length} duplicate/close points`
      );
    } else {
      alert("No cleanup needed - all points are properly spaced");
    }
  };

  const handleSmoothRoad = () => {
    if (points.length < 3) {
      alert("Need at least 3 points to smooth the road");
      return;
    }

    const smoothedPoints = points.map((point, index) => {
      // Don't add curves to the last point
      if (index >= points.length - 1) return point;

      // Skip if already has a control point
      if (point.controlPoint) return point;

      // Add subtle curves to straight segments
      const nextPoint = points[index + 1];
      if (nextPoint) {
        const dx = nextPoint.x - point.x;
        const dz = nextPoint.z - point.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        // Only add curves to longer segments
        if (distance > 2) {
          const midX = (point.x + nextPoint.x) / 2;
          const midZ = (point.z + nextPoint.z) / 2;

          // Small perpendicular offset for subtle curve
          const perpX = -dz / distance;
          const perpZ = dx / distance;
          const offset = Math.min(distance * 0.1, 1); // 10% of distance, max 1 unit

          return {
            ...point,
            controlPoint: {
              x: midX + perpX * offset,
              z: midZ + perpZ * offset,
            },
          };
        }
      }

      return point;
    });

    updateObject(selected.id, { points: smoothedPoints });
  };

  const handleStraightenRoad = () => {
    const straightenedPoints = points.map((point) => ({
      x: point.x,
      z: point.z,
      // Remove controlPoint
    }));

    updateObject(selected.id, { points: straightenedPoints });
  };

  const handleGenerateIntersection = () => {
    // Placeholder for intersection generation
    alert(
      "Intersection generation coming soon! This will analyze nearby roads and create proper intersection geometry."
    );
  };

  const handleOptimizeForTraffic = () => {
    // Placeholder for traffic optimization
    alert(
      "Traffic optimization coming soon! This will adjust road widths and add lanes based on expected traffic flow."
    );
  };

  return (
    <div className="space-y-3">
      {/* Primary Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleReverseDirection}
          className="px-3 py-2 text-sm text-gray-700 bg-gradient-to-r from-gray-200 to-gray-300 
                   rounded hover:from-gray-300 hover:to-gray-400 transition-all hover:shadow-lg hover:-translate-y-0.5
                   focus:outline-none focus:ring-2 focus:ring-gray-500/50"
        >
          🔄 Reverse Direction
        </button>

        <button
          onClick={handleCleanupPoints}
          className="px-3 py-2 text-sm text-white bg-gradient-to-r from-blue-500 to-blue-600 
                   rounded hover:from-blue-600 hover:to-blue-700 transition-all hover:shadow-lg hover:-translate-y-0.5
                   focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          🧹 Cleanup Points
        </button>
      </div>

      {/* Curve Management */}
      <div className="space-y-2">
        <h6 className="flex items-center gap-1 text-xs font-medium text-gray-700">
          <span className="text-purple-500">🌊</span>
          Curve Management
        </h6>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleSmoothRoad}
            className="px-3 py-2 text-sm text-white bg-gradient-to-r from-green-500 to-green-600 
                     rounded hover:from-green-600 hover:to-green-700 transition-all hover:shadow-lg hover:-translate-y-0.5
                     focus:outline-none focus:ring-2 focus:ring-green-500/50"
          >
            ↗️ Add Curves
          </button>

          <button
            onClick={handleStraightenRoad}
            className="px-3 py-2 text-sm text-white bg-gradient-to-r from-orange-500 to-orange-600 
                     rounded hover:from-orange-600 hover:to-orange-700 transition-all hover:shadow-lg hover:-translate-y-0.5
                     focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          >
            📏 Straighten
          </button>
        </div>
      </div>

      {/* Advanced Features */}
      <div className="space-y-2">
        <h6 className="flex items-center gap-1 text-xs font-medium text-gray-700">
          <span className="text-purple-500">⚡</span>
          Advanced Features
        </h6>
        <div className="space-y-2">
          <button
            onClick={handleGenerateIntersection}
            className="w-full px-3 py-2 text-sm text-white bg-gradient-to-r from-purple-500 to-purple-600 
                     rounded hover:from-purple-600 hover:to-purple-700 transition-all hover:shadow-lg hover:-translate-y-0.5
                     focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            🚦 Generate Intersection
          </button>

          <button
            onClick={handleOptimizeForTraffic}
            className="w-full px-3 py-2 text-sm text-white bg-gradient-to-r from-indigo-500 to-indigo-600 
                     rounded hover:from-indigo-600 hover:to-indigo-700 transition-all hover:shadow-lg hover:-translate-y-0.5
                     focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            🚗 Optimize for Traffic
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="p-3 space-y-1 text-xs text-gray-600 border border-yellow-200 rounded bg-yellow-50">
        <p className="mb-1 font-medium text-yellow-800">💡 Tips:</p>
        <ul className="space-y-1">
          <li>{`Use "Add Curves" for more natural-looking roads`}</li>
          <li>{`"Cleanup Points" removes overlapping or too-close points`}</li>
          <li>{`"Reverse Direction" changes start/end points`}</li>
          <li>Curves work best on longer road segments</li>
        </ul>
      </div>
    </div>
  );
}
