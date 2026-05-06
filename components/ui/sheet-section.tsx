import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SectionTitle } from "./section-title";

interface SheetSectionProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  children: ReactNode;
  /** Extra content beside the title (e.g. actions). */
  titleAside?: ReactNode;
}

function SectionFrameCorner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute left-0 top-0.5 block h-3 w-3 border-l-2 border-t-2 border-accent-a/55",
        className
      )}
    />
  );
}

/** Decorative diagram node — one motif site-wide. */
function SectionGlyph() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="mt-0.5 h-4 w-4 shrink-0 text-accent-b/55"
    >
      <circle cx="8" cy="8" r="2" fill="currentColor" />
      <path
        d="M8 2v3M8 11v3M2 8h3M11 8h3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
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
        "relative border-b border-border/40 py-5 last:border-b-0 last:pb-0 sm:py-6",
        className
      )}
      {...props}
    >
      <div className="relative mb-3 flex flex-wrap items-baseline justify-between gap-2 pl-1">
        <SectionFrameCorner />
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <SectionGlyph />
          <SectionTitle className="mb-0">{title}</SectionTitle>
        </div>
        {titleAside}
      </div>
      {children}
    </div>
  );
}
