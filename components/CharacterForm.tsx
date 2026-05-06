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
import { cn } from "@/lib/cn";
import { Button, Input, Label, Select } from "@/components/ui";
import { fieldClassName } from "@/components/ui/field-classes";

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
  const [instructions, setInstructions] = useState("");
  const [loadingSource, setLoadingSource] = useState<"custom" | "random" | null>(null);

  const availableVariants = race ? RACE_VARIANTS[race] ?? [] : [];
  const availableSubclasses = charClass ? SUBCLASSES[charClass] ?? [] : [];

  const trimmedInstructions = instructions.trim();
  const instructionsPayload =
    trimmedInstructions.length > 0 ? trimmedInstructions : undefined;

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
      instructions: instructionsPayload,
    });
  }

  function handleRandom() {
    setLoadingSource("random");
    onGenerate({
      isRandom: true,
      instructions: instructionsPayload,
    });
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
          <Label>Level</Label>
          <Input
            type="number"
            min={1}
            max={20}
            value={level === "" ? "" : level}
            onChange={(e) =>
              setLevel(e.target.value ? Number(e.target.value) : "")
            }
            disabled={isLoading}
            placeholder="1–20"
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

      <div>
        <Label htmlFor="creative-brief">
          Creative brief{" "}
          <span className="font-normal text-muted">(optional)</span>
        </Label>
        <textarea
          id="creative-brief"
          rows={3}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter" || e.shiftKey) return;
            if (e.nativeEvent.isComposing) return;
            if (isLoading) return;
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
          }}
          disabled={isLoading}
          placeholder="Flavor, deity, gear, backstory hooks, etc."
          className={cn(
            fieldClassName,
            "resize-y min-h-[5rem] placeholder:text-muted/55"
          )}
        />
        <p className="mt-1.5 text-xs text-muted">
          Applied on your next generation (including Fully Random when filled).
        </p>
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading && loadingSource === "custom" ? "Generating..." : "Generate Character"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={isLoading}
          onClick={handleRandom}
          className="flex-1"
        >
          {isLoading && loadingSource === "random" ? "Generating..." : "Fully Random"}
        </Button>
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
      <Label>{label}</Label>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </Select>
    </div>
  );
}
