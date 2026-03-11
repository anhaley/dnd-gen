import { describe, it, expect } from "vitest";
import { rowToSavedCharacter } from "../db/mappers";

function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    savedAt: new Date("2025-06-15T12:00:00Z"),
    name: "Thalindra",
    race: "Elf",
    raceVariant: "High Elf",
    class: "Wizard",
    subclass: "School of Evocation",
    level: 5,
    background: "Sage",
    alignment: "Neutral Good",
    hitPoints: 32,
    armorClass: 12,
    armorClassBreakdown: "Mage Armor (13) + DEX (+2) — effective 15 with Mage Armor",
    speed: "30 ft.",
    proficiencyBonus: 3,
    spellAttackBonus: 7,
    spellSaveDC: 15,
    backstory: "A scholar from a grand elven library.",
    abilityScores: { str: 8, dex: 14, con: 12, int: 18, wis: 10, cha: 10 },
    savingThrows: ["Intelligence", "Wisdom"],
    skills: ["Arcana", "History"],
    proficiencies: ["Daggers", "Darts", "Slings", "Quarterstaffs", "Light crossbows"],
    weapons: [
      { name: "Quarterstaff", damage: "1d6", damageType: "bludgeoning", properties: ["versatile"], attackBonus: 1, damageBonus: -1 },
    ],
    equipment: ["Component pouch", "Scholar's pack"],
    features: ["Arcane Recovery", "Evocation Savant", "Sculpt Spells"],
    spellSlots: [{ level: 1, slots: 4 }, { level: 2, slots: 3 }, { level: 3, slots: 2 }],
    spells: [{ name: "Fire Bolt", level: 0 }, { name: "Fireball", level: 3 }],
    traits: {
      personalityTraits: "Curious about everything",
      ideals: "Knowledge is the path to power",
      bonds: "My spellbook is my most treasured possession",
      flaws: "I overlook obvious solutions in favor of complicated ones",
    },
    ...overrides,
  } as Parameters<typeof rowToSavedCharacter>[0];
}

describe("rowToSavedCharacter", () => {
  it("maps all scalar fields from a DB row", () => {
    const row = makeRow();
    const result = rowToSavedCharacter(row);

    expect(result).toMatchObject({
      id: row.id,
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
    });
  });

  it("converts savedAt Date to a millisecond timestamp", () => {
    const date = new Date("2025-06-15T12:00:00Z");
    const result = rowToSavedCharacter(makeRow({ savedAt: date }));
    expect(result.savedAt).toBe(date.getTime());
  });

  it("casts JSONB fields to their typed shapes", () => {
    const row = makeRow();
    const result = rowToSavedCharacter(row);

    expect(result.abilityScores).toEqual(row.abilityScores);
    expect(result.savingThrows).toEqual(row.savingThrows);
    expect(result.skills).toEqual(row.skills);
    expect(result.proficiencies).toEqual(row.proficiencies);
    expect(result.weapons).toEqual(row.weapons);
    expect(result.equipment).toEqual(row.equipment);
    expect(result.features).toEqual(row.features);
    expect(result.spellSlots).toEqual(row.spellSlots);
    expect(result.spells).toEqual(row.spells);
    expect(result.traits).toEqual(row.traits);
  });

  it("handles null nullable fields", () => {
    const row = makeRow({
      raceVariant: null,
      spellAttackBonus: null,
      spellSaveDC: null,
      weapons: null,
      spellSlots: null,
      spells: null,
    });
    const result = rowToSavedCharacter(row);

    expect(result.raceVariant).toBeNull();
    expect(result.spellAttackBonus).toBeNull();
    expect(result.spellSaveDC).toBeNull();
    expect(result.weapons).toBeNull();
    expect(result.spellSlots).toBeNull();
    expect(result.spells).toBeNull();
  });

  it("returns an object with exactly the SavedCharacter keys", () => {
    const result = rowToSavedCharacter(makeRow());
    const keys = Object.keys(result).sort();
    const expected = [
      "abilityScores",
      "alignment",
      "armorClass",
      "armorClassBreakdown",
      "background",
      "backstory",
      "class",
      "equipment",
      "features",
      "hitPoints",
      "id",
      "level",
      "name",
      "proficiencies",
      "proficiencyBonus",
      "race",
      "raceVariant",
      "savedAt",
      "savingThrows",
      "skills",
      "speed",
      "spellAttackBonus",
      "spellSaveDC",
      "spellSlots",
      "spells",
      "subclass",
      "traits",
      "weapons",
    ];
    expect(keys).toEqual(expected);
  });
});
