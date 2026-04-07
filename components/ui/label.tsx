import type { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  /** Uppercase micro-label (form fields). */
  muted?: boolean;
}

export function Label({ className, muted = true, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        muted
          ? "mb-1 block text-xs font-medium uppercase tracking-wide text-accent-soft/90"
          : "mb-1 block text-sm font-medium text-accent-soft",
        className
      )}
      {...props}
    />
  );
}
