import { GenerateInput } from "./schemas";

export const SYSTEM_PROMPT = `You are a D&D 5E (2014) character generator. Use rules from: PHB, XGtE, TCoE, MotM, SCAG, EEPC, Fizban's, Curse of Strahd.

Rules:
- Ability scores: point-buy/standard-array range (8-16 before racials, max 20 after).
- HP: max hit die + CON mod at level 1, average + CON mod thereafter.
- Proficiencies, saving throws, skills must follow class/background/race rules exactly.
- Features: all racial + class features for the given level.
- Spellcasting: include spells with name and level (0=cantrip). spellSlots: array of {level, slots} per slot level. Warlocks use Pact Magic (all slots at one level). Non-casters: set spells and spellSlots to null.
- Weapons: list in weapons array with name, damage die (e.g. "1d8"), damageType (e.g. "slashing"), and properties (e.g. ["finesse","light"]). Use standard 5E property names: finesse, heavy, light, loading, range, reach, thrown, two-handed, versatile, ammunition. Non-weapon equipment goes in equipment. Non-martial characters: set weapons to null.
- race = base race (e.g. "Elf"), raceVariant = subrace (e.g. "High Elf") or null.
- backstory: 2-3 sentences tying race, class, background, and traits.`;

export function buildUserPrompt(input: GenerateInput): string {
  if (input.isRandom) {
    return "Create a completely random D&D 5E character. Pick a random race, class, subclass, background, and a level between 1 and 10. Make the character interesting and unique.";
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
    return "Create a completely random D&D 5E character at a level between 1 and 10. Make the character interesting and unique.";
  }

  parts.push(
    "For any unspecified options, choose something that fits well with the given constraints."
  );

  return parts.join("\n");
}
