import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface QuickAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

interface QuickActionsProps {
  actions: QuickAction[];
  label?: string;
  className?: string;
}

export function QuickActions({
  actions,
  label = "Quick Actions",
  className = "",
}: QuickActionsProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium">{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || "outline"}
            size={action.size || "sm"}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
