import React from "react";

interface SectionHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export default function SectionHeader({
  children,
  className = "",
}: SectionHeaderProps) {
  return (
    <h3 className={`text-sm font-semibold text-gray-800 ${className}`}>
      {children}
    </h3>
  );
}
