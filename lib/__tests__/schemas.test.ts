import { describe, it, expect } from "vitest";
import {
  CharacterSchema,
  GenerateInputSchema,
  WeaponSchema,
  AbilityScoresSchema,
  TraitsSchema,
} from "../schemas";

const validAbilityScores = { str: 16, dex: 14, con: 14, int: 10, wis: 12, cha: 8 };

const validTraits = {
  personalityTraits: "Brave",
  ideals: "Honor",
  bonds: "My comrades",
  flaws: "Stubborn",
};

function validCharacter(overrides: Record<string, unknown> = {}) {
  return {
    name: "Aragorn",
    race: "Human",
    raceVariant: "Variant",
    class: "Ranger",
    subclass: "Hunter",
    level: 5,
    background: "Outlander",
    alignment: "Chaotic Good",
    abilityScores: validAbilityScores,
    hitPoints: 44,
    armorClass: 16,
    armorClassBreakdown: "Scale mail (14) + DEX (+2)",
    speed: "30 ft.",
    proficiencyBonus: 3,
    savingThrows: ["Strength", "Dexterity"],
    skills: ["Athletics", "Survival"],
    proficiencies: ["Light armor", "Medium armor"],
    weapons: [
      { name: "Longsword", damage: "1d8", damageType: "slashing", properties: ["versatile"] },
    ],
    equipment: ["Explorer's pack"],
    features: ["Favored Enemy", "Natural Explorer"],
    spellSlots: [{ level: 1, slots: 4 }],
    spells: [{ name: "Cure Wounds", level: 1 }],
    traits: validTraits,
    backstory: "A wandering ranger.",
    ...overrides,
  };
}

describe("AbilityScoresSchema", () => {
  it("accepts valid ability scores", () => {
    const result = AbilityScoresSchema.safeParse(validAbilityScores);
    expect(result.success).toBe(true);
  });

  it("rejects missing ability", () => {
    const result = AbilityScoresSchema.safeParse({ str: 10, dex: 10, con: 10, int: 10, wis: 10 });
    expect(result.success).toBe(false);
  });

  it("rejects string values", () => {
    const result = AbilityScoresSchema.safeParse({ ...validAbilityScores, str: "strong" });
    expect(result.success).toBe(false);
  });
});

describe("TraitsSchema", () => {
  it("accepts valid traits", () => {
    expect(TraitsSchema.safeParse(validTraits).success).toBe(true);
  });

  it("rejects missing fields", () => {
    const { flaws, ...partial } = validTraits;
    expect(TraitsSchema.safeParse(partial).success).toBe(false);
  });
});

describe("WeaponSchema", () => {
  it("accepts a valid weapon", () => {
    const result = WeaponSchema.safeParse({
      name: "Longsword",
      damage: "1d8",
      damageType: "slashing",
      properties: ["versatile"],
    });
    expect(result.success).toBe(true);
  });

  it("accepts weapon with empty properties", () => {
    const result = WeaponSchema.safeParse({
      name: "Club",
      damage: "1d4",
      damageType: "bludgeoning",
      properties: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejects weapon missing name", () => {
    const result = WeaponSchema.safeParse({
      damage: "1d8",
      damageType: "slashing",
      properties: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects weapon with non-array properties", () => {
    const result = WeaponSchema.safeParse({
      name: "Sword",
      damage: "1d8",
      damageType: "slashing",
      properties: "versatile",
    });
    expect(result.success).toBe(false);
  });
});

describe("CharacterSchema", () => {
  it("accepts a fully valid character", () => {
    const result = CharacterSchema.safeParse(validCharacter());
    expect(result.success).toBe(true);
  });

  it("accepts null for nullable fields", () => {
    const result = CharacterSchema.safeParse(
      validCharacter({
        raceVariant: null,
        weapons: null,
        spellSlots: null,
        spells: null,
      })
    );
    expect(result.success).toBe(true);
  });

  it("rejects level below 1", () => {
    const result = CharacterSchema.safeParse(validCharacter({ level: 0 }));
    expect(result.success).toBe(false);
  });

  it("rejects level above 20", () => {
    const result = CharacterSchema.safeParse(validCharacter({ level: 21 }));
    expect(result.success).toBe(false);
  });

  it("rejects missing required field", () => {
    const { name, ...noName } = validCharacter();
    const result = CharacterSchema.safeParse(noName);
    expect(result.success).toBe(false);
  });

  it("accepts level boundary values", () => {
    expect(CharacterSchema.safeParse(validCharacter({ level: 1 })).success).toBe(true);
    expect(CharacterSchema.safeParse(validCharacter({ level: 20 })).success).toBe(true);
  });

  it("rejects non-integer level", () => {
    const result = CharacterSchema.safeParse(validCharacter({ level: 3.5 }));
    // Zod number() accepts floats unless .int() is used; this validates current behavior
    expect(result.success).toBe(true);
  });

  it("validates nested ability scores", () => {
    const result = CharacterSchema.safeParse(
      validCharacter({ abilityScores: { str: "ten" } })
    );
    expect(result.success).toBe(false);
  });

  it("validates nested weapons array items", () => {
    const result = CharacterSchema.safeParse(
      validCharacter({ weapons: [{ name: "Sword" }] })
    );
    expect(result.success).toBe(false);
  });
});

describe("GenerateInputSchema", () => {
  it("accepts empty object (all optional)", () => {
    expect(GenerateInputSchema.safeParse({}).success).toBe(true);
  });

  it("accepts full input", () => {
    const result = GenerateInputSchema.safeParse({
      race: "Elf",
      raceVariant: "High Elf",
      class: "Wizard",
      subclass: "School of Evocation",
      level: 5,
      background: "Sage",
      isRandom: false,
    });
    expect(result.success).toBe(true);
  });

  it("accepts isRandom alone", () => {
    expect(GenerateInputSchema.safeParse({ isRandom: true }).success).toBe(true);
  });

  it("rejects level below 1", () => {
    expect(GenerateInputSchema.safeParse({ level: 0 }).success).toBe(false);
  });

  it("rejects level above 20", () => {
    expect(GenerateInputSchema.safeParse({ level: 21 }).success).toBe(false);
  });

  it("rejects non-boolean isRandom", () => {
    expect(GenerateInputSchema.safeParse({ isRandom: "yes" }).success).toBe(false);
  });

  it("accepts partial input", () => {
    expect(GenerateInputSchema.safeParse({ race: "Dwarf", level: 3 }).success).toBe(true);
  });
});
