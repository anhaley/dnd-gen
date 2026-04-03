"use client";

import { useState } from "react";
import { EnrichedCharacter, EnrichedWeapon, AbilityScores } from "@/lib/schemas";
import { RACE_VARIANTS } from "@/lib/dnd-data";
import {
  EditableText,
  EditableNumber,
  EditableTextarea,
  EditableList,
} from "./EditableField";

interface CharacterSheetProps {
  character: EnrichedCharacter;
  editable?: boolean;
  onChange?: (character: EnrichedCharacter) => void;
  onExport?: () => void;
  isExporting?: boolean;
}

function abilityModifier(score: number): string {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function formatBonus(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

type AbilityKey = keyof AbilityScores;

export default function CharacterSheet({
  character,
  editable = false,
  onChange,
  onExport,
  isExporting = false,
}: CharacterSheetProps) {
  function update(patch: Partial<EnrichedCharacter>) {
    onChange?.({ ...character, ...patch });
  }

  function updateAbility(key: AbilityKey, value: number) {
    onChange?.({
      ...character,
      abilityScores: { ...character.abilityScores, [key]: value },
    });
  }

  function updateTrait(key: keyof EnrichedCharacter["traits"], value: string) {
    onChange?.({
      ...character,
      traits: { ...character.traits, [key]: value },
    });
  }

  function updateWeapon(index: number, patch: Partial<EnrichedWeapon>) {
    const weapons = [...(character.weapons ?? [])];
    weapons[index] = { ...weapons[index], ...patch };
    onChange?.({ ...character, weapons });
  }

  function updateSpell(index: number, patch: Partial<{ name: string; level: number }>) {
    const spells = [...(character.spells ?? [])];
    spells[index] = { ...spells[index], ...patch };
    onChange?.({ ...character, spells });
  }

  function updateSpellSlot(index: number, patch: Partial<{ level: number; slots: number }>) {
    const spellSlots = [...(character.spellSlots ?? [])];
    spellSlots[index] = { ...spellSlots[index], ...patch };
    onChange?.({ ...character, spellSlots });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-amber-900/30 pb-4">
        {onExport && (
          <div className="flex justify-end mb-2">
            <button
              onClick={onExport}
              disabled={isExporting}
              className="flex items-center gap-1.5 rounded-md border border-amber-900/30 px-3 py-1.5 text-sm text-stone-400 transition hover:border-amber-700/40 hover:text-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
              </svg>
              {isExporting ? "Exporting..." : "Export to PDF"}
            </button>
          </div>
        )}
        {editable ? (
          <div className="space-y-2">
            <EditableText
              value={character.name}
              onChange={(v) => update({ name: v })}
              editable
              className="font-serif text-3xl font-bold text-amber-100"
            />
            <div className="flex flex-wrap items-center gap-2 text-lg text-stone-400">
              <span>Level</span>
              <EditableNumber
                value={character.level}
                onChange={(v) => update({ level: v })}
                editable
                min={1}
                max={20}
                className="w-16 text-center text-lg"
              />
              {(character.raceVariant || character.race in RACE_VARIANTS) && (
                <EditableText
                  value={character.raceVariant ?? ""}
                  onChange={(v) => update({ raceVariant: v || null })}
                  editable
                  placeholder="Variant"
                  className="w-28"
                />
              )}
              <EditableText
                value={character.race}
                onChange={(v) => update({ race: v })}
                editable
                className="w-24"
              />
              <EditableText
                value={character.class}
                onChange={(v) => update({ class: v })}
                editable
                className="w-24"
              />
              <EditableText
                value={character.subclass}
                onChange={(v) => update({ subclass: v })}
                editable
                className="w-36"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-stone-500">
              <EditableText
                value={character.alignment}
                onChange={(v) => update({ alignment: v })}
                editable
                className="w-32"
              />
              <span>&middot;</span>
              <EditableText
                value={character.background}
                onChange={(v) => update({ background: v })}
                editable
                className="w-28"
              />
            </div>
          </div>
        ) : (
          <>
            <h2 className="font-serif text-3xl font-bold text-amber-100">
              {character.name}
            </h2>
            <p className="mt-1 text-lg text-stone-400">
              Level {character.level}{" "}
              {character.raceVariant && character.raceVariant !== "null"
                ? `${character.raceVariant} ${character.race}`
                : character.race}{" "}
              {character.class}
              {character.subclass ? ` (${character.subclass})` : ""}
            </p>
            <p className="text-sm text-stone-500">
              {character.alignment} &middot; {character.background}
            </p>
          </>
        )}
      </div>

      {/* Core stats bar */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        <StatBox
          label="HP"
          value={character.hitPoints}
          editable={editable}
          onNumberChange={(v) => update({ hitPoints: v })}
        />
        <StatBox
          label="AC"
          value={character.armorClass}
          tooltip={character.armorClassBreakdown}
          editable={editable}
          onNumberChange={(v) => update({ armorClass: v })}
        />
        <StatBox
          label="Speed"
          value={character.speed}
          editable={editable}
          onTextChange={(v) => update({ speed: v })}
        />
        <StatBox
          label="Prof. Bonus"
          value={character.proficiencyBonus}
          editable={editable}
          onNumberChange={(v) => update({ proficiencyBonus: v })}
        />
      </div>

      {/* Ability scores */}
      <div>
        <h3 className="mb-3 font-serif text-lg font-semibold text-amber-200">
          Ability Scores
        </h3>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {(["str", "dex", "con", "int", "wis", "cha"] as const).map(
            (ability) => (
              <div
                key={ability}
                className="flex flex-col items-center rounded-lg border border-amber-900/20 bg-stone-900/40 px-2 py-3"
              >
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400/70">
                  {ability}
                </span>
                {editable ? (
                  <EditableNumber
                    value={character.abilityScores[ability]}
                    onChange={(v) => updateAbility(ability, v)}
                    editable
                    className="mt-1 w-14 text-center text-2xl font-bold"
                  />
                ) : (
                  <span className="mt-1 text-2xl font-bold text-stone-100">
                    {character.abilityScores[ability]}
                  </span>
                )}
                <span className="text-sm text-stone-400">
                  {abilityModifier(character.abilityScores[ability])}
                </span>
              </div>
            )
          )}
        </div>
      </div>

      {/* Saving throws & Skills */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ListSection
          title="Saving Throws"
          items={character.savingThrows}
          editable={editable}
          onChange={(items) => update({ savingThrows: items })}
        />
        <ListSection
          title="Skills"
          items={character.skills}
          editable={editable}
          onChange={(items) => update({ skills: items })}
        />
      </div>

      {/* Proficiencies */}
      <ListSection
        title="Proficiencies"
        items={character.proficiencies}
        editable={editable}
        onChange={(items) => update({ proficiencies: items })}
      />

      {/* Features */}
      <ListSection
        title="Features"
        items={character.features}
        editable={editable}
        onChange={(items) => update({ features: items })}
      />

      {/* Spellcasting */}
      {character.spells && character.spells.length > 0 && (
        <SpellcastingSection
          spells={character.spells}
          spellSlots={character.spellSlots}
          spellAttackBonus={character.spellAttackBonus}
          spellSaveDC={character.spellSaveDC}
          editable={editable}
          onSpellAttackBonusChange={(v) => update({ spellAttackBonus: v })}
          onSpellSaveDCChange={(v) => update({ spellSaveDC: v })}
          onSpellChange={updateSpell}
          onSpellSlotChange={updateSpellSlot}
        />
      )}

      {/* Weapons */}
      {character.weapons && character.weapons.length > 0 && (
        <WeaponsSection
          weapons={character.weapons}
          editable={editable}
          onWeaponChange={updateWeapon}
        />
      )}

      {/* Equipment */}
      <ListSection
        title="Equipment"
        items={character.equipment}
        editable={editable}
        onChange={(items) => update({ equipment: items })}
      />

      {/* Traits */}
      <div>
        <h3 className="mb-3 font-serif text-lg font-semibold text-amber-200">
          Personality
        </h3>
        <div className="space-y-3 rounded-lg border border-amber-900/20 bg-stone-900/40 p-4">
          <TraitRow
            label="Traits"
            value={character.traits.personalityTraits}
            editable={editable}
            onChange={(v) => updateTrait("personalityTraits", v)}
          />
          <TraitRow
            label="Ideals"
            value={character.traits.ideals}
            editable={editable}
            onChange={(v) => updateTrait("ideals", v)}
          />
          <TraitRow
            label="Bonds"
            value={character.traits.bonds}
            editable={editable}
            onChange={(v) => updateTrait("bonds", v)}
          />
          <TraitRow
            label="Flaws"
            value={character.traits.flaws}
            editable={editable}
            onChange={(v) => updateTrait("flaws", v)}
          />
        </div>
      </div>

      {/* Backstory */}
      <div>
        <h3 className="mb-3 font-serif text-lg font-semibold text-amber-200">
          Backstory
        </h3>
        {editable ? (
          <EditableTextarea
            value={character.backstory}
            onChange={(v) => update({ backstory: v })}
            editable
            className="w-full rounded-lg border-amber-900/20 bg-stone-900/40 p-4 leading-relaxed text-stone-300 italic"
          />
        ) : (
          <p className="rounded-lg border border-amber-900/20 bg-stone-900/40 p-4 leading-relaxed text-stone-300 italic">
            {character.backstory}
          </p>
        )}
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  tooltip,
  editable,
  onNumberChange,
  onTextChange,
}: {
  label: string;
  value: number | string;
  tooltip?: string;
  editable: boolean;
  onNumberChange?: (v: number) => void;
  onTextChange?: (v: string) => void;
}) {
  const [showTip, setShowTip] = useState(false);

  const isNumber = typeof value === "number";
  const displayValue = isNumber ? String(value) : value;

  return (
    <div className="relative flex flex-col items-center rounded-lg border border-amber-900/20 bg-stone-900/40 px-3 py-2">
      <span className="text-xs font-medium uppercase tracking-wider text-stone-500">
        {label}
        {tooltip && (
          <button
            onClick={() => setShowTip((prev) => !prev)}
            className="ml-1 inline-flex align-middle text-stone-600 transition hover:text-amber-400"
            aria-label={`${label} details`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-3 w-3"
            >
              <path
                fillRule="evenodd"
                d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-6-3.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM7.5 7a.5.5 0 0 0 0 1h.25v2.5h-.5a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1H9V7.5a.5.5 0 0 0-.5-.5h-1Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </span>
      {editable ? (
        isNumber && onNumberChange ? (
          <EditableNumber
            value={value as number}
            onChange={onNumberChange}
            editable
            className="mt-0.5 w-16 text-center text-xl font-bold"
          />
        ) : onTextChange ? (
          <EditableText
            value={displayValue}
            onChange={onTextChange}
            editable
            className="mt-0.5 w-20 text-center text-xl font-bold"
          />
        ) : (
          <span className="mt-0.5 text-xl font-bold text-amber-100">
            {displayValue}
          </span>
        )
      ) : (
        <span className="mt-0.5 text-xl font-bold text-amber-100">
          {isNumber
            ? label === "Prof. Bonus"
              ? `+${value}`
              : displayValue
            : displayValue}
        </span>
      )}
      {showTip && tooltip && (
        <div className="absolute top-full z-10 mt-1 whitespace-nowrap rounded-md border border-amber-900/30 bg-stone-900 px-2.5 py-1.5 text-xs text-stone-300 shadow-lg">
          {tooltip}
        </div>
      )}
    </div>
  );
}

function ListSection({
  title,
  items,
  editable,
  onChange,
}: {
  title: string;
  items: string[];
  editable: boolean;
  onChange: (items: string[]) => void;
}) {
  return (
    <div>
      <h3 className="mb-2 font-serif text-lg font-semibold text-amber-200">
        {title}
      </h3>
      <EditableList items={items} onChange={onChange} editable={editable} />
    </div>
  );
}

function TraitRow({
  label,
  value,
  editable,
  onChange,
}: {
  label: string;
  value: string;
  editable: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <span className="text-sm font-semibold text-amber-400/70">{label}: </span>
      <EditableText
        value={value}
        onChange={onChange}
        editable={editable}
        className="text-sm text-stone-300"
      />
    </div>
  );
}

function SpellcastingSection({
  spells,
  spellSlots,
  spellAttackBonus,
  spellSaveDC,
  editable,
  onSpellAttackBonusChange,
  onSpellSaveDCChange,
  onSpellChange,
  onSpellSlotChange,
}: {
  spells: { name: string; level: number }[];
  spellSlots: { level: number; slots: number }[] | null;
  spellAttackBonus: number | null;
  spellSaveDC: number | null;
  editable: boolean;
  onSpellAttackBonusChange: (v: number | null) => void;
  onSpellSaveDCChange: (v: number | null) => void;
  onSpellChange: (index: number, patch: Partial<{ name: string; level: number }>) => void;
  onSpellSlotChange: (index: number, patch: Partial<{ level: number; slots: number }>) => void;
}) {
  const slotsByLevel = new Map(
    (spellSlots ?? []).map((s) => [s.level, { slots: s.slots, index: (spellSlots ?? []).indexOf(s) }])
  );

  const grouped = new Map<number, { name: string; originalIndex: number }[]>();
  spells.forEach((spell, i) => {
    const list = grouped.get(spell.level) ?? [];
    list.push({ name: spell.name, originalIndex: i });
    grouped.set(spell.level, list);
  });

  const levels = [...grouped.keys()].sort((a, b) => a - b);

  return (
    <div>
      <h3 className="mb-3 font-serif text-lg font-semibold text-amber-200">
        Spellcasting
      </h3>

      {(spellAttackBonus != null || spellSaveDC != null) && (
        <div className="mb-4 flex gap-3">
          {spellAttackBonus != null && (
            <div className="flex flex-col items-center rounded-lg border border-amber-900/20 bg-stone-900/40 px-4 py-2">
              <span className="text-xs font-medium uppercase tracking-wider text-stone-500">
                Spell Attack
              </span>
              {editable ? (
                <EditableNumber
                  value={spellAttackBonus}
                  onChange={(v) => onSpellAttackBonusChange(v)}
                  editable
                  className="mt-0.5 w-16 text-center text-xl font-bold"
                />
              ) : (
                <span className="mt-0.5 text-xl font-bold text-amber-100">
                  {formatBonus(spellAttackBonus)}
                </span>
              )}
            </div>
          )}
          {spellSaveDC != null && (
            <div className="flex flex-col items-center rounded-lg border border-amber-900/20 bg-stone-900/40 px-4 py-2">
              <span className="text-xs font-medium uppercase tracking-wider text-stone-500">
                Spell Save DC
              </span>
              {editable ? (
                <EditableNumber
                  value={spellSaveDC}
                  onChange={(v) => onSpellSaveDCChange(v)}
                  editable
                  className="mt-0.5 w-16 text-center text-xl font-bold"
                />
              ) : (
                <span className="mt-0.5 text-xl font-bold text-amber-100">
                  {spellSaveDC}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {levels.map((level) => {
          const entries = grouped.get(level)!;
          const slotInfo = slotsByLevel.get(level);
          const heading = level === 0 ? "Cantrips" : `Level ${level}`;

          return (
            <div key={level}>
              <div className="mb-1.5 flex items-baseline gap-2">
                <span className="text-sm font-semibold text-amber-400/70">
                  {heading}
                </span>
                {level > 0 && slotInfo != null && (
                  editable ? (
                    <span className="flex items-center gap-1 text-xs text-stone-500">
                      <EditableNumber
                        value={slotInfo.slots}
                        onChange={(v) => onSpellSlotChange(slotInfo.index, { slots: v })}
                        editable
                        className="w-10 text-center text-xs"
                      />
                      {slotInfo.slots === 1 ? "slot" : "slots"}
                    </span>
                  ) : (
                    <span className="text-xs text-stone-500">
                      {slotInfo.slots} {slotInfo.slots === 1 ? "slot" : "slots"}
                    </span>
                  )
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {entries.map((entry) => (
                  editable ? (
                    <EditableText
                      key={entry.originalIndex}
                      value={entry.name}
                      onChange={(v) => onSpellChange(entry.originalIndex, { name: v })}
                      editable
                      className="rounded-md border border-amber-900/20 bg-stone-900/40 px-2.5 py-1 text-sm"
                    />
                  ) : (
                    <span
                      key={entry.originalIndex}
                      className="rounded-md border border-amber-900/20 bg-stone-900/40 px-2.5 py-1 text-sm text-stone-300"
                    >
                      {entry.name}
                    </span>
                  )
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeaponsSection({
  weapons,
  editable,
  onWeaponChange,
}: {
  weapons: EnrichedWeapon[];
  editable: boolean;
  onWeaponChange: (index: number, patch: Partial<EnrichedWeapon>) => void;
}) {
  return (
    <div>
      <h3 className="mb-3 font-serif text-lg font-semibold text-amber-200">
        Weapons
      </h3>
      <div className="space-y-2">
        {weapons.map((w, i) =>
          editable ? (
            <div
              key={i}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg border border-amber-900/20 bg-stone-900/40 px-4 py-2.5"
            >
              <EditableText
                value={w.name}
                onChange={(v) => onWeaponChange(i, { name: v })}
                editable
                className="w-32 font-medium"
              />
              <div className="flex items-center gap-1 text-sm text-amber-400/80">
                <EditableNumber
                  value={w.attackBonus}
                  onChange={(v) => onWeaponChange(i, { attackBonus: v })}
                  editable
                  className="w-12 text-center text-sm"
                />
                <span>to hit</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-stone-300">
                <EditableText
                  value={w.damage}
                  onChange={(v) => onWeaponChange(i, { damage: v })}
                  editable
                  className="w-16 text-sm"
                />
                <EditableNumber
                  value={w.damageBonus}
                  onChange={(v) => onWeaponChange(i, { damageBonus: v })}
                  editable
                  className="w-12 text-center text-sm"
                />
                <EditableText
                  value={w.damageType}
                  onChange={(v) => onWeaponChange(i, { damageType: v })}
                  editable
                  className="w-20 text-sm"
                />
              </div>
            </div>
          ) : (
            <div
              key={i}
              className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-lg border border-amber-900/20 bg-stone-900/40 px-4 py-2.5"
            >
              <span className="font-medium text-stone-200">{w.name}</span>
              <span className="text-sm text-amber-400/80">
                {formatBonus(w.attackBonus)} to hit
              </span>
              <span className="text-sm text-stone-300">
                {w.damage}
                {w.damageBonus !== 0 && ` ${formatBonus(w.damageBonus)}`}{" "}
                {w.damageType}
              </span>
              {w.properties.length > 0 && (
                <span className="text-xs text-stone-500">
                  ({w.properties.join(", ")})
                </span>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}
