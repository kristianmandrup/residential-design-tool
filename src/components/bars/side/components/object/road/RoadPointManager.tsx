// src/components/bars/side/components/object/RoadPointManager.tsx
import React, { useState } from "react";
import { RoadObj, SceneObj, RoadPoint } from "@/store/storeTypes";
import { NumberField, SelectField } from "@/components/generic";
import { createMidPoint, createControlPoint } from "./roadUtils";

interface RoadPointManagerProps {
  selected: RoadObj;
  updateObject: (id: string, patch: Partial<SceneObj>) => void;
}

export function RoadPointManager({
  selected,
  updateObject,
}: RoadPointManagerProps) {
  const [selectedPointIndex, setSelectedPointIndex] = useState(0);

  const points = selected.points || [];
  const selectedPoint = points[selectedPointIndex];

  const updatePoint = (index: number, updates: Partial<RoadPoint>) => {
    const newPoints = [...points];
    newPoints[index] = { ...newPoints[index], ...updates };
    updateObject(selected.id, { points: newPoints });
  };

  const addPoint = () => {
    const lastPoint = points[points.length - 1];
    const newPoint: RoadPoint = {
      x: (lastPoint?.x || 0) + 4,
      z: lastPoint?.z || 0,
    };
    updateObject(selected.id, { points: [...points, newPoint] });
    setSelectedPointIndex(points.length);
  };

  const insertPoint = (afterIndex: number) => {
    if (afterIndex >= points.length - 1) return;

    const point1 = points[afterIndex];
    const point2 = points[afterIndex + 1];
    const midPoint = createMidPoint(point1, point2);

    const newPoints = [...points];
    newPoints.splice(afterIndex + 1, 0, midPoint);
    updateObject(selected.id, { points: newPoints });
    setSelectedPointIndex(afterIndex + 1);
  };

  const removePoint = (index: number) => {
    if (points.length <= 2) return;
    const newPoints = points.filter((_, i) => i !== index);
    updateObject(selected.id, { points: newPoints });
    if (selectedPointIndex >= newPoints.length) {
      setSelectedPointIndex(Math.max(0, newPoints.length - 1));
    }
  };

  const addControlPoint = (index: number) => {
    const point = points[index];
    const nextPoint = points[index + 1];
    if (!point || !nextPoint) return;

    const controlPoint = createControlPoint(point, nextPoint);
    updatePoint(index, { controlPoint });
  };

  const removeControlPoint = (index: number) => {
    updatePoint(index, { controlPoint: undefined });
  };

  return (
    <div className="space-y-3">
      {/* Point Management Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={addPoint}
            className="px-3 py-1.5 text-xs text-white bg-blue-500 rounded hover:bg-blue-600 
                     transition-all hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            + Add Point
          </button>
          {selectedPointIndex < points.length - 1 && (
            <button
              onClick={() => insertPoint(selectedPointIndex)}
              className="px-3 py-1.5 text-xs text-white bg-green-500 rounded hover:bg-green-600 
                       transition-all hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500/50"
              title="Insert point between current and next"
            >
              Insert
            </button>
          )}
        </div>
        <div className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded">
          {points.length} points
        </div>
      </div>

      {/* Point Selection */}
      {points.length > 0 && (
        <SelectField
          label="Edit Point"
          value={selectedPointIndex.toString()}
          onChange={(value) => setSelectedPointIndex(parseInt(value))}
          options={points.map((_, index) => ({
            value: index.toString(),
            label: `Point ${index + 1} ${
              index === 0
                ? "(Start)"
                : index === points.length - 1
                ? "(End)"
                : ""
            }`,
          }))}
        />
      )}

      {/* Selected Point Editor */}
      {selectedPoint && (
        <div className="p-3 border border-gray-200 rounded-lg shadow-sm bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Point {selectedPointIndex + 1}
              {selectedPointIndex === 0 && (
                <span className="text-green-600 text-xs bg-green-100 px-2 py-0.5 rounded-full">
                  Start
                </span>
              )}
              {selectedPointIndex === points.length - 1 && (
                <span className="text-red-600 text-xs bg-red-100 px-2 py-0.5 rounded-full">
                  End
                </span>
              )}
            </h4>
            {points.length > 2 && (
              <button
                onClick={() => removePoint(selectedPointIndex)}
                className="px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600 
                         transition-all hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              >
                Remove
              </button>
            )}
          </div>

          {/* Position Fields */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <NumberField
              label="X Position"
              value={selectedPoint.x}
              onChange={(value) =>
                updatePoint(selectedPointIndex, { x: value })
              }
              step={0.1}
            />
            <NumberField
              label="Z Position"
              value={selectedPoint.z}
              onChange={(value) =>
                updatePoint(selectedPointIndex, { z: value })
              }
              step={0.1}
            />
          </div>

          {/* Curve Controls */}
          {selectedPointIndex < points.length - 1 && (
            <div className="pt-3 mt-3 border-t border-gray-300">
              <div className="flex items-center justify-between mb-2">
                <h5 className="flex items-center gap-1 text-xs font-medium">
                  <span className="text-purple-500">🌊</span>
                  Curve to Next Point
                </h5>
                {selectedPoint.controlPoint ? (
                  <button
                    onClick={() => removeControlPoint(selectedPointIndex)}
                    className="px-2 py-1 text-xs text-white bg-orange-500 rounded hover:bg-orange-600 
                             transition-all hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  >
                    Make Straight
                  </button>
                ) : (
                  <button
                    onClick={() => addControlPoint(selectedPointIndex)}
                    className="px-2 py-1 text-xs text-white bg-green-500 rounded hover:bg-green-600 
                             transition-all hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  >
                    Add Curve
                  </button>
                )}
              </div>

              {selectedPoint.controlPoint && (
                <div className="grid grid-cols-2 gap-2 p-2 border border-purple-200 rounded bg-purple-50">
                  <NumberField
                    label="Control X"
                    value={selectedPoint.controlPoint.x}
                    onChange={(value) =>
                      updatePoint(selectedPointIndex, {
                        controlPoint: {
                          ...selectedPoint.controlPoint!,
                          x: value,
                        },
                      })
                    }
                    step={0.1}
                  />
                  <NumberField
                    label="Control Z"
                    value={selectedPoint.controlPoint.z}
                    onChange={(value) =>
                      updatePoint(selectedPointIndex, {
                        controlPoint: {
                          ...selectedPoint.controlPoint!,
                          z: value,
                        },
                      })
                    }
                    step={0.1}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
