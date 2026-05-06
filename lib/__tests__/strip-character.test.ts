import { describe, it, expect } from "vitest";
import { enrichCharacter } from "../combat";
import type { Character } from "../schemas";
import { CharacterSchema } from "../schemas";
import { stripEnrichment } from "../strip-character";

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    name: "Test Character",
    race: "Human",
    raceVariant: null,
    class: "Fighter",
    subclass: "Champion",
    level: 5,
    background: "Soldier",
    alignment: "Neutral Good",
    abilityScores: { str: 16, dex: 14, con: 14, int: 10, wis: 12, cha: 8 },
    hitPoints: 44,
    armorClass: 18,
    armorClassBreakdown: "Chain mail (16) + Shield (+2)",
    speed: "30 ft.",
    proficiencyBonus: 3,
    savingThrows: ["Strength", "Constitution"],
    skills: ["Athletics", "Intimidation"],
    proficiencies: ["All armor", "Shields", "Simple weapons", "Martial weapons"],
    weapons: [
      {
        name: "Longsword",
        damage: "1d8",
        damageType: "slashing",
        properties: ["versatile"],
      },
    ],
    equipment: [
      { name: "Chain mail", summary: "" },
      { name: "Shield", summary: "" },
    ],
    features: [
      { name: "Second Wind", summary: "" },
      { name: "Action Surge", summary: "" },
      { name: "Extra Attack", summary: "" },
    ],
    spellSlots: null,
    spells: null,
    traits: {
      personalityTraits: "Brave",
      ideals: "Honor",
      bonds: "My comrades",
      flaws: "Stubborn",
    },
    backstory: "A veteran soldier.",
    ...overrides,
  };
}

describe("stripEnrichment", () => {
  it("removes derived fields and maps weapons to base schema", () => {
    const base = makeCharacter();
    const enriched = enrichCharacter(base);
    expect(enriched.weapons?.[0]).toMatchObject({
      attackBonus: expect.any(Number),
      damageBonus: expect.any(Number),
    });

    const stripped = stripEnrichment(enriched);
    expect(stripped).not.toHaveProperty("spellAttackBonus");
    expect(stripped).not.toHaveProperty("spellSaveDC");
    expect(stripped.weapons?.find((w) => w.name === "Longsword")).toMatchObject(
      base.weapons![0]
    );
    expect(CharacterSchema.safeParse(stripped).success).toBe(true);
  });
});
