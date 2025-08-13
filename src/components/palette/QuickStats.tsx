// src/components/bars/side/components/QuickStats.tsx
import React from "react";

interface QuickStatsProps {
  buildingCount: number;
  treeCount: number;
  roadCount: number;
  totalObjects: number;
}

interface StatItemProps {
  label: string;
  count: number;
  bgColor: string;
  textColor: string;
  hoverColor: string;
}

function StatItem({
  label,
  count,
  bgColor,
  textColor,
  hoverColor,
}: StatItemProps) {
  return (
    <div
      className={`text-center p-2 ${bgColor} rounded-lg ${hoverColor} transition-colors cursor-default`}
    >
      <div className={`text-lg font-semibold ${textColor}`}>{count}</div>
      <div className={`text-xs ${textColor.replace("600", "500")}`}>
        {label}
      </div>
    </div>
  );
}

export function QuickStats({
  buildingCount,
  treeCount,
  roadCount,
  totalObjects,
}: QuickStatsProps) {
  return (
    <div className="pt-3 border-t border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700">Scene Stats</h4>
        <div className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded-full">
          {totalObjects} total
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatItem
          label="Buildings"
          count={buildingCount}
          bgColor="bg-blue-50"
          textColor="text-blue-600"
          hoverColor="hover:bg-blue-100"
        />
        <StatItem
          label="Trees"
          count={treeCount}
          bgColor="bg-green-50"
          textColor="text-green-600"
          hoverColor="hover:bg-green-100"
        />
        <StatItem
          label="Roads"
          count={roadCount}
          bgColor="bg-gray-50"
          textColor="text-gray-600"
          hoverColor="hover:bg-gray-100"
        />
      </div>

      {/* Additional stats row if there are other object types */}
      {totalObjects > buildingCount + treeCount + roadCount && (
        <div className="p-2 mt-2 rounded-lg bg-purple-50">
          <div className="text-center">
            <div className="text-sm font-semibold text-purple-600">
              {totalObjects - (buildingCount + treeCount + roadCount)}
            </div>
            <div className="text-xs text-purple-500">Other</div>
          </div>
        </div>
      )}
    </div>
  );
}
