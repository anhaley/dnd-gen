/**
 * PHB / TCoE spell-count tables for prompt injection.
 * Domain / oath / circle bonus spells are NOT modeled; the model may list
 * slightly more prepared spells than the minimum formula — that is acceptable.
 */

import type { GenerateInput } from "./schemas";
import { SPELLCASTING_ABILITY } from "./dnd-data";

const GENERIC_SPELL_INSTRUCTION =
  "Spell list: If this character is a spellcaster, after choosing class, subclass, level, and ability scores, compute the correct number of cantrips and leveled spells per PHB rules. The spells array must list every cantrip and every prepared or known leveled spell with correct spell level — verify the total count matches the rules before finishing.";

function norm(s: string | undefined): string {
  return (s ?? "").trim().toLowerCase();
}

/** Eldritch Knight / Arcane Trickster — third-caster spell tables */
export function isSpellcastingSubclass(subclass: string | undefined): boolean {
  const s = norm(subclass);
  return s === "eldritch knight" || s === "arcane trickster";
}

/** Spells known by character level (index level - 1). Levels 1–2 are 0 (subclass not active). */
const SPELLS_KNOWN_EK_AT: number[] = [
  0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13,
];

/** Cantrips for EK/AT: 0 at 1–2, 2 at 3–9, 3 at 10–20 */
function cantripsKnownThirdCaster(level: number): number {
  if (level < 3) return 0;
  if (level <= 9) return 2;
  return 3;
}

/** PHB Bard — Spells Known */
const SPELLS_KNOWN_BARD: number[] = [
  4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22,
];

/** PHB Ranger — Spells Known (level 1 has no spellcasting) */
const SPELLS_KNOWN_RANGER: number[] = [
  0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 11, 11, 11, 11,
];

/** PHB Sorcerer — Spells Known */
const SPELLS_KNOWN_SORCERER: number[] = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15,
];

/** PHB Warlock — Spells Known */
const SPELLS_KNOWN_WARLOCK: number[] = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15,
];

/** Cantrips: Wizard, Cleric, Druid — same progression */
const CANTRIPS_FULL_CASTER: number[] = [
  3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
];

/** Cantrips: Bard */
const CANTRIPS_BARD: number[] = [
  2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
];

/** Cantrips: Sorcerer */
const CANTRIPS_SORCERER: number[] = [
  4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
];

/** Cantrips: Warlock */
const CANTRIPS_WARLOCK: number[] = [
  2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
];

/** PHB Ranger — no cantrips from class table */
const CANTRIPS_RANGER: number[] = Array(20).fill(0);

/** TCoE Artificer — Cantrips Known (levels 1–4: 2; 5–10: 3; 11–20: 4) */
const CANTRIPS_ARTIFICER: number[] = [
  2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
];

const PREPARED_CLASSES = new Set([
  "wizard",
  "cleric",
  "druid",
  "paladin",
  "artificer",
]);

const KNOWN_CLASSES = new Set(["bard", "ranger", "sorcerer", "warlock"]);

function modifierFormulaForPrepared(classKey: string): string {
  switch (classKey) {
    case "wizard":
      return "abilityScores.int + character level (minimum 1 leveled spell)";
    case "cleric":
    case "druid":
      return "abilityScores.wis + character level (minimum 1 leveled spell)";
    case "paladin":
      return "abilityScores.cha + half Paladin level rounded down (minimum 1 leveled spell)";
    case "artificer":
      return "abilityScores.int + half Artificer level rounded down (minimum 1 leveled spell)";
    default:
      return "per PHB";
  }
}

function cantripsForPrepared(classKey: string, level: number): number {
  const i = level - 1;
  if (classKey === "paladin") return 0;
  if (classKey === "artificer") return CANTRIPS_ARTIFICER[i] ?? 0;
  return CANTRIPS_FULL_CASTER[i] ?? 0;
}

function spellsKnownForKnownClass(classKey: string, level: number): number {
  const i = level - 1;
  const tables: Record<string, number[]> = {
    bard: SPELLS_KNOWN_BARD,
    ranger: SPELLS_KNOWN_RANGER,
    sorcerer: SPELLS_KNOWN_SORCERER,
    warlock: SPELLS_KNOWN_WARLOCK,
  };
  return tables[classKey]?.[i] ?? 0;
}

function cantripsForKnownClass(classKey: string, level: number): number {
  const i = level - 1;
  if (classKey === "bard") return CANTRIPS_BARD[i] ?? 0;
  if (classKey === "ranger") return CANTRIPS_RANGER[i] ?? 0;
  if (classKey === "sorcerer") return CANTRIPS_SORCERER[i] ?? 0;
  if (classKey === "warlock") return CANTRIPS_WARLOCK[i] ?? 0;
  return 0;
}

/** Barbarian, Monk — no spellcasting in PHB base class */
const NON_SPELL_BASE_CLASSES = new Set(["barbarian", "monk"]);

/**
 * True if the user explicitly chose a class that has no spellcasting
 * (Fighter/Rogue without EK/AT, Barbarian, Monk).
 * Unknown class names are not treated as non-casters (caller may show generic).
 */
function isExplicitNonCaster(input: GenerateInput): boolean {
  if (isSpellcastingSubclass(input.subclass)) return false;
  const cls = norm(input.class);
  if (!cls) return false;
  if (PREPARED_CLASSES.has(cls) || KNOWN_CLASSES.has(cls)) return false;
  if (cls === "fighter" || cls === "rogue") return true;
  return NON_SPELL_BASE_CLASSES.has(cls);
}

function spellcastingAbilityForClass(className: string): "int" | "wis" | "cha" {
  const entry = Object.entries(SPELLCASTING_ABILITY).find(
    ([k]) => k.toLowerCase() === norm(className)
  );
  return entry?.[1] ?? "int";
}

/**
 * True when we should append the generic spell-count instruction.
 */
export function shouldAppendGenericSpellInstruction(input: GenerateInput): boolean {
  if (input.isRandom) return true;
  if (!input.class && !input.subclass) return true;
  if (isSpellcastingSubclass(input.subclass) && !input.level) return true;
  if (input.class && isSpellcastingClass(input) && !input.level) return true;
  return false;
}

function isSpellcastingClass(input: GenerateInput): boolean {
  if (isSpellcastingSubclass(input.subclass)) return true;
  const cls = norm(input.class);
  if (!cls) return false;
  return PREPARED_CLASSES.has(cls) || KNOWN_CLASSES.has(cls);
}

/**
 * Specific spell-count line for the user prompt, or null if not applicable.
 */
export function buildSpellCountUserInstruction(input: GenerateInput): string | null {
  if (input.isRandom) return null;
  if (shouldAppendGenericSpellInstruction(input)) return null;
  if (isExplicitNonCaster(input)) return null;

  const level = input.level;
  if (!level) return null;

  const sub = norm(input.subclass);
  const cls = norm(input.class);

  // Third-caster: subclass match (with or without matching base class)
  if (sub === "eldritch knight" || sub === "arcane trickster") {
    const cantrips = cantripsKnownThirdCaster(level);
    const leveled = SPELLS_KNOWN_EK_AT[level - 1] ?? 0;
    return (
      `Spell list: This character uses the ${sub === "eldritch knight" ? "Eldritch Knight" : "Arcane Trickster"} spell progression. ` +
      `Include exactly ${cantrips} cantrip(s) (level 0) and exactly ${leveled} leveled spell(s) in the spells array (spell levels 1–4 only for this subclass).`
    );
  }

  if (!cls) return null;

  if (PREPARED_CLASSES.has(cls)) {
    const c = cantripsForPrepared(cls, level);
    const formula = modifierFormulaForPrepared(cls);
    const ability = spellcastingAbilityForClass(input.class!);
    const scoreKey = `abilityScores.${ability}`;
    return (
      `Spell list: Include exactly ${c} cantrip(s) (level 0). ` +
      `After setting ability scores, the number of leveled (non-cantrip) spells must equal: ${formula}. ` +
      `Use ${scoreKey} for the spellcasting modifier.`
    );
  }

  if (KNOWN_CLASSES.has(cls)) {
    const cantrips = cantripsForKnownClass(cls, level);
    const known = spellsKnownForKnownClass(cls, level);
    const label =
      cls === "bard"
        ? "Bard"
        : cls === "ranger"
          ? "Ranger"
          : cls === "sorcerer"
            ? "Sorcerer"
            : "Warlock";
    return (
      `Spell list: This ${label} at level ${level} must have exactly ${cantrips} cantrip(s) and exactly ${known} leveled spell(s) in the spells array (per PHB Spells Known / Cantrips Known tables).`
    );
  }

  return null;
}

/**
 * Text to append to the generate user prompt (newline prefix included when non-empty).
 */
export function spellCountPromptSuffix(input: GenerateInput): string {
  if (input.isRandom) return "\n\n" + GENERIC_SPELL_INSTRUCTION;

  const specific = buildSpellCountUserInstruction(input);
  if (specific) return "\n\n" + specific;

  if (shouldAppendGenericSpellInstruction(input)) return "\n\n" + GENERIC_SPELL_INSTRUCTION;

  return "";
}

export { GENERIC_SPELL_INSTRUCTION };
