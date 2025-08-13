// src/components/bars/side/CollapsibleSection.tsx
import React, { useState, useEffect } from "react";
import Button from "../../generic/Button";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  icon?: React.ReactNode;
  onToggle?: (collapsed: boolean) => void;
}

export default function CollapsibleSection({
  title,
  children,
  defaultCollapsed = false,
  icon,
  onToggle,
}: CollapsibleSectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const handleToggle = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    onToggle?.(newCollapsed);
  };

  // Update local state if defaultCollapsed changes externally
  useEffect(() => {
    setCollapsed(defaultCollapsed);
  }, [defaultCollapsed]);

  return (
    <section className="pl-2 pr-2 transition-shadow duration-300 bg-white border border-gray-200 shadow-md rounded-xl hover:shadow-lg">
      <Button
        variant="ghost"
        className="flex items-center justify-between w-full px-2 py-2 mb-1 text-lg font-bold text-gray-800 transition-colors rounded-lg hover:bg-gray-50"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span className="text-left">{title}</span>
        </div>
        <svg
          className={`w-5 h-5 transform transition-transform duration-200 flex-shrink-0 ${
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
      {!collapsed && <div className="px-1 pb-3 space-y-3">{children}</div>}
    </section>
  );
}
