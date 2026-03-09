"use client";

import { EnrichedCharacter, EnrichedWeapon } from "@/lib/schemas";

interface CharacterSheetProps {
  character: EnrichedCharacter;
}

function abilityModifier(score: number): string {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

function formatBonus(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}

export default function CharacterSheet({ character }: CharacterSheetProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-amber-900/30 pb-4">
        <h2 className="font-serif text-3xl font-bold text-amber-100">
          {character.name}
        </h2>
        <p className="mt-1 text-lg text-stone-400">
          Level {character.level}{" "}
          {character.raceVariant
            ? `${character.raceVariant} ${character.race}`
            : character.race}{" "}
          {character.class}
          {character.subclass ? ` (${character.subclass})` : ""}
        </p>
        <p className="text-sm text-stone-500">
          {character.alignment} &middot; {character.background}
        </p>
      </div>

      {/* Core stats bar */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        <StatBox label="HP" value={String(character.hitPoints)} />
        <StatBox label="AC" value={String(character.armorClass)} />
        <StatBox label="Speed" value={character.speed} />
        <StatBox label="Prof. Bonus" value={`+${character.proficiencyBonus}`} />
      </div>

      {/* Ability scores */}
      <div>
        <h3 className="mb-3 font-serif text-lg font-semibold text-amber-200">
          Ability Scores
        </h3>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {(
            ["str", "dex", "con", "int", "wis", "cha"] as const
          ).map((ability) => (
            <div
              key={ability}
              className="flex flex-col items-center rounded-lg border border-amber-900/20 bg-stone-900/40 px-2 py-3"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400/70">
                {ability}
              </span>
              <span className="mt-1 text-2xl font-bold text-stone-100">
                {character.abilityScores[ability]}
              </span>
              <span className="text-sm text-stone-400">
                {abilityModifier(character.abilityScores[ability])}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Saving throws & Skills */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ListSection title="Saving Throws" items={character.savingThrows} />
        <ListSection title="Skills" items={character.skills} />
      </div>

      {/* Proficiencies */}
      <ListSection title="Proficiencies" items={character.proficiencies} />

      {/* Features */}
      <ListSection title="Features" items={character.features} />

      {/* Spellcasting */}
      {character.spells && character.spells.length > 0 && (
        <SpellcastingSection
          spells={character.spells}
          spellSlots={character.spellSlots}
          spellAttackBonus={character.spellAttackBonus}
          spellSaveDC={character.spellSaveDC}
        />
      )}

      {/* Weapons */}
      {character.weapons && character.weapons.length > 0 && (
        <WeaponsSection weapons={character.weapons} />
      )}

      {/* Equipment */}
      <ListSection title="Equipment" items={character.equipment} />

      {/* Traits */}
      <div>
        <h3 className="mb-3 font-serif text-lg font-semibold text-amber-200">
          Personality
        </h3>
        <div className="space-y-3 rounded-lg border border-amber-900/20 bg-stone-900/40 p-4">
          <TraitRow label="Traits" value={character.traits.personalityTraits} />
          <TraitRow label="Ideals" value={character.traits.ideals} />
          <TraitRow label="Bonds" value={character.traits.bonds} />
          <TraitRow label="Flaws" value={character.traits.flaws} />
        </div>
      </div>

      {/* Backstory */}
      <div>
        <h3 className="mb-3 font-serif text-lg font-semibold text-amber-200">
          Backstory
        </h3>
        <p className="rounded-lg border border-amber-900/20 bg-stone-900/40 p-4 leading-relaxed text-stone-300 italic">
          {character.backstory}
        </p>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-amber-900/20 bg-stone-900/40 px-3 py-2">
      <span className="text-xs font-medium uppercase tracking-wider text-stone-500">
        {label}
      </span>
      <span className="mt-0.5 text-xl font-bold text-amber-100">{value}</span>
    </div>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="mb-2 font-serif text-lg font-semibold text-amber-200">
        {title}
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span
            key={i}
            className="rounded-md border border-amber-900/20 bg-stone-900/40 px-2.5 py-1 text-sm text-stone-300"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function TraitRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-sm font-semibold text-amber-400/70">{label}: </span>
      <span className="text-sm text-stone-300">{value}</span>
    </div>
  );
}

function SpellcastingSection({
  spells,
  spellSlots,
  spellAttackBonus,
  spellSaveDC,
}: {
  spells: { name: string; level: number }[];
  spellSlots: { level: number; slots: number }[] | null;
  spellAttackBonus: number | null;
  spellSaveDC: number | null;
}) {
  const slotsByLevel = new Map(
    (spellSlots ?? []).map((s) => [s.level, s.slots])
  );

  const grouped = new Map<number, string[]>();
  for (const spell of spells) {
    const list = grouped.get(spell.level) ?? [];
    list.push(spell.name);
    grouped.set(spell.level, list);
  }

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
              <span className="mt-0.5 text-xl font-bold text-amber-100">
                {formatBonus(spellAttackBonus)}
              </span>
            </div>
          )}
          {spellSaveDC != null && (
            <div className="flex flex-col items-center rounded-lg border border-amber-900/20 bg-stone-900/40 px-4 py-2">
              <span className="text-xs font-medium uppercase tracking-wider text-stone-500">
                Spell Save DC
              </span>
              <span className="mt-0.5 text-xl font-bold text-amber-100">
                {spellSaveDC}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {levels.map((level) => {
          const names = grouped.get(level)!;
          const slots = slotsByLevel.get(level);
          const heading =
            level === 0
              ? "Cantrips"
              : `Level ${level}`;

          return (
            <div key={level}>
              <div className="mb-1.5 flex items-baseline gap-2">
                <span className="text-sm font-semibold text-amber-400/70">
                  {heading}
                </span>
                {level > 0 && slots != null && (
                  <span className="text-xs text-stone-500">
                    {slots} {slots === 1 ? "slot" : "slots"}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {names.map((name) => (
                  <span
                    key={name}
                    className="rounded-md border border-amber-900/20 bg-stone-900/40 px-2.5 py-1 text-sm text-stone-300"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeaponsSection({ weapons }: { weapons: EnrichedWeapon[] }) {
  return (
    <div>
      <h3 className="mb-3 font-serif text-lg font-semibold text-amber-200">
        Weapons
      </h3>
      <div className="space-y-2">
        {weapons.map((w, i) => (
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
        ))}
      </div>
    </div>
  );
}
