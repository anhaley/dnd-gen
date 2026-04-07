"use client";

import { useState } from "react";
import type { NamedSummary } from "@/lib/schemas";

const INPUT_CLASS =
  "w-full rounded border border-amber-900/40 bg-stone-800/60 px-2 py-1 text-stone-100 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30";

export function EditableText({
  value,
  onChange,
  editable,
  className = "",
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  editable: boolean;
  className?: string;
  placeholder?: string;
}) {
  if (!editable) return <span className={className}>{value}</span>;
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${INPUT_CLASS} placeholder:text-stone-600 ${className}`}
    />
  );
}

export function EditableNumber({
  value,
  onChange,
  editable,
  className = "",
  min,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  editable: boolean;
  className?: string;
  min?: number;
  max?: number;
}) {
  if (!editable) return <span className={className}>{value}</span>;
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className={`${INPUT_CLASS} ${className}`}
    />
  );
}

export function EditableTextarea({
  value,
  onChange,
  editable,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  editable: boolean;
  className?: string;
}) {
  if (!editable) return <span className={className}>{value}</span>;
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      className={`${INPUT_CLASS} resize-y ${className}`}
    />
  );
}

export function EditableList({
  items,
  onChange,
  editable,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  editable: boolean;
}) {
  const [newItem, setNewItem] = useState("");

  function handleRemove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function handleAdd() {
    const trimmed = newItem.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setNewItem("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 rounded-md border border-amber-900/20 bg-stone-900/40 px-2.5 py-1 text-sm text-stone-300"
        >
          {item}
          {editable && (
            <button
              onClick={() => handleRemove(i)}
              className="ml-0.5 text-stone-500 transition hover:text-red-400"
              aria-label={`Remove ${item}`}
            >
              &times;
            </button>
          )}
        </span>
      ))}
      {editable && (
        <span className="inline-flex items-center gap-1">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add..."
            className="w-24 rounded border border-amber-900/40 bg-stone-800/60 px-2 py-1 text-sm text-stone-100 outline-none placeholder:text-stone-600 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
          />
          <button
            onClick={handleAdd}
            className="rounded px-1.5 py-1 text-sm text-amber-400 transition hover:text-amber-300"
          >
            +
          </button>
        </span>
      )}
    </div>
  );
}

export function EditableNamedSummaryList({
  items,
  onChange,
  editable,
}: {
  items: NamedSummary[];
  onChange: (items: NamedSummary[]) => void;
  editable: boolean;
}) {
  const [draftName, setDraftName] = useState("");
  const [draftSummary, setDraftSummary] = useState("");

  function updateAt(index: number, patch: Partial<NamedSummary>) {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  }

  function handleRemove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function handleAdd() {
    const name = draftName.trim();
    if (!name) return;
    onChange([...items, { name, summary: draftSummary.trim() }]);
    setDraftName("");
    setDraftSummary("");
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) =>
        editable ? (
          <div
            key={i}
            className="flex flex-col gap-1.5 rounded-lg border border-amber-900/20 bg-stone-900/40 px-3 py-2 sm:flex-row sm:items-start sm:gap-3"
          >
            <input
              type="text"
              value={item.name}
              onChange={(e) => updateAt(i, { name: e.target.value })}
              placeholder="Name"
              className={`${INPUT_CLASS} shrink-0 sm:w-48 font-medium`}
            />
            <input
              type="text"
              value={item.summary}
              onChange={(e) => updateAt(i, { summary: e.target.value })}
              placeholder="Summary (mechanics)"
              className={`${INPUT_CLASS} min-w-0 flex-1 text-sm`}
            />
            <button
              type="button"
              onClick={() => handleRemove(i)}
              className="self-end text-stone-500 transition hover:text-red-400 sm:self-start"
              aria-label={`Remove ${item.name}`}
            >
              &times;
            </button>
          </div>
        ) : (
          <div
            key={i}
            className="rounded-lg border border-amber-900/20 bg-stone-900/40 px-3 py-2"
          >
            <div className="font-medium text-stone-200">{item.name}</div>
            {item.summary.trim() !== "" && (
              <div className="mt-0.5 text-sm text-stone-500">{item.summary}</div>
            )}
          </div>
        )
      )}
      {editable && (
        <div className="flex flex-col gap-1.5 rounded-lg border border-dashed border-amber-900/30 bg-stone-900/20 px-3 py-2 sm:flex-row sm:items-start sm:gap-3">
          <input
            type="text"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder="Add name…"
            className={`${INPUT_CLASS} shrink-0 sm:w-48`}
          />
          <input
            type="text"
            value={draftSummary}
            onChange={(e) => setDraftSummary(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder="Summary (optional)"
            className={`${INPUT_CLASS} min-w-0 flex-1 text-sm`}
          />
          <button
            type="button"
            onClick={handleAdd}
            className="self-end rounded px-2 py-1 text-sm text-amber-400 transition hover:text-amber-300 sm:self-start"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
