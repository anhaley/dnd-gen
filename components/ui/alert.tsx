import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Alert({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-lg border border-danger-border bg-danger-surface px-4 py-3 text-sm text-danger",
        className
      )}
      {...props}
    />
  );
}
