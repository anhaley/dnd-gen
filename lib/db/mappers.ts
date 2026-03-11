import type { SavedCharacter } from "@/lib/schemas";
import type { characters } from "./schema";

type CharacterRow = typeof characters.$inferSelect;

export function rowToSavedCharacter(row: CharacterRow): SavedCharacter {
  return {
    id: row.id,
    savedAt: new Date(row.savedAt).getTime(),
    name: row.name,
    race: row.race,
    raceVariant: row.raceVariant,
    class: row.class,
    subclass: row.subclass,
    level: row.level,
    background: row.background,
    alignment: row.alignment,
    hitPoints: row.hitPoints,
    armorClass: row.armorClass,
    armorClassBreakdown: row.armorClassBreakdown,
    speed: row.speed,
    proficiencyBonus: row.proficiencyBonus,
    spellAttackBonus: row.spellAttackBonus,
    spellSaveDC: row.spellSaveDC,
    backstory: row.backstory,
    abilityScores: row.abilityScores as SavedCharacter["abilityScores"],
    savingThrows: row.savingThrows as string[],
    skills: row.skills as string[],
    proficiencies: row.proficiencies as string[],
    weapons: row.weapons as SavedCharacter["weapons"],
    equipment: row.equipment as string[],
    features: row.features as string[],
    spellSlots: row.spellSlots as SavedCharacter["spellSlots"],
    spells: row.spells as SavedCharacter["spells"],
    traits: row.traits as SavedCharacter["traits"],
  };
}
