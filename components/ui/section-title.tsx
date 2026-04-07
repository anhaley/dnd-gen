import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function SectionTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "mb-3 font-serif text-section font-semibold leading-snug text-heading",
        className
      )}
      {...props}
    />
  );
}
