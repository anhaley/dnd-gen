import { describe, it, expect, vi, beforeEach } from "vitest";
import { PDFDocument } from "pdf-lib";
import { fillCharacterSheet } from "@/lib/pdf";
import { enrichCharacter } from "@/lib/combat";
import type { Character, EnrichedCharacter } from "@/lib/schemas";

vi.mock("@/lib/dnd-data", async () => {
  const actual = await vi.importActual<typeof import("@/lib/dnd-data")>(
    "@/lib/dnd-data"
  );
  return actual;
});

function makeCharacter(
  overrides: Partial<EnrichedCharacter> = {}
): EnrichedCharacter {
  return {
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
    armorClassBreakdown: "12 (no armor)",
    speed: "30 ft.",
    proficiencyBonus: 3,
    spellAttackBonus: 7,
    spellSaveDC: 15,
    backstory: "A scholar seeking forbidden knowledge.",
    abilityScores: { str: 8, dex: 14, con: 12, int: 18, wis: 10, cha: 10 },
    savingThrows: ["Intelligence", "Wisdom"],
    skills: ["Arcana", "History"],
    proficiencies: ["Daggers", "Quarterstaves", "Light crossbows"],
    weapons: [
      {
        name: "Dagger",
        damage: "1d4",
        damageType: "piercing",
        properties: ["finesse", "light", "thrown"],
        attackBonus: 5,
        damageBonus: 2,
      },
      {
        name: "Unarmed Strike",
        damage: "1",
        damageType: "bludgeoning",
        properties: [],
        attackBonus: 2,
        damageBonus: -1,
      },
    ],
    equipment: ["Scholar's pack", "Spellbook", "Component pouch"],
    features: ["Arcane Recovery", "Sculpt Spells"],
    spellSlots: [
      { level: 1, slots: 4 },
      { level: 2, slots: 3 },
      { level: 3, slots: 2 },
    ],
    spells: [
      { name: "Fire Bolt", level: 0 },
      { name: "Mage Hand", level: 0 },
      { name: "Shield", level: 1 },
      { name: "Magic Missile", level: 1 },
      { name: "Misty Step", level: 2 },
      { name: "Fireball", level: 3 },
    ],
    traits: {
      personalityTraits: "Curious about everything.",
      ideals: "Knowledge is power.",
      bonds: "My spellbook is my life.",
      flaws: "I overthink every decision.",
    },
    ...overrides,
  };
}

async function getFormFieldValue(pdfBytes: Uint8Array, fieldName: string) {
  const pdf = await PDFDocument.load(pdfBytes);
  const form = pdf.getForm();
  try {
    const field = form.getTextField(fieldName);
    return field.getText();
  } catch {
    return undefined;
  }
}

async function isCheckBoxChecked(pdfBytes: Uint8Array, fieldName: string) {
  const pdf = await PDFDocument.load(pdfBytes);
  const form = pdf.getForm();
  try {
    const field = form.getCheckBox(fieldName);
    return field.isChecked();
  } catch {
    return undefined;
  }
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("fillCharacterSheet", () => {
  it("returns valid PDF bytes", async () => {
    const bytes = await fillCharacterSheet(makeCharacter());

    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBeGreaterThan(0);

    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBeGreaterThanOrEqual(1);
  });

  it("fills core identity fields", async () => {
    const bytes = await fillCharacterSheet(makeCharacter());

    expect(await getFormFieldValue(bytes, "CharacterName")).toBe("Thalindra");
    expect(await getFormFieldValue(bytes, "CharacterName 2")).toBe("Thalindra");
    expect(await getFormFieldValue(bytes, "ClassLevel")).toBe(
      "Wizard (School of Evocation) 5"
    );
    expect(await getFormFieldValue(bytes, "Background")).toBe("Sage");
    expect(await getFormFieldValue(bytes, "Race ")).toBe("High Elf Elf");
    expect(await getFormFieldValue(bytes, "Alignment")).toBe("Neutral Good");
  });

  it("fills ability scores and modifiers", async () => {
    const bytes = await fillCharacterSheet(makeCharacter());

    expect(await getFormFieldValue(bytes, "STR")).toBe("8");
    expect(await getFormFieldValue(bytes, "STRmod")).toBe("-1");
    expect(await getFormFieldValue(bytes, "DEX")).toBe("14");
    expect(await getFormFieldValue(bytes, "DEXmod ")).toBe("+2");
    expect(await getFormFieldValue(bytes, "INT")).toBe("18");
    expect(await getFormFieldValue(bytes, "INTmod")).toBe("+4");
    expect(await getFormFieldValue(bytes, "CHA")).toBe("10");
    expect(await getFormFieldValue(bytes, "CHamod")).toBe("+0");
  });

  it("fills combat stats", async () => {
    const bytes = await fillCharacterSheet(makeCharacter());

    expect(await getFormFieldValue(bytes, "AC")).toBe("12");
    expect(await getFormFieldValue(bytes, "Speed")).toBe("30 ft.");
    expect(await getFormFieldValue(bytes, "HPMax")).toBe("32");
    expect(await getFormFieldValue(bytes, "HPCurrent")).toBe("32");
    expect(await getFormFieldValue(bytes, "Initiative")).toBe("+2");
    expect(await getFormFieldValue(bytes, "ProfBonus")).toBe("+3");
  });

  it("fills hit dice", async () => {
    const bytes = await fillCharacterSheet(makeCharacter());

    expect(await getFormFieldValue(bytes, "HDTotal")).toBe("5");
    expect(await getFormFieldValue(bytes, "HD")).toBe("5d6");
  });

  it("fills saving throws with proficiency checkboxes", async () => {
    const bytes = await fillCharacterSheet(makeCharacter());

    // INT save: +4 mod + 3 prof = +7
    expect(await getFormFieldValue(bytes, "ST Intelligence")).toBe("+7");
    expect(await isCheckBoxChecked(bytes, "Check Box 20")).toBe(true);

    // WIS save: +0 mod + 3 prof = +3
    expect(await getFormFieldValue(bytes, "ST Wisdom")).toBe("+3");
    expect(await isCheckBoxChecked(bytes, "Check Box 21")).toBe(true);

    // STR save (not proficient): -1 mod
    expect(await getFormFieldValue(bytes, "ST Strength")).toBe("-1");
    expect(await isCheckBoxChecked(bytes, "Check Box 11")).toBe(false);
  });

  it("fills skills with proficiency checkboxes", async () => {
    const bytes = await fillCharacterSheet(makeCharacter());

    // Arcana (INT, proficient): +4 mod + 3 prof = +7
    expect(await getFormFieldValue(bytes, "Arcana")).toBe("+7");
    expect(await isCheckBoxChecked(bytes, "Check Box 25")).toBe(true);

    // History (INT, proficient): +4 mod + 3 prof = +7
    expect(await getFormFieldValue(bytes, "History ")).toBe("+7");
    expect(await isCheckBoxChecked(bytes, "Check Box 28")).toBe(true);

    // Athletics (STR, not proficient): -1
    expect(await getFormFieldValue(bytes, "Athletics")).toBe("-1");
    expect(await isCheckBoxChecked(bytes, "Check Box 26")).toBe(false);
  });

  it("fills passive perception", async () => {
    const bytes = await fillCharacterSheet(makeCharacter());

    // WIS +0, not proficient in Perception -> 10 + 0 = 10
    expect(await getFormFieldValue(bytes, "Passive")).toBe("10");
  });

  it("fills weapons (up to 3 slots)", async () => {
    const bytes = await fillCharacterSheet(makeCharacter());

    expect(await getFormFieldValue(bytes, "Wpn Name")).toBe("Dagger");
    expect(await getFormFieldValue(bytes, "Wpn1 AtkBonus")).toBe("+5");
    expect(await getFormFieldValue(bytes, "Wpn1 Damage")).toBe(
      "1d4+2 piercing"
    );

    expect(await getFormFieldValue(bytes, "Wpn Name 2")).toBe("Unarmed Strike");
    expect(await getFormFieldValue(bytes, "Wpn2 AtkBonus ")).toBe("+2");
  });

  it("fills personality traits and backstory", async () => {
    const bytes = await fillCharacterSheet(makeCharacter());

    expect(await getFormFieldValue(bytes, "PersonalityTraits ")).toBe(
      "Curious about everything."
    );
    expect(await getFormFieldValue(bytes, "Ideals")).toBe(
      "Knowledge is power."
    );
    expect(await getFormFieldValue(bytes, "Bonds")).toBe(
      "My spellbook is my life."
    );
    expect(await getFormFieldValue(bytes, "Flaws")).toBe(
      "I overthink every decision."
    );
    expect(await getFormFieldValue(bytes, "Backstory")).toBe(
      "A scholar seeking forbidden knowledge."
    );
  });

  it("fills spellcasting section", async () => {
    const bytes = await fillCharacterSheet(makeCharacter());

    expect(await getFormFieldValue(bytes, "Spellcasting Class 2")).toBe(
      "Wizard"
    );
    expect(await getFormFieldValue(bytes, "SpellcastingAbility 2")).toBe(
      "Intelligence"
    );
    expect(await getFormFieldValue(bytes, "SpellSaveDC  2")).toBe("15");
    expect(await getFormFieldValue(bytes, "SpellAtkBonus 2")).toBe("+7");

    // Slot totals
    expect(await getFormFieldValue(bytes, "SlotsTotal 19")).toBe("4");
    expect(await getFormFieldValue(bytes, "SlotsTotal 20")).toBe("3");
    expect(await getFormFieldValue(bytes, "SlotsTotal 21")).toBe("2");

    // Cantrips (visual order: 1014, 1016, 1017, ...)
    expect(await getFormFieldValue(bytes, "Spells 1014")).toBe("Fire Bolt");
    expect(await getFormFieldValue(bytes, "Spells 1016")).toBe("Mage Hand");

    // Level 1 (visual order: 1015, 1023, 1024, ...)
    expect(await getFormFieldValue(bytes, "Spells 1015")).toBe("Shield");
    expect(await getFormFieldValue(bytes, "Spells 1023")).toBe("Magic Missile");

    // Level 2 (visual order: 1046, 1034, 1035, ...)
    expect(await getFormFieldValue(bytes, "Spells 1046")).toBe("Misty Step");

    // Level 3 (visual order: 1048, 1047, 1049, ...)
    expect(await getFormFieldValue(bytes, "Spells 1048")).toBe("Fireball");
  });

  it("handles characters with no spells or weapons", async () => {
    const bytes = await fillCharacterSheet(
      makeCharacter({
        class: "Fighter",
        subclass: "Champion",
        weapons: null,
        spells: null,
        spellSlots: null,
        spellAttackBonus: null,
        spellSaveDC: null,
      })
    );

    expect(bytes).toBeInstanceOf(Uint8Array);

    expect(await getFormFieldValue(bytes, "Spellcasting Class 2")).toBeFalsy();
    expect(await getFormFieldValue(bytes, "Wpn Name")).toBeFalsy();

    expect(await getFormFieldValue(bytes, "HD")).toBe("5d10");
  });

  it("fills race without variant when raceVariant is null", async () => {
    const bytes = await fillCharacterSheet(
      makeCharacter({ raceVariant: null })
    );

    expect(await getFormFieldValue(bytes, "Race ")).toBe("Elf");
  });

  it('fills race without variant when raceVariant is the string "null"', async () => {
    const bytes = await fillCharacterSheet(
      makeCharacter({ raceVariant: "null" as unknown as null })
    );

    expect(await getFormFieldValue(bytes, "Race ")).toBe("Elf");
  });

  it("calculates passive perception with Perception proficiency", async () => {
    const bytes = await fillCharacterSheet(
      makeCharacter({
        skills: ["Arcana", "History", "Perception"],
        abilityScores: { str: 8, dex: 14, con: 12, int: 18, wis: 14, cha: 10 },
        proficiencyBonus: 3,
      })
    );

    // WIS mod +2, proficiency +3 → 10 + 2 + 3 = 15
    expect(await getFormFieldValue(bytes, "Passive")).toBe("15");
  });

  it("fills features and equipment", async () => {
    const bytes = await fillCharacterSheet(makeCharacter());

    expect(await getFormFieldValue(bytes, "Features and Traits")).toBe(
      "Arcane Recovery\nSculpt Spells"
    );
    expect(await getFormFieldValue(bytes, "Equipment")).toBe(
      "Scholar's pack, Spellbook, Component pouch"
    );
    expect(await getFormFieldValue(bytes, "ProficienciesLang")).toBe(
      "Daggers, Quarterstaves, Light crossbows"
    );
  });

  it("fills AC, Initiative, and ProficienciesLang with explicit font sizes", async () => {
    const bytes = await fillCharacterSheet(
      makeCharacter({
        armorClass: 18,
        proficiencies: [
          "Light armor",
          "Medium armor",
          "Shields",
          "Simple weapons",
          "Martial weapons",
          "Smith's tools",
          "Common",
          "Dwarvish",
        ],
      })
    );

    expect(await getFormFieldValue(bytes, "AC")).toBe("18");
    expect(await getFormFieldValue(bytes, "Initiative")).toBe("+2");
    expect(await getFormFieldValue(bytes, "ProficienciesLang")).toBe(
      "Light armor, Medium armor, Shields, Simple weapons, Martial weapons, Smith's tools, Common, Dwarvish"
    );
  });

  it("normalizes lowercase saves/skills through enrichCharacter pipeline", async () => {
    const raw: Character = {
      name: "Lowcase Test",
      race: "Human",
      raceVariant: null,
      class: "Wizard",
      subclass: "School of Evocation",
      level: 3,
      background: "Sage",
      alignment: "Neutral Good",
      hitPoints: 20,
      armorClass: 12,
      armorClassBreakdown: "12 (no armor)",
      speed: "30 ft.",
      proficiencyBonus: 2,
      savingThrows: ["int", "wis"],
      skills: ["arcana", "history"],
      proficiencies: ["Daggers"],
      weapons: [
        { name: "Dagger", damage: "1d4", damageType: "piercing", properties: ["finesse"] },
      ],
      equipment: ["Spellbook"],
      features: ["Arcane Recovery"],
      spellSlots: [{ level: 1, slots: 2 }],
      spells: [
        { name: "Fire Bolt", level: 0 },
        { name: "Shield", level: 1 },
      ],
      traits: {
        personalityTraits: "Curious.",
        ideals: "Knowledge.",
        bonds: "My spellbook.",
        flaws: "Overthinking.",
      },
      backstory: "A test wizard.",
      abilityScores: { str: 8, dex: 14, con: 12, int: 16, wis: 10, cha: 10 },
    };

    const enriched = enrichCharacter(raw);
    const bytes = await fillCharacterSheet(enriched);

    expect(await isCheckBoxChecked(bytes, "Check Box 20")).toBe(true);
    expect(await isCheckBoxChecked(bytes, "Check Box 21")).toBe(true);
    expect(await isCheckBoxChecked(bytes, "Check Box 11")).toBe(false);

    expect(await isCheckBoxChecked(bytes, "Check Box 25")).toBe(true);
    expect(await isCheckBoxChecked(bytes, "Check Box 28")).toBe(true);
    expect(await isCheckBoxChecked(bytes, "Check Box 26")).toBe(false);
  });
});
