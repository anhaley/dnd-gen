"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "subtle"
  | "ghost"
  | "danger"
  | "fabPrimary"
  | "fabSecondary"
  | "fabIcon";
export type ButtonSize = "sm" | "md";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "rounded-lg bg-primary text-stone-100 shadow-sm hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:hover:bg-primary",
  secondary:
    "rounded-lg border border-primary/55 bg-transparent text-accent-soft hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50",
  subtle:
    "rounded-md border border-border bg-transparent px-3 py-1.5 text-sm font-medium text-muted hover:border-border-strong hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  ghost:
    "rounded-md px-2 py-1 text-sm text-accent hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  danger:
    "text-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus rounded-md p-0.5",
  fabPrimary:
    "bg-primary text-stone-100 shadow-fab hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50",
  fabSecondary:
    "bg-stone-700 text-stone-100 shadow-fab hover:bg-stone-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50",
  fabIcon:
    "rounded-lg border border-border-strong bg-surface-elevated p-2 text-accent backdrop-blur-sm hover:bg-stone-800/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm font-medium",
  md: "px-5 py-2.5 text-sm font-semibold",
};

/** Variants that embed their own padding or are sized via className. */
const variantSkipsSize: Partial<Record<ButtonVariant, boolean>> = {
  subtle: true,
  ghost: true,
  danger: true,
};

const fabSize = "flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", type = "button", ...props },
  ref
) {
  const isFab = variant.startsWith("fab");
  const fabIconOnly = variant === "fabIcon";
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "transition",
        variantClasses[variant],
        isFab && !fabIconOnly
          ? fabSize
          : !isFab && !variantSkipsSize[variant]
            ? sizeClasses[size]
            : undefined,
        className
      )}
      {...props}
    />
  );
});

/** Class string for Next.js `<Link>` styled as a ghost button (sign in / sign out). */
export const linkButtonClass =
  "text-accent transition hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm";
