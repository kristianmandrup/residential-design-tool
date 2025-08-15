import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";interface CollapsibleSectionProps {
title: string;
children: React.ReactNode;
defaultCollapsed?: boolean;
icon?: React.ReactNode;
onToggle?: (collapsed: boolean) => void;
className?: string;
}export function CollapsibleSection({
title,
children,
defaultCollapsed = false,
icon,
onToggle,
className,
}: CollapsibleSectionProps) {
const [collapsed, setCollapsed] = useState(defaultCollapsed);const handleToggle = () => {
const newCollapsed = !collapsed;
setCollapsed(newCollapsed);
onToggle?.(newCollapsed);
};useEffect(() => {
setCollapsed(defaultCollapsed);
}, [defaultCollapsed]);return (
<section className={cn(
"border border-border rounded-lg bg-card text-card-foreground shadow-sm",
className
)}>
<Button
     variant="ghost"
     className="flex items-center justify-between w-full px-4 py-3 text-left font-medium"
     onClick={handleToggle}
   >
<div className="flex items-center gap-2">
{icon && <span className="flex-shrink-0">{icon}</span>}
<span>{title}</span>
</div>
<ChevronDown
className={cn(
"h-4 w-4 transition-transform duration-200",
collapsed ? "rotate-180" : ""
)}
/>
</Button>
{!collapsed && (
<div className="px-4 pb-4 space-y-3">
{children}
</div>
)}
</section>
);
}


