import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useId } from "react";

interface SwitchFieldProps {
  label: string;
  className?: string;
  id?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const SwitchField = React.forwardRef<
  HTMLButtonElement,
  SwitchFieldProps
>(({ label, className, id, checked, onCheckedChange, ...props }, ref) => {
  const generatedId = useId();
  const uniqueId = id || `switch-${generatedId}`;

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Switch
        ref={ref}
        id={uniqueId}
        checked={checked}
        onCheckedChange={onCheckedChange}
        {...props}
      />
      <Label
        htmlFor={uniqueId}
        className="text-sm font-medium text-gray-700 cursor-pointer select-none"
      >
        {label}
      </Label>
    </div>
  );
});

SwitchField.displayName = "SwitchField";
