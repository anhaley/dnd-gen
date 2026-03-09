import { z } from "zod";

export const AbilityScoresSchema = z.object({
  str: z.number(),
  dex: z.number(),
  con: z.number(),
  int: z.number(),
  wis: z.number(),
  cha: z.number(),
});

export const TraitsSchema = z.object({
  personalityTraits: z.string(),
  ideals: z.string(),
  bonds: z.string(),
  flaws: z.string(),
});

export const WeaponSchema = z.object({
  name: z.string(),
  damage: z.string(),
  damageType: z.string(),
  properties: z.array(z.string()),
});

export const CharacterSchema = z.object({
  name: z.string(),
  race: z.string(),
  raceVariant: z.string().nullable(),
  class: z.string(),
  subclass: z.string(),
  level: z.number().min(1).max(20),
  background: z.string(),
  alignment: z.string(),
  abilityScores: AbilityScoresSchema,
  hitPoints: z.number(),
  armorClass: z.number(),
  speed: z.string(),
  proficiencyBonus: z.number(),
  savingThrows: z.array(z.string()),
  skills: z.array(z.string()),
  proficiencies: z.array(z.string()),
  weapons: z.array(WeaponSchema).nullable(),
  equipment: z.array(z.string()),
  features: z.array(z.string()),
  spellSlots: z
    .array(z.object({ level: z.number(), slots: z.number() }))
    .nullable(),
  spells: z
    .array(z.object({ name: z.string(), level: z.number() }))
    .nullable(),
  traits: TraitsSchema,
  backstory: z.string(),
});

export type Character = z.infer<typeof CharacterSchema>;
export type AbilityScores = z.infer<typeof AbilityScoresSchema>;

export interface EnrichedWeapon {
  name: string;
  damage: string;
  damageType: string;
  properties: string[];
  attackBonus: number;
  damageBonus: number;
}

export interface EnrichedCharacter extends Omit<Character, "weapons"> {
  weapons: EnrichedWeapon[] | null;
  spellAttackBonus: number | null;
  spellSaveDC: number | null;
}

export const GenerateInputSchema = z.object({
  race: z.string().optional(),
  raceVariant: z.string().optional(),
  class: z.string().optional(),
  subclass: z.string().optional(),
  level: z.number().min(1).max(20).optional(),
  background: z.string().optional(),
  isRandom: z.boolean().optional(),
});

export type GenerateInput = z.infer<typeof GenerateInputSchema>;

export interface SavedCharacter extends EnrichedCharacter {
  id: string;
  savedAt: number;
}
