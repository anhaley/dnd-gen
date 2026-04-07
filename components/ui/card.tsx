import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type CardVariant = "elevated" | "flat" | "muted";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
};

const variantClasses: Record<CardVariant, string> = {
  elevated:
    "rounded-xl border border-border bg-surface shadow-card",
  flat:
    "rounded-xl border border-border/60 bg-surface-muted/35 shadow-none",
  muted:
    "rounded-xl border border-dashed border-border-strong bg-surface-muted/45 shadow-surface",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, variant = "elevated", ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(variantClasses[variant], className)}
      {...props}
    />
  );
});
