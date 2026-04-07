import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SectionTitle } from "./section-title";

interface SheetSectionProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  children: ReactNode;
  /** Extra content beside the title (e.g. actions). */
  titleAside?: ReactNode;
}

export function SheetSection({
  title,
  titleAside,
  children,
  className,
  ...props
}: SheetSectionProps) {
  return (
    <div
      className={cn(
        "border-b border-border/60 py-6 last:border-b-0 last:pb-0",
        className
      )}
      {...props}
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <SectionTitle className="mb-0">{title}</SectionTitle>
        {titleAside}
      </div>
      {children}
    </div>
  );
}
