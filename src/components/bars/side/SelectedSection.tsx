import React from "react";
import {
  useStore,
  SceneObj,
  BuildingObj,
  TreeObj,
  WallObj,
  RoadObj,
  WaterObj,
} from "@/store/useStore";

export default function SelectedSection() {
  const selectedId = useStore((s) => s.selectedId);
  const objects = useStore((s) => s.objects);
  const updateObject = useStore((s) => s.updateObject);
  const removeObject = useStore((s) => s.removeObject);

  const selected = objects.find((o) => o.id === selectedId) as
    | SceneObj
    | undefined;

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-5 shadow-md hover:shadow-lg transition-shadow duration-300 flex-1">
      <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
        Selected
      </h3>
      {!selected && (
        <div className="text-sm text-gray-600 italic bg-gray-50 p-4 rounded-lg border border-gray-200">
          Select an object to edit its properties
        </div>
      )}

      {selected && (
        <div className="space-y-4">
          <div className="text-sm">
            <strong className="text-gray-800 font-medium">Type:</strong>
            <span className="ml-2 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-lg text-sm font-semibold">
              {selected.type}
            </span>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Position
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">X</label>
                <input
                  type="number"
                  className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
                  value={selected.position[0]}
                  onChange={(e) => {
                    const newPosition = [...selected.position] as [
                      number,
                      number,
                      number
                    ];
                    newPosition[0] = Number(e.target.value || "0");
                    updateObject(selected.id, { position: newPosition });
                  }}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Y</label>
                <input
                  type="number"
                  className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
                  value={selected.position[1]}
                  onChange={(e) => {
                    const newPosition = [...selected.position] as [
                      number,
                      number,
                      number
                    ];
                    newPosition[1] = Number(e.target.value || "0");
                    updateObject(selected.id, { position: newPosition });
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Rotation Y
            </label>
            <input
              type="number"
              step="10"
              min="0"
              max="360"
              className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
              value={selected.rotation[1]}
              onChange={(e) => {
                const newRotation = [...selected.rotation] as [
                  number,
                  number,
                  number
                ];
                let value = Number(e.target.value || "0");
                // Round to nearest 45-degree increment for grid snapping
                value = Math.round(value / 45) * 45;
                // Ensure value is within 0-360 range
                value = ((value % 360) + 360) % 360;
                newRotation[1] = value;
                updateObject(selected.id, { rotation: newRotation });
              }}
            />
            <div className="text-xs text-gray-500 mt-1">
              Increments of 10° (0°, 10°, 20°, ..., 350°)
            </div>
          </div>

          {selected.type === "building" && (
            <>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Floors
              </label>
              <input
                className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
                type="number"
                min="1"
                max="10"
                value={selected.floors}
                onChange={(e) =>
                  updateObject(selected.id, {
                    floors: Math.max(
                      1,
                      Math.min(10, Number(e.target.value || 1))
                    ),
                  })
                }
              />

              <label className="text-sm font-medium text-gray-700 mb-2 block mt-3">
                Grid Width (units)
              </label>
              <input
                className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
                type="number"
                min="1"
                max="10"
                value={(selected as BuildingObj).gridWidth || 2}
                onChange={(e) =>
                  updateObject(selected.id, {
                    gridWidth: Math.max(1, Number(e.target.value || 1)),
                  })
                }
              />

              <label className="text-sm font-medium text-gray-700 mb-2 block mt-3">
                Grid Depth (units)
              </label>
              <input
                className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
                type="number"
                min="1"
                max="10"
                value={(selected as BuildingObj).gridDepth || 2}
                onChange={(e) =>
                  updateObject(selected.id, {
                    gridDepth: Math.max(1, Number(e.target.value || 1)),
                  })
                }
              />

              <label className="text-sm font-medium text-gray-700 mb-2 block mt-3">
                Grid Height (units)
              </label>
              <input
                className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
                type="number"
                min="1"
                max="5"
                value={(selected as BuildingObj).gridHeight || 1}
                onChange={(e) =>
                  updateObject(selected.id, {
                    gridHeight: Math.max(
                      1,
                      Math.min(5, Number(e.target.value || 1))
                    ),
                  })
                }
              />
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Wall color
              </label>
              <input
                className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-200"
                type="color"
                value={selected.color}
                onChange={(e) =>
                  updateObject(selected.id, { color: e.target.value })
                }
              />
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Roof color
              </label>
              <input
                className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-200"
                type="color"
                value={selected.roofColor}
                onChange={(e) =>
                  updateObject(selected.id, { roofColor: e.target.value })
                }
              />
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Roof type
              </label>
              <select
                value={selected.roofType}
                onChange={(e) =>
                  updateObject(selected.id, {
                    roofType: e.target.value as "flat" | "gabled" | "hipped",
                  })
                }
                className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
              >
                <option value="flat">Flat</option>
                <option value="gabled">Gabled</option>
                <option value="hipped">Hipped</option>
              </select>

              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Window color
              </label>
              <input
                className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-200"
                type="color"
                value={(selected as BuildingObj).windowColor || "#bfe9ff"}
                onChange={(e) =>
                  updateObject(selected.id, { windowColor: e.target.value })
                }
              />
            </>
          )}

          {selected.type === "tree" && (
            <>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Grid Height (units)
              </label>
              <input
                className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
                type="number"
                min="1"
                max="5"
                value={(selected as TreeObj).gridHeight || 1}
                onChange={(e) =>
                  updateObject(selected.id, {
                    gridHeight: Math.max(
                      1,
                      Math.min(5, Number(e.target.value || 1))
                    ),
                  })
                }
              />

              <label className="text-sm font-medium text-gray-700 mb-2 block mt-3">
                Grid Width (units)
              </label>
              <input
                className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
                type="number"
                min="1"
                max="3"
                value={(selected as TreeObj).gridWidth || 1}
                onChange={(e) =>
                  updateObject(selected.id, {
                    gridWidth: Math.max(1, Number(e.target.value || 1)),
                  })
                }
              />

              <label className="text-sm font-medium text-gray-700 mb-2 block mt-3">
                Grid Depth (units)
              </label>
              <input
                className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
                type="number"
                min="1"
                max="3"
                value={(selected as TreeObj).gridDepth || 1}
                onChange={(e) =>
                  updateObject(selected.id, {
                    gridDepth: Math.max(1, Number(e.target.value || 1)),
                  })
                }
              />
            </>
          )}

          {selected.type === "water" && (
            <>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Shape
              </label>
              <select
                value={selected.shape || "circular"}
                onChange={(e) =>
                  updateObject(selected.id, {
                    shape: e.target.value as "circular" | "rectangular",
                  })
                }
                className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
              >
                <option value="circular">Circular</option>
                <option value="rectangular">Rectangular</option>
              </select>

              <label className="text-sm font-medium text-gray-700 mb-2 block mt-3">
                Grid Width (units)
              </label>
              <input
                className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
                type="number"
                min="1"
                max="10"
                value={(selected as WaterObj).gridWidth || 2}
                onChange={(e) =>
                  updateObject(selected.id, {
                    gridWidth: Math.max(1, Number(e.target.value || 1)),
                  })
                }
              />

              <label className="text-sm font-medium text-gray-700 mb-2 block mt-3">
                Grid Depth (units)
              </label>
              <input
                className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
                type="number"
                min="1"
                max="10"
                value={(selected as WaterObj).gridDepth || 2}
                onChange={(e) =>
                  updateObject(selected.id, {
                    gridDepth: Math.max(1, Number(e.target.value || 1)),
                  })
                }
              />

              <label className="text-sm font-medium text-gray-700 mb-2 block mt-3">
                Grid Height (units)
              </label>
              <input
                className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
                type="number"
                min="0.05"
                max="1"
                step="0.05"
                value={(selected as WaterObj).gridHeight || 0.1}
                onChange={(e) =>
                  updateObject(selected.id, {
                    gridHeight: Math.max(
                      0.05,
                      Math.min(1, Number(e.target.value || 0.1))
                    ),
                  })
                }
              />

              {selected.shape === "rectangular" && (
                <>
                  <label className="text-sm font-medium text-gray-700 mb-2 block mt-3">
                    Direction (degrees)
                  </label>
                  <input
                    type="number"
                    step="45"
                    className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
                    value={selected.direction || 0}
                    onChange={(e) => {
                      let value = Number(e.target.value || "0");
                      // Round to nearest 45-degree increment for grid snapping
                      value = Math.round(value / 45) * 45;
                      // Ensure value is within 0-360 range
                      value = ((value % 360) + 360) % 360;
                      updateObject(selected.id, {
                        direction: value,
                      });
                    }}
                  />
                </>
              )}
            </>
          )}

          {selected.type === "wall" && (
            <>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Grid Width (units)
              </label>
              <input
                className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
                type="number"
                min="1"
                max="10"
                value={(selected as WallObj).gridWidth || 2}
                onChange={(e) =>
                  updateObject(selected.id, {
                    gridWidth: Math.max(1, Number(e.target.value || 1)),
                  })
                }
              />

              <label className="text-sm font-medium text-gray-700 mb-2 block mt-3">
                Grid Depth (units)
              </label>
              <input
                className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
                type="number"
                min="1"
                max="10"
                value={(selected as WallObj).gridDepth || 1}
                onChange={(e) =>
                  updateObject(selected.id, {
                    gridDepth: Math.max(1, Number(e.target.value || 1)),
                  })
                }
              />

              <label className="text-sm font-medium text-gray-700 mb-2 block mt-3">
                Grid Height (units)
              </label>
              <input
                className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
                type="number"
                min="1"
                max="5"
                value={(selected as WallObj).gridHeight || 1}
                onChange={(e) =>
                  updateObject(selected.id, {
                    gridHeight: Math.max(
                      1,
                      Math.min(5, Number(e.target.value || 1))
                    ),
                  })
                }
              />

              <label className="text-sm font-medium text-gray-700 mb-2 block mt-3">
                Direction (degrees)
              </label>
              <input
                type="number"
                step="45"
                className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
                value={selected.direction || 0}
                onChange={(e) => {
                  let value = Number(e.target.value || "0");
                  // Round to nearest 45-degree increment for grid snapping
                  value = Math.round(value / 45) * 45;
                  // Ensure value is within 0-360 range
                  value = ((value % 360) + 360) % 360;
                  updateObject(selected.id, {
                    direction: value,
                  });
                }}
              />
            </>
          )}

          {selected.type === "road" && (
            <>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Grid Width (units)
              </label>
              <input
                className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
                type="number"
                min="0.5"
                max="5"
                step="0.5"
                value={(selected as RoadObj).gridWidth || 1}
                onChange={(e) =>
                  updateObject(selected.id, {
                    gridWidth: Math.max(0.5, Number(e.target.value || 1)),
                  })
                }
              />

              <label className="text-sm font-medium text-gray-700 mb-2 block mt-3">
                Grid Depth (units)
              </label>
              <input
                className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
                type="number"
                min="0.5"
                max="5"
                step="0.5"
                value={(selected as RoadObj).gridDepth || 1}
                onChange={(e) =>
                  updateObject(selected.id, {
                    gridDepth: Math.max(0.5, Number(e.target.value || 1)),
                  })
                }
              />

              <label className="text-sm font-medium text-gray-700 mb-2 block mt-3">
                Grid Height (units)
              </label>
              <input
                className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
                type="number"
                min="0.05"
                max="1"
                step="0.05"
                value={(selected as RoadObj).gridHeight || 0.1}
                onChange={(e) =>
                  updateObject(selected.id, {
                    gridHeight: Math.max(
                      0.05,
                      Math.min(1, Number(e.target.value || 0.1))
                    ),
                  })
                }
              />

              <label className="text-sm font-medium text-gray-700 mb-2 block mt-3">
                Road Color
              </label>
              <input
                className="w-full h-12 border border-gray-300 rounded-lg cursor-pointer shadow-sm hover:shadow-md transition-shadow duration-200"
                type="color"
                value="#808080"
                onChange={(e) => {
                  // Update all road objects with the new color
                  const newColor = e.target.value;
                  updateObject(selected.id, { color: newColor });
                }}
              />

              <label className="text-sm font-medium text-gray-700 mb-2 block mt-3">
                Direction (degrees)
              </label>
              <input
                type="number"
                step="45"
                className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 font-medium text-gray-700"
                value={selected.direction || 0}
                onChange={(e) => {
                  let value = Number(e.target.value || "0");
                  // Round to nearest 45-degree increment for grid snapping
                  value = Math.round(value / 45) * 45;
                  // Ensure value is within 0-360 range
                  value = ((value % 360) + 360) % 360;
                  updateObject(selected.id, {
                    direction: value,
                  });
                }}
              />

              <div className="text-xs text-gray-600 mt-3 bg-gradient-to-r from-gray-50 to-gray-100 p-3 rounded-lg border border-gray-200">
                Road has{" "}
                <strong className="text-gray-800 font-semibold">
                  {selected.points?.length || 0}
                </strong>{" "}
                points (multi-segment)
              </div>
            </>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => removeObject(selected.id)}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
