import { describe, it, expect } from "vitest";
import { characters } from "../db/schema";
import { getTableColumns } from "drizzle-orm";

describe("characters table schema", () => {
  const columns = getTableColumns(characters);

  it("has all expected scalar columns", () => {
    const expected = [
      "id",
      "savedAt",
      "name",
      "race",
      "raceVariant",
      "class",
      "subclass",
      "level",
      "background",
      "alignment",
      "hitPoints",
      "armorClass",
      "armorClassBreakdown",
      "speed",
      "proficiencyBonus",
      "spellAttackBonus",
      "spellSaveDC",
      "backstory",
    ];
    for (const col of expected) {
      expect(columns, `Missing column: ${col}`).toHaveProperty(col);
    }
  });

  it("has all expected JSONB columns", () => {
    const expected = [
      "abilityScores",
      "savingThrows",
      "skills",
      "proficiencies",
      "weapons",
      "equipment",
      "features",
      "spellSlots",
      "spells",
      "traits",
    ];
    for (const col of expected) {
      expect(columns, `Missing column: ${col}`).toHaveProperty(col);
    }
  });

  it("has UUID id column with a default value", () => {
    expect(columns.id.dataType).toBe("string");
    expect(columns.id.hasDefault).toBe(true);
    expect(columns.id.columnType).toBe("PgUUID");
  });

  it("has a timestamp savedAt column with default", () => {
    expect(columns.savedAt.hasDefault).toBe(true);
    expect(columns.savedAt.notNull).toBe(true);
  });

  it("marks nullable columns correctly", () => {
    expect(columns.raceVariant.notNull).toBe(false);
    expect(columns.spellAttackBonus.notNull).toBe(false);
    expect(columns.spellSaveDC.notNull).toBe(false);
    expect(columns.weapons.notNull).toBe(false);
    expect(columns.spellSlots.notNull).toBe(false);
    expect(columns.spells.notNull).toBe(false);
  });

  it("marks required columns as not-null", () => {
    const requiredCols = [
      "name",
      "race",
      "class",
      "subclass",
      "level",
      "background",
      "alignment",
      "hitPoints",
      "armorClass",
      "speed",
      "proficiencyBonus",
      "backstory",
      "abilityScores",
      "savingThrows",
      "skills",
      "proficiencies",
      "equipment",
      "features",
      "traits",
    ];
    for (const col of requiredCols) {
      expect(
        columns[col as keyof typeof columns].notNull,
        `${col} should be NOT NULL`
      ).toBe(true);
    }
  });

  it("has exactly 28 columns", () => {
    expect(Object.keys(columns)).toHaveLength(28);
  });
});
