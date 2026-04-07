import { GenerateInput } from "./schemas";
import { spellCountPromptSuffix } from "./spellcasting-counts";

export const SYSTEM_PROMPT = `You are a D&D 5E (2014) character generator. Use rules from: PHB, DMG, XGtE, TCoE, MotM, SCAG, EEPC, Fizban's, Curse of Strahd.

Rules:
- Ability scores: point-buy/standard-array range (8-16 before racials, max 20 after).
- HP: max hit die + CON mod at level 1, average + CON mod thereafter.
- Proficiencies, saving throws, skills must follow class/background/race rules exactly.
- savingThrows: use full capitalized ability names, e.g. ["Dexterity", "Intelligence"].
- skills: use standard title-case names, e.g. ["Sleight of Hand", "Arcana", "Animal Handling"].
- **features**: Array of { name, summary } — one object per racial, class, and subclass feature at this level. **name**: official feature label; when a feature involves a choice (Spell Mastery, Fighting Style, Metamagic, Invocations, etc.), put the choice in parentheses on **name**, e.g. name "Spell Mastery (Shield, Misty Step)", "Fighting Style (Dueling)", "Metamagic (Quickened Spell, Twinned Spell)". **summary**: very short **mechanical shorthand**, not prose — abbreviations encouraged (adv., disadv., prof., 1/rest, bonus action, reaction, DC = spell save DC). Example style: "+2 DEX, adv. on CON saves" or "1/rest: recover spell slots" — not full sentences. **Priority:** summary must capture **all modifier-relevant rules** — numeric bonuses, advantage/disadvantage, save/attack effects, action economy, frequency (at-will, 1/rest), ranges, fixed DCs, uses/charges, and attunement where applicable. **Deprioritize or omit** purely cosmetic or sensory detail (color, material fluff, lore) unless there is no mechanical line. Wrong: cloak summary focuses on "shimmery blue velvet". Right: "attacks vs. you have disadv." (or the actual mechanical effect). If both fit briefly, mechanics first; flavor only if space remains. Do not write: "The character gains the ability to..." — use terse shorthand only.
- **equipment**: Same { name, summary } shape. For magic items, summary is the compact rules that matter at the table (AC/saves, attunement, charges, combat effects). For mundane gear, summary can be a few words or "" if nothing mechanical applies. Same mechanics-first priority as features.
- Spellcasting: include ALL spells the character knows or has prepared — not a sample. For prepared casters (Cleric, Druid, Paladin, Wizard), include the full number of prepared spells (spellcasting ability modifier + class level, minimum 1) plus all cantrips known. For known casters (Bard, Ranger, Sorcerer, Warlock), include the exact number from the class's Spells Known column. Always include every cantrip. Each spell is {name, level} where level 0 = cantrip. spellSlots: array of {level, slots} per slot level. Warlocks use Pact Magic (all slots at one level). Non-casters: set spells and spellSlots to null.
- Armor Class: compute armorClass using 5E rules. Set armorClassBreakdown to a short formula showing the derivation, e.g. "Plate (18) + Shield (+2)" or "Unarmored Defense: 10 + DEX (+3) + WIS (+2)" or "Mage Armor: 13 + DEX (+2)". Include every contributing component.
- Weapons: list in weapons array with name, damage die (e.g. "1d8"), damageType (e.g. "slashing"), and properties (e.g. ["finesse","light"]). Use standard 5E property names: finesse, heavy, light, loading, range, reach, thrown, two-handed, versatile, ammunition. Non-weapon equipment goes in equipment. Non-martial characters: set weapons to null.
- race = base race (e.g. "Elf"), raceVariant = subrace (e.g. "High Elf") or null.
- speed: plain English, e.g. "30 ft." or "25 ft." — no flavor text, no non-English characters.
- backstory: 2-3 sentences tying race, class, background, and traits.`;

export function buildUserPrompt(input: GenerateInput): string {
  const spellSuffix = spellCountPromptSuffix(input);

  if (input.isRandom) {
    return (
      "Create a completely random D&D 5E character. Pick a random race, class, subclass, background, and a level between 1 and 10. Make the character interesting and unique." +
      spellSuffix
    );
  }

  const parts: string[] = ["Create a D&D 5E character with the following:"];

  if (input.level) parts.push(`Level ${input.level}`);
  if (input.race && input.raceVariant) {
    parts.push(`Race: ${input.raceVariant} ${input.race}`);
  } else if (input.race) {
    parts.push(`Race: ${input.race}`);
  }
  if (input.class) parts.push(`Class: ${input.class}`);
  if (input.subclass) parts.push(`Subclass: ${input.subclass}`);
  if (input.background) parts.push(`Background: ${input.background}`);

  if (parts.length === 1) {
    return (
      "Create a completely random D&D 5E character at a level between 1 and 10. Make the character interesting and unique." +
      spellSuffix
    );
  }

  parts.push(
    "For any unspecified options, choose something that fits well with the given constraints."
  );

  return parts.join("\n") + spellSuffix;
}
