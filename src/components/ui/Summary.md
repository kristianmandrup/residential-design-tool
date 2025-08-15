# UI Components Summary

This document provides a comprehensive overview of all UI components available in the `src/components/ui/` directory. These components are built using Radix UI primitives and follow consistent design patterns.

## Exported Components

### Interactive Elements

#### [`Button`](button.tsx:38)

- **Export**: `Button`, `buttonVariants`
- **Props Interface**:

  ```ts
  interface ButtonProps extends React.ComponentProps<"button"> {
    variant?: VariantProps<typeof buttonVariants>["variant"];
    size?: VariantProps<typeof buttonVariants>["size"];
    asChild?: boolean;
  }
  ```

- **Variants**: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
- **Sizes**: `default`, `sm`, `lg`, `icon`

#### [`Input`](input.tsx:6)

- **Export**: `Input`
- **Props Interface**:

```ts
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: string;
}
```

#### [`Select`](select.tsx:9)

- **Export**: `Select`, `SelectContent`, `SelectGroup`, `SelectItem`, `SelectLabel`, `SelectTrigger`, `SelectValue`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton`
- **Props Interface**:

  ```ts
  interface SelectProps
    extends React.ComponentProps<typeof SelectPrimitive.Root> {}
  interface SelectTriggerProps
    extends React.ComponentProps<typeof SelectPrimitive.Trigger> {
    size?: "sm" | "default";
  }
  interface SelectContentProps
    extends React.ComponentProps<typeof SelectPrimitive.Content> {
    position?: "popper";
  }
  ```

#### [`Switch`](switch.tsx:8)

- **Export**: `Switch`
- **Props Interface**:

```ts
interface SwitchProps
  extends React.ComponentProps<typeof SwitchPrimitive.Root> {}
```

#### [`Slider`](slider.tsx:8)

- **Export**: `Slider`
- **Props Interface**:

```ts
interface SliderProps
  extends React.ComponentProps<typeof SliderPrimitive.Root> {
  defaultValue?: number[];
  value?: number[];
  min?: number;
  max?: number;
}
```

#### [`Toggle`](toggle.tsx:31)

- **Export**: `Toggle`, `toggleVariants`
- **Props Interface**:

  ```ts
  interface ToggleProps
    extends React.ComponentProps<typeof TogglePrimitive.Root> {
    variant?: VariantProps<typeof toggleVariants>["variant"];
    size?: VariantProps<typeof toggleVariants>["size"];
  }
  ```

- **Variants**: `default`, `outline`
- **Sizes**: `default`, `sm`, `lg`

### Layout Components

#### [`Card`](card.tsx:5)

- **Export**: `Card`, `CardHeader`, `CardFooter`, `CardTitle`, `CardDescription`, `CardContent`, `CardAction`
- **Props Interface**:

  ```ts
  interface CardProps extends React.ComponentProps<"div"> {}
  interface CardHeaderProps extends React.ComponentProps<"div"> {}
  interface CardFooterProps extends React.ComponentProps<"div"> {}
  interface CardTitleProps extends React.ComponentProps<"div"> {}
  interface CardDescriptionProps extends React.ComponentProps<"div"> {}
  interface CardContentProps extends React.ComponentProps<"div"> {}
  interface CardActionProps extends React.ComponentProps<"div"> {}
  ```

#### [`Separator`](separator.tsx:8)

- **Export**: `Separator`
- **Props Interface**:

  ```ts
  interface SeparatorProps
    extends React.ComponentProps<typeof SeparatorPrimitive.Root> {
    orientation?: "horizontal" | "vertical";
    decorative?: boolean;
  }
  ```

#### [`Collapsible`](collapsible.tsx:5)

- **Export**: `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`
- **Props Interface**:

  ```ts
  interface CollapsibleProps
    extends React.ComponentProps<typeof CollapsiblePrimitive.Root> {}
  interface CollapsibleTriggerProps
    extends React.ComponentProps<typeof CollapsiblePrimitive.Trigger> {}
  interface CollapsibleContentProps
    extends React.ComponentPropsWithoutRef<
      typeof CollapsiblePrimitive.CollapsibleContent
    > {}
  ```

#### [`Tabs`](tabs.tsx:8)

- **Export**: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- **Props Interface**:

  ```ts
  interface TabsProps extends React.ComponentProps<typeof TabsPrimitive.Root> {}
  interface TabsListProps
    extends React.ComponentProps<typeof TabsPrimitive.List> {}
  interface TabsTriggerProps
    extends React.ComponentProps<typeof TabsPrimitive.Trigger> {}
  interface TabsContentProps
    extends React.ComponentProps<typeof TabsPrimitive.Content> {}
  ```

#### [`ScrollArea`](scroll-area.tsx:8)

- **Export**: `ScrollArea`, `ScrollBar`
- **Props Interface**:

  ```ts
  interface ScrollAreaProps
    extends React.ComponentProps<typeof ScrollAreaPrimitive.Root> {}
  interface ScrollBarProps
    extends React.ComponentProps<
      typeof ScrollAreaPrimitive.ScrollAreaScrollbar
    > {
    orientation?: "vertical" | "horizontal";
  }
  ```

### Display Components

#### [`Badge`](badge.tsx:28)

- **Export**: `Badge`, `badgeVariants`
- **Props Interface**:

  ```ts
  interface BadgeProps extends React.ComponentProps<"span"> {
    variant?: VariantProps<typeof badgeVariants>["variant"];
    asChild?: boolean;
  }
  ```

- **Variants**: `default`, `secondary`, `destructive`, `outline`

#### [`Progress`](progress.tsx:7)

- **Export**: `Progress`
- **Props Interface**:

  ```ts
  interface ProgressProps
    extends React.ComponentProps<typeof ProgressPrimitive.Root> {
    value?: number;
  }
  ```

#### [`Label`](label.tsx:13)

- **Export**: `Label`
- **Props Interface**:

  ```ts
  interface LabelProps
    extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
    className?: string;
  }
  ```

### Dialog Components

#### [`AlertDialog`](alert-dialog.tsx:5)

- **Export**: `AlertDialog`, `AlertDialogPortal`, `AlertDialogOverlay`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, `AlertDialogCancel`
- **Props Interface**:

  ```ts
  interface AlertDialogProps
    extends React.ComponentProps<typeof AlertDialogPrimitive.Root> {}
  interface AlertDialogPortalProps
    extends React.ComponentProps<typeof AlertDialogPrimitive.Portal> {}
  interface AlertDialogOverlayProps
    extends React.ComponentProps<typeof AlertDialogPrimitive.Overlay> {}
  interface AlertDialogTriggerProps
    extends React.ComponentProps<typeof AlertDialogPrimitive.Trigger> {}
  interface AlertDialogContentProps
    extends React.ComponentProps<typeof AlertDialogPrimitive.Content> {}
  interface AlertDialogHeaderProps
    extends React.HTMLAttributes<HTMLDivElement> {}
  interface AlertDialogFooterProps
    extends React.HTMLAttributes<HTMLDivElement> {}
  interface AlertDialogTitleProps
    extends React.ComponentProps<typeof AlertDialogPrimitive.Title> {}
  interface AlertDialogDescriptionProps
    extends React.ComponentProps<typeof AlertDialogPrimitive.Description> {}
  interface AlertDialogActionProps
    extends React.ComponentProps<typeof AlertDialogPrimitive.Action> {}
  interface AlertDialogCancelProps
    extends React.ComponentProps<typeof AlertDialogPrimitive.Cancel> {}
  ```

#### [`Modal`](modal.tsx:11)

- **Export**: `default` (named export as Modal)
- **Props Interface**:

  ```ts
  interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
  }
  ```

## Usage Patterns

### Import Pattern

```ts
import { Button, Input, Card } from "@/components/ui";
```

### Styling Consistency

All components use:

- `cn` utility for className merging
- Theme tokens (primary, secondary, etc.)
- Consistent spacing and sizing
- Accessible color contrast

### State Management

- Most components use Radix UI primitives for state
- Forward ref pattern for DOM access
- Consistent disabled state handling
- Keyboard navigation support

### Animation

- Built-in transitions for interactive elements
- Smooth state changes
- Performance-optimized animations

## Dependencies

- **Radix UI**: Primitive components and accessibility features
- **class-variance-authority**: Variant-based styling
- **lucide-react**: Icons (for select component)
- **@/lib/utils**: Utility functions for styling

## Best Practices

1. Use consistent variants across components
2. Leverage `asChild` for component composition
3. Follow the forward ref pattern for DOM access
4. Use theme tokens for consistent theming
5. Ensure accessibility with proper ARIA attributes
