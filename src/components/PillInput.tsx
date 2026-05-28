import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const PillInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-full bg-input/60 border border-border/60 px-5 py-3 text-sm",
        "placeholder:text-muted-foreground/70 outline-none transition",
        "focus:border-primary focus:ring-2 focus:ring-primary/30",
        className,
      )}
      {...props}
    />
  ),
);
PillInput.displayName = "PillInput";
