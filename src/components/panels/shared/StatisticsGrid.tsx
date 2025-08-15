import React from "react";
import { Badge } from "@/components/ui/badge";

interface Statistic {
  label: string;
  value: string | number;
  unit?: string;
  format?: (value: string | number) => string;
}

interface StatisticsGridProps {
  statistics: Statistic[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatisticsGrid({
  statistics,
  columns = 2,
  className = "",
}: StatisticsGridProps) {
  const gridColsClass = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  }[columns];

  return (
    <div className={`space-y-3 ${className}`}>
      <div className={`grid ${gridColsClass} gap-3`}>
        {statistics.map((stat, index) => {
          const displayValue = stat.format
            ? stat.format(stat.value)
            : stat.value;
          const displayUnit = stat.unit ? ` ${stat.unit}` : "";

          return (
            <div
              key={index}
              className="flex flex-col items-center p-3 rounded-lg bg-muted/50"
            >
              <span className="text-lg font-semibold text-primary">
                {displayValue}
                {displayUnit}
              </span>
              <span className="text-xs text-muted-foreground">
                {stat.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
