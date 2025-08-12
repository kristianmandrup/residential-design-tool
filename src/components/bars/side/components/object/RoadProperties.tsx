import React, { useState } from "react";
import { RoadObj, SceneObj } from "@/store";
import {
  NumberField,
  SelectField,
  ColorField,
} from "../../../../generic";
import PositionInputs from "../PositionInputs";
import CollapsibleSection from "../../CollapsibleSection";

interface RoadPropertiesProps {
  selected: RoadObj;
  updateObject: (id: string, patch: Partial<SceneObj>) => void;
}

const ROAD_TYPE_OPTIONS = [
  { value: "residential", label: "Residential Street" },
  { value: "highway", label: "Highway" },
  { value: "dirt", label: "Dirt Road" },
  { value: "pedestrian", label: "Pedestrian Path" },
];

export function RoadProperties({
  selected,
  updateObject,
}: RoadPropertiesProps) {
  const [selectedPointIndex, setSelectedPointIndex] = useState(0);

  const roadType = selected.roadType || "residential";
  const points = selected.points || [];
  const selectedPoint = points[selectedPointIndex];

  const updatePoint = (
    index: number,
    updates: Partial<typeof selectedPoint>
  ) => {
    const newPoints = [...points];
    newPoints[index] = { ...newPoints[index], ...updates };
    updateObject(selected.id, { points: newPoints });
  };

  const addPoint = () => {
    const lastPoint = points[points.length - 1];
    const newPoint = {
      x: (lastPoint?.x || 0) + 4,
      z: lastPoint?.z || 0,
    };
    updateObject(selected.id, { points: [...points, newPoint] });
  };

  const removePoint = (index: number) => {
    if (points.length <= 2) return; // Need at least 2 points
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

    const controlX = (point.x + nextPoint.x) / 2;
    const controlZ = (point.z + nextPoint.z) / 2 + 2; // Offset for curve

    updatePoint(index, {
      controlPoint: { x: controlX, z: controlZ },
    });
  };

  const removeControlPoint = (index: number) => {
    updatePoint(index, { controlPoint: undefined });
  };

  const createIntersection = () => {
    // This would analyze nearby roads and create intersection geometry
    // For now, just show a placeholder
    alert("Intersection generation coming soon!");
  };

  return (
    <div className="space-y-4">
      {/* Basic Road Properties */}
      <CollapsibleSection
        title="Road Properties"
        icon={<span className="w-1.5 h-1.5 bg-gray-600 rounded-full"></span>}
      >
        <div className="space-y-3">
          <PositionInputs selected={selected} updateObject={updateObject} />

          <SelectField
            label="Road Type"
            value={roadType}
            onChange={(value) =>
              updateObject(selected.id, {
                roadType: value as
                  | "residential"
                  | "highway"
                  | "dirt"
                  | "pedestrian",
              })
            }
            options={ROAD_TYPE_OPTIONS}
          />

          <NumberField
            label="Width (meters)"
            value={selected.width || 6}
            onChange={(value) =>
              updateObject(selected.id, { width: Math.max(1, value) })
            }
            min={1}
            max={20}
            step={0.5}
          />

          <ColorField
            label="Road Color"
            value={selected.color || "#404040"}
            onChange={(value) => updateObject(selected.id, { color: value })}
          />
        </div>
      </CollapsibleSection>

      {/* Road Points Management */}
      <CollapsibleSection
        title="Road Points"
        icon={<span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Points: {points.length}</span>
            <div className="flex gap-2">
              <button
                onClick={addPoint}
                className="px-2 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600"
              >
                Add Point
              </button>
            </div>
          </div>

          {points.length > 0 && (
            <SelectField
              label="Edit Point"
              value={selectedPointIndex.toString()}
              onChange={(value) => setSelectedPointIndex(parseInt(value))}
              options={points.map((_, index) => ({
                value: index.toString(),
                label: `Point ${index + 1}`,
              }))}
            />
          )}

          {selectedPoint && (
            <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
              <h4 className="mb-2 text-sm font-medium">
                Point {selectedPointIndex + 1}
              </h4>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <NumberField
                  label="X"
                  value={selectedPoint.x}
                  onChange={(value) =>
                    updatePoint(selectedPointIndex, { x: value })
                  }
                  step={0.1}
                />
                <NumberField
                  label="Z"
                  value={selectedPoint.z}
                  onChange={(value) =>
                    updatePoint(selectedPointIndex, { z: value })
                  }
                  step={0.1}
                />
              </div>

              <div className="flex gap-2 mb-2">
                {points.length > 2 && (
                  <button
                    onClick={() => removePoint(selectedPointIndex)}
                    className="px-2 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600"
                  >
                    Remove Point
                  </button>
                )}
              </div>

              {/* Curve Controls */}
              {selectedPointIndex < points.length - 1 && (
                <div className="pt-3 mt-3 border-t border-gray-300">
                  <h5 className="mb-2 text-xs font-medium">
                    Curve to Next Point
                  </h5>

                  {selectedPoint.controlPoint ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
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
                      <button
                        onClick={() => removeControlPoint(selectedPointIndex)}
                        className="px-2 py-1 text-xs text-white bg-orange-500 rounded hover:bg-orange-600"
                      >
                        Make Straight
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addControlPoint(selectedPointIndex)}
                      className="px-2 py-1 text-xs text-white bg-green-500 rounded hover:bg-green-600"
                    >
                      Add Curve
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Advanced Features */}
      <CollapsibleSection
        title="Advanced"
        defaultCollapsed={true}
        icon={<span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>}
      >
        <div className="space-y-3">
          <button
            onClick={createIntersection}
            className="w-full px-3 py-2 text-sm text-white bg-purple-500 rounded hover:bg-purple-600"
          >
            Generate Intersection
          </button>

          <div className="text-xs text-gray-600">
            <p>
              • Intersections: Automatic detection and generation when roads
              meet
            </p>
            <p>• Curves: Use control points to create smooth Bezier curves</p>
            <p>
              • Road Types: Each type has different widths, colors, and markings
            </p>
          </div>
        </div>
      </CollapsibleSection>

      {/* Road Statistics */}
      <div className="p-3 text-xs text-gray-600 border border-gray-200 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <strong>Points:</strong> {points.length}
          </div>
          <div>
            <strong>Type:</strong> {roadType}
          </div>
          <div>
            <strong>Width:</strong> {selected.width || 6}m
          </div>
          <div>
            <strong>Curves:</strong>{" "}
            {points.filter((p) => p.controlPoint).length}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoadProperties;
