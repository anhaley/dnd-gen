import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function SectionTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "mb-3 font-serif text-lg font-semibold text-heading",
        className
      )}
      {...props}
    />
  );
}
