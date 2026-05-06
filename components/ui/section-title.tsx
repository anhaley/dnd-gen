import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function SectionTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "mb-3 font-sans text-section font-semibold leading-snug tracking-wide text-heading",
        className
      )}
      {...props}
    />
  );
}
