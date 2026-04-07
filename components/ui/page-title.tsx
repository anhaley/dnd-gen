import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type PageTitleVariant = "hero" | "panel";

export interface PageTitleProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  /** `hero`: home generator title; `panel`: sign-in / sign-up style titles. */
  variant?: PageTitleVariant;
  children?: ReactNode;
}

export function PageTitle({
  title,
  subtitle,
  variant = "hero",
  className,
  children,
  ...props
}: PageTitleProps) {
  return (
    <div
      className={cn(variant === "hero" && "text-center", className)}
      {...props}
    >
      <h1
        className={cn(
          "font-serif font-bold text-heading",
          variant === "hero" &&
            "text-page-title [letter-spacing:var(--text-page-title--letter-spacing)]",
          variant === "panel" && "text-center text-page-panel"
        )}
      >
        {title}
      </h1>
      {subtitle != null && subtitle !== "" && (
        <p
          className={cn(
            "text-muted",
            variant === "hero" && "mt-2 text-page-subtitle",
            variant === "panel" && "mb-8 mt-2 text-center text-sm"
          )}
        >
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}
