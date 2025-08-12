import React, { useState } from "react";
import Button from "../../generic/Button";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  icon?: React.ReactNode;
}

export default function CollapsibleSection({
  title,
  children,
  defaultCollapsed = false,
  icon,
}: CollapsibleSectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <section className="pl-2 pr-2 transition-shadow duration-300 bg-white border border-gray-200 shadow-md rounded-xl hover:shadow-lg">
      <Button
        variant="ghost"
        className="flex items-center justify-between w-full mb-1 text-lg font-bold text-gray-800"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          {icon && <span>{icon}</span>}
          <span>{title}</span>
        </div>
        <svg
          className={`w-5 h-5 transform transition-transform ${
            collapsed ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </Button>
      {!collapsed && <div className="space-y-3">{children}</div>}
    </section>
  );
}
