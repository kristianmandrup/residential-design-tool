// src/components/bars/side/components/object/RoadStatisticsDisplay.tsx
import React from "react";
import { RoadObj } from "@/store";
import { getRoadStatistics, ROAD_TYPE_CONFIGS } from "./roadUtils";

interface RoadStatisticsDisplayProps {
  selected: RoadObj;
}

interface StatItemProps {
  label: string;
  value: string | number;
  color: string;
  icon?: string;
}

function StatItem({ label, value, color, icon }: StatItemProps) {
  return (
    <div className="flex items-center justify-between px-2 py-1 transition-shadow bg-white border border-gray-100 rounded hover:shadow-sm">
      <span className="flex items-center gap-1 font-medium text-gray-700">
        {icon && <span className="text-xs">{icon}</span>}
        {label}:
      </span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  );
}

export function RoadStatisticsDisplay({
  selected,
}: RoadStatisticsDisplayProps) {
  const roadType = selected.roadType || "residential";
  const points = selected.points || [];
  const roadConfig = ROAD_TYPE_CONFIGS[roadType];
  const stats = getRoadStatistics(
    points,
    roadType,
    selected.width || roadConfig.defaultWidth
  );

  const getComplexityLevel = () => {
    if (stats.curveCount === 0)
      return { level: "Simple", color: "text-green-600", icon: "📏" };
    if (stats.curveCount <= 2)
      return { level: "Moderate", color: "text-yellow-600", icon: "🌊" };
    return { level: "Complex", color: "text-red-600", icon: "🌀" };
  };

  const complexity = getComplexityLevel();

  return (
    <div className="p-3 text-xs text-gray-600 border border-gray-200 rounded-lg shadow-sm bg-gradient-to-br from-blue-50 via-white to-gray-50">
      <h4 className="flex items-center gap-2 mb-3 font-medium text-gray-800">
        <span className="text-blue-500">📊</span>
        Road Statistics
        <span className="px-2 py-1 ml-auto text-xs text-blue-700 bg-blue-100 rounded-full">
          {roadConfig.emoji} {roadType}
        </span>
      </h4>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <StatItem
          label="Points"
          value={stats.pointCount}
          color="text-blue-600"
          icon="📍"
        />
        <StatItem
          label="Segments"
          value={stats.segmentCount}
          color="text-indigo-600"
          icon="📐"
        />
        <StatItem
          label="Curves"
          value={stats.curveCount}
          color="text-pink-600"
          icon="🌊"
        />
        <StatItem
          label="Width"
          value={`${stats.width}m`}
          color="text-purple-600"
          icon="↔️"
        />
      </div>

      {/* Length and Area */}
      <div className="mb-3 space-y-2">
        <StatItem
          label="Length"
          value={`~${stats.totalLength}m`}
          color="text-orange-600"
          icon="📏"
        />
        <StatItem
          label="Surface Area"
          value={`~${stats.area}m²`}
          color="text-green-600"
          icon="🏞️"
        />
      </div>

      {/* Complexity Indicator */}
      <div className="p-2 border border-gray-200 rounded bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700">Complexity:</span>
          <span
            className={`text-xs font-semibold ${complexity.color} flex items-center gap-1`}
          >
            <span>{complexity.icon}</span>
            {complexity.level}
          </span>
        </div>
      </div>

      {/* Additional Metrics */}
      {stats.totalLength && parseFloat(stats.totalLength) > 0 && (
        <div className="pt-3 mt-3 border-t border-gray-200">
          <h5 className="mb-2 text-xs font-medium text-gray-700">
            Additional Metrics:
          </h5>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Avg. segment length:</span>
              <span className="font-medium text-gray-800">
                {stats.segmentCount > 0
                  ? (
                      parseFloat(stats.totalLength) / stats.segmentCount
                    ).toFixed(1)
                  : "0"}
                m
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Points per 10m:</span>
              <span className="font-medium text-gray-800">
                {parseFloat(stats.totalLength) > 0
                  ? (
                      stats.pointCount /
                      (parseFloat(stats.totalLength) / 10)
                    ).toFixed(1)
                  : "0"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Curve density:</span>
              <span className="font-medium text-gray-800">
                {stats.segmentCount > 0
                  ? ((stats.curveCount / stats.segmentCount) * 100).toFixed(0)
                  : "0"}
                %
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
