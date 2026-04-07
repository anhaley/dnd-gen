"use client";

import { Card } from "@/components/ui";

export default function LoadingSpinner() {
  return (
    <Card className="border-dashed border-border-strong bg-surface-muted/50 py-14 shadow-none">
      <div className="flex flex-col items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-accent" />
        <p className="mt-4 animate-pulse text-sm text-muted">
          Rolling the dice...
        </p>
      </div>
    </Card>
  );
}
