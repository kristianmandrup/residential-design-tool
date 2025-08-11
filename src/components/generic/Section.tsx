import React from "react";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

export default function Section({ children, className = "" }: SectionProps) {
  return (
    <section
      className={`transition-shadow duration-300 bg-white border border-gray-200 shadow-md rounded-xl hover:shadow-lg ${className}`}
    >
      <div className="p-4 space-y-3">{children}</div>
    </section>
  );
}
