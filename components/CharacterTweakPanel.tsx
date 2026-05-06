"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Button, Card, Label } from "@/components/ui";
import { fieldClassName } from "@/components/ui/field-classes";

type CharacterTweakPanelProps = {
  disabled?: boolean;
  /** Returns true when the server applied changes successfully */
  onSubmit: (message: string) => Promise<boolean>;
};

export default function CharacterTweakPanel({
  disabled = false,
  onSubmit,
}: CharacterTweakPanelProps) {
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || disabled) return;
    const ok = await onSubmit(trimmed);
    if (ok) setMessage("");
  }

  return (
    <Card variant="muted" className="mt-6 p-5 sm:p-6">
      <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-accent-b/90">
        Refine character
      </h3>
      <p className="mt-1 text-sm text-muted">
        Describe changes in plain language — tone, gear, inventory, backstory, and
        other details that fit the sheet.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <Label htmlFor="tweak-message">Instructions</Label>
          <textarea
            id="tweak-message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== "Enter" || e.shiftKey) return;
              if (e.nativeEvent.isComposing) return;
              if (disabled) return;
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }}
            disabled={disabled}
            placeholder="Describe changes to tone, gear, inventory, backstory, etc."
            className={cn(
              fieldClassName,
              "resize-y min-h-[5rem] placeholder:text-muted/55"
            )}
          />
        </div>
        <Button type="submit" variant="secondary" disabled={disabled}>
          {disabled ? "Applying…" : "Apply changes"}
        </Button>
      </form>
    </Card>
  );
}
