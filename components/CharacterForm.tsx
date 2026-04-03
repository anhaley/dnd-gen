"use client";

import { useState } from "react";
import {
  RACES,
  RACE_VARIANTS,
  CLASSES,
  SUBCLASSES,
  BACKGROUNDS,
} from "@/lib/dnd-data";
import { GenerateInput } from "@/lib/schemas";

interface CharacterFormProps {
  onGenerate: (input: GenerateInput) => void;
  isLoading: boolean;
}

export default function CharacterForm({
  onGenerate,
  isLoading,
}: CharacterFormProps) {
  const [race, setRace] = useState("");
  const [raceVariant, setRaceVariant] = useState("");
  const [charClass, setCharClass] = useState("");
  const [subclass, setSubclass] = useState("");
  const [level, setLevel] = useState<number | "">("");
  const [background, setBackground] = useState("");
  const [loadingSource, setLoadingSource] = useState<"custom" | "random" | null>(null);

  const availableVariants = race ? RACE_VARIANTS[race] ?? [] : [];
  const availableSubclasses = charClass ? SUBCLASSES[charClass] ?? [] : [];

  function handleRaceChange(value: string) {
    setRace(value);
    setRaceVariant("");
  }

  function handleClassChange(value: string) {
    setCharClass(value);
    setSubclass("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoadingSource("custom");
    onGenerate({
      race: race || undefined,
      raceVariant: raceVariant || undefined,
      class: charClass || undefined,
      subclass: subclass || undefined,
      level: level || undefined,
      background: background || undefined,
      isRandom: false,
    });
  }

  function handleRandom() {
    setLoadingSource("random");
    onGenerate({ isRandom: true });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField
          label="Race"
          value={race}
          onChange={handleRaceChange}
          options={RACES as unknown as string[]}
          disabled={isLoading}
        />
        {availableVariants.length > 0 && (
          <SelectField
            label="Race Variant"
            value={raceVariant}
            onChange={setRaceVariant}
            options={availableVariants}
            disabled={isLoading}
            placeholder="Choose variant..."
          />
        )}
        <SelectField
          label="Class"
          value={charClass}
          onChange={handleClassChange}
          options={CLASSES as unknown as string[]}
          disabled={isLoading}
        />
        <SelectField
          label="Subclass"
          value={subclass}
          onChange={setSubclass}
          options={availableSubclasses}
          disabled={isLoading || !charClass}
          placeholder={charClass ? "Choose subclass..." : "Select a class first"}
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-amber-200/80">
            Level
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={level}
            onChange={(e) =>
              setLevel(e.target.value ? Number(e.target.value) : "")
            }
            disabled={isLoading}
            placeholder="1–20"
            className="w-full rounded-lg border border-amber-900/30 bg-stone-900/60 px-3 py-2 text-stone-100 placeholder-stone-500 transition focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30 disabled:opacity-50"
          />
        </div>
        <SelectField
          label="Background"
          value={background}
          onChange={setBackground}
          options={BACKGROUNDS as unknown as string[]}
          disabled={isLoading}
          className="sm:col-span-2"
        />
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 rounded-lg bg-amber-700 px-5 py-2.5 font-semibold text-white transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50 disabled:hover:bg-amber-700"
        >
          {isLoading && loadingSource === "custom" ? "Generating..." : "Generate Character"}
        </button>
        <button
          type="button"
          onClick={handleRandom}
          disabled={isLoading}
          className="flex-1 rounded-lg border border-amber-700/50 px-5 py-2.5 font-semibold text-amber-300 transition hover:bg-amber-900/30 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50"
        >
          {isLoading && loadingSource === "random" ? "Generating..." : "Fully Random"}
        </button>
      </div>
    </form>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  disabled,
  placeholder = "Any",
  className = "",
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium text-amber-200/80">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-amber-900/30 bg-stone-900/60 px-3 py-2 text-stone-100 transition focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30 disabled:opacity-50"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
