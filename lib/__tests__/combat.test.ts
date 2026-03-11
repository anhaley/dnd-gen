import { describe, it, expect } from "vitest";
import { enrichCharacter } from "../combat";
import type { Character } from "../schemas";

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
    weapons: null,
    equipment: ["Chain mail", "Shield"],
    features: ["Second Wind", "Action Surge", "Extra Attack"],
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

describe("enrichCharacter", () => {
  describe("unarmed strike", () => {
    it("appends unarmed strike when weapons is null", () => {
      const result = enrichCharacter(makeCharacter({ weapons: null }));
      expect(result.weapons).toHaveLength(1);
      expect(result.weapons![0].name).toBe("Unarmed Strike");
    });

    it("appends unarmed strike when weapons is empty", () => {
      const result = enrichCharacter(makeCharacter({ weapons: [] }));
      expect(result.weapons).toHaveLength(1);
      expect(result.weapons![0].name).toBe("Unarmed Strike");
    });

    it("appends unarmed strike alongside existing weapons", () => {
      const char = makeCharacter({
        weapons: [
          { name: "Longsword", damage: "1d8", damageType: "slashing", properties: ["versatile"] },
        ],
      });
      const result = enrichCharacter(char);
      expect(result.weapons).toHaveLength(2);
      expect(result.weapons!.map((w) => w.name)).toContain("Unarmed Strike");
    });

    it("does not duplicate if model already included unarmed strike", () => {
      const char = makeCharacter({
        weapons: [
          { name: "Unarmed Strike", damage: "1", damageType: "bludgeoning", properties: [] },
        ],
      });
      const result = enrichCharacter(char);
      const unarmedCount = result.weapons!.filter(
        (w) => w.name.toLowerCase() === "unarmed strike"
      ).length;
      expect(unarmedCount).toBe(1);
    });

    it("uses STR for non-monk unarmed strike", () => {
      const char = makeCharacter({
        abilityScores: { str: 16, dex: 20, con: 10, int: 10, wis: 10, cha: 10 },
        proficiencyBonus: 2,
      });
      const result = enrichCharacter(char);
      const unarmed = result.weapons!.find((w) => w.name === "Unarmed Strike")!;
      // STR mod = +3, prof = 2
      expect(unarmed.attackBonus).toBe(5);
      expect(unarmed.damageBonus).toBe(3);
      expect(unarmed.damage).toBe("1");
      expect(unarmed.properties).toEqual([]);
    });
  });

  describe("monk unarmed strike", () => {
    it("uses best of STR/DEX for monk", () => {
      const char = makeCharacter({
        class: "Monk",
        subclass: "Way of the Open Hand",
        level: 1,
        abilityScores: { str: 10, dex: 18, con: 14, int: 10, wis: 16, cha: 8 },
        proficiencyBonus: 2,
      });
      const result = enrichCharacter(char);
      const unarmed = result.weapons!.find((w) => w.name === "Unarmed Strike")!;
      // DEX mod = +4 (higher than STR +0), prof = 2
      expect(unarmed.attackBonus).toBe(6);
      expect(unarmed.damageBonus).toBe(4);
      expect(unarmed.properties).toEqual(["Martial Arts"]);
    });

    it("scales martial arts die at level 1-4", () => {
      const char = makeCharacter({ class: "Monk", level: 4 });
      const result = enrichCharacter(char);
      const unarmed = result.weapons!.find((w) => w.name === "Unarmed Strike")!;
      expect(unarmed.damage).toBe("1d4");
    });

    it("scales martial arts die at level 5-10", () => {
      const char = makeCharacter({ class: "Monk", level: 7 });
      const result = enrichCharacter(char);
      const unarmed = result.weapons!.find((w) => w.name === "Unarmed Strike")!;
      expect(unarmed.damage).toBe("1d6");
    });

    it("scales martial arts die at level 11-16", () => {
      const char = makeCharacter({ class: "Monk", level: 14 });
      const result = enrichCharacter(char);
      const unarmed = result.weapons!.find((w) => w.name === "Unarmed Strike")!;
      expect(unarmed.damage).toBe("1d8");
    });

    it("scales martial arts die at level 17-20", () => {
      const char = makeCharacter({ class: "Monk", level: 20 });
      const result = enrichCharacter(char);
      const unarmed = result.weapons!.find((w) => w.name === "Unarmed Strike")!;
      expect(unarmed.damage).toBe("1d10");
    });
  });

  describe("weapon enrichment", () => {
    it("computes melee weapon bonus from STR", () => {
      const char = makeCharacter({
        abilityScores: { str: 16, dex: 12, con: 14, int: 10, wis: 10, cha: 10 },
        proficiencyBonus: 2,
        weapons: [
          { name: "Longsword", damage: "1d8", damageType: "slashing", properties: ["versatile"] },
        ],
      });
      const result = enrichCharacter(char);
      const sword = result.weapons!.find((w) => w.name === "Longsword")!;
      // STR mod +3, prof 2
      expect(sword.attackBonus).toBe(5);
      expect(sword.damageBonus).toBe(3);
    });

    it("computes ranged weapon bonus from DEX", () => {
      const char = makeCharacter({
        abilityScores: { str: 10, dex: 18, con: 14, int: 10, wis: 10, cha: 10 },
        proficiencyBonus: 3,
        weapons: [
          { name: "Longbow", damage: "1d8", damageType: "piercing", properties: ["ammunition", "heavy", "range", "two-handed"] },
        ],
      });
      const result = enrichCharacter(char);
      const bow = result.weapons!.find((w) => w.name === "Longbow")!;
      // DEX mod +4, prof 3
      expect(bow.attackBonus).toBe(7);
      expect(bow.damageBonus).toBe(4);
    });

    it("computes finesse weapon bonus from best of STR/DEX", () => {
      const char = makeCharacter({
        abilityScores: { str: 10, dex: 18, con: 14, int: 10, wis: 10, cha: 10 },
        proficiencyBonus: 2,
        weapons: [
          { name: "Rapier", damage: "1d8", damageType: "piercing", properties: ["finesse"] },
        ],
      });
      const result = enrichCharacter(char);
      const rapier = result.weapons!.find((w) => w.name === "Rapier")!;
      // DEX mod +4 > STR +0, prof 2
      expect(rapier.attackBonus).toBe(6);
      expect(rapier.damageBonus).toBe(4);
    });

    it("uses STR for finesse when STR is higher", () => {
      const char = makeCharacter({
        abilityScores: { str: 20, dex: 14, con: 14, int: 10, wis: 10, cha: 10 },
        proficiencyBonus: 2,
        weapons: [
          { name: "Shortsword", damage: "1d6", damageType: "piercing", properties: ["finesse", "light"] },
        ],
      });
      const result = enrichCharacter(char);
      const sword = result.weapons!.find((w) => w.name === "Shortsword")!;
      // STR mod +5 > DEX +2, prof 2
      expect(sword.attackBonus).toBe(7);
      expect(sword.damageBonus).toBe(5);
    });

    it("identifies ranged weapons by name when no ammunition property", () => {
      const char = makeCharacter({
        abilityScores: { str: 10, dex: 16, con: 14, int: 10, wis: 10, cha: 10 },
        proficiencyBonus: 2,
        weapons: [
          { name: "Dart", damage: "1d4", damageType: "piercing", properties: ["thrown"] },
        ],
      });
      const result = enrichCharacter(char);
      const dart = result.weapons!.find((w) => w.name === "Dart")!;
      // DEX mod +3, prof 2
      expect(dart.attackBonus).toBe(5);
      expect(dart.damageBonus).toBe(3);
    });

    it("preserves weapon properties in enriched output", () => {
      const props = ["finesse", "light"];
      const char = makeCharacter({
        weapons: [
          { name: "Dagger", damage: "1d4", damageType: "piercing", properties: props },
        ],
      });
      const result = enrichCharacter(char);
      const dagger = result.weapons!.find((w) => w.name === "Dagger")!;
      expect(dagger.properties).toEqual(props);
      expect(dagger.damageType).toBe("piercing");
      expect(dagger.damage).toBe("1d4");
    });
  });

  describe("spellcasting", () => {
    it("computes spell attack and save DC for full casters", () => {
      const char = makeCharacter({
        class: "Wizard",
        subclass: "School of Evocation",
        abilityScores: { str: 8, dex: 14, con: 12, int: 18, wis: 10, cha: 10 },
        proficiencyBonus: 3,
        spells: [
          { name: "Fire Bolt", level: 0 },
          { name: "Fireball", level: 3 },
        ],
        spellSlots: [{ level: 3, slots: 2 }],
      });
      const result = enrichCharacter(char);
      // INT mod +4, prof 3
      expect(result.spellAttackBonus).toBe(7);
      expect(result.spellSaveDC).toBe(15);
    });

    it("uses WIS for clerics", () => {
      const char = makeCharacter({
        class: "Cleric",
        subclass: "Life Domain",
        abilityScores: { str: 14, dex: 10, con: 14, int: 10, wis: 16, cha: 12 },
        proficiencyBonus: 2,
        spells: [{ name: "Cure Wounds", level: 1 }],
        spellSlots: [{ level: 1, slots: 2 }],
      });
      const result = enrichCharacter(char);
      // WIS mod +3, prof 2
      expect(result.spellAttackBonus).toBe(5);
      expect(result.spellSaveDC).toBe(13);
    });

    it("uses CHA for warlocks", () => {
      const char = makeCharacter({
        class: "Warlock",
        subclass: "The Fiend",
        abilityScores: { str: 8, dex: 14, con: 12, int: 10, wis: 10, cha: 20 },
        proficiencyBonus: 4,
        spells: [{ name: "Eldritch Blast", level: 0 }],
        spellSlots: [{ level: 5, slots: 3 }],
      });
      const result = enrichCharacter(char);
      // CHA mod +5, prof 4
      expect(result.spellAttackBonus).toBe(9);
      expect(result.spellSaveDC).toBe(17);
    });

    it("uses INT for Eldritch Knight subclass", () => {
      const char = makeCharacter({
        class: "Fighter",
        subclass: "Eldritch Knight",
        abilityScores: { str: 16, dex: 10, con: 14, int: 14, wis: 10, cha: 8 },
        proficiencyBonus: 3,
        spells: [{ name: "Shield", level: 1 }],
        spellSlots: [{ level: 1, slots: 2 }],
      });
      const result = enrichCharacter(char);
      // INT mod +2, prof 3
      expect(result.spellAttackBonus).toBe(5);
      expect(result.spellSaveDC).toBe(13);
    });

    it("uses INT for Arcane Trickster subclass", () => {
      const char = makeCharacter({
        class: "Rogue",
        subclass: "Arcane Trickster",
        abilityScores: { str: 8, dex: 18, con: 12, int: 14, wis: 10, cha: 10 },
        proficiencyBonus: 3,
        spells: [{ name: "Mage Hand", level: 0 }],
        spellSlots: [{ level: 1, slots: 2 }],
      });
      const result = enrichCharacter(char);
      // INT mod +2, prof 3
      expect(result.spellAttackBonus).toBe(5);
      expect(result.spellSaveDC).toBe(13);
    });

    it("returns null for non-caster classes", () => {
      const char = makeCharacter({
        class: "Fighter",
        subclass: "Champion",
        spells: null,
        spellSlots: null,
      });
      const result = enrichCharacter(char);
      expect(result.spellAttackBonus).toBeNull();
      expect(result.spellSaveDC).toBeNull();
    });

    it("returns null when caster class has empty spells array", () => {
      const char = makeCharacter({
        class: "Wizard",
        subclass: "School of Evocation",
        spells: [],
        spellSlots: null,
      });
      const result = enrichCharacter(char);
      expect(result.spellAttackBonus).toBeNull();
      expect(result.spellSaveDC).toBeNull();
    });
  });

  describe("passthrough fields", () => {
    it("preserves all original character fields", () => {
      const char = makeCharacter();
      const result = enrichCharacter(char);
      const { weapons: _w, ...originalWithoutWeapons } = char;
      expect(result).toMatchObject(originalWithoutWeapons);
    });
  });
});
