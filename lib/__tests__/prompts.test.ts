import { describe, it, expect } from "vitest";
import { buildUserPrompt, SYSTEM_PROMPT } from "../prompts";

describe("SYSTEM_PROMPT", () => {
  it("references D&D 5E 2014", () => {
    expect(SYSTEM_PROMPT).toContain("5E (2014)");
  });

  it("references all included sourcebooks", () => {
    const abbreviations = ["PHB", "DMG", "XGtE", "TCoE", "MotM", "SCAG", "EEPC", "Fizban's", "Curse of Strahd"];
    for (const abbr of abbreviations) {
      expect(SYSTEM_PROMPT).toContain(abbr);
    }
  });

  it("includes weapon formatting instructions", () => {
    expect(SYSTEM_PROMPT).toContain("weapons array");
    expect(SYSTEM_PROMPT).toContain("damageType");
  });

  it("includes spellcasting instructions", () => {
    expect(SYSTEM_PROMPT).toContain("spellSlots");
    expect(SYSTEM_PROMPT).toContain("Pact Magic");
  });

  it("instructs plain English speed format", () => {
    expect(SYSTEM_PROMPT).toContain("speed");
    expect(SYSTEM_PROMPT).toContain("no flavor text");
  });
});

describe("buildUserPrompt", () => {
  it("returns random prompt when isRandom is true", () => {
    const result = buildUserPrompt({ isRandom: true });
    expect(result).toContain("completely random");
    expect(result).toContain("interesting and unique");
  });

  it("returns random prompt when no constraints are given", () => {
    const result = buildUserPrompt({});
    expect(result).toContain("completely random");
  });

  it("includes level when specified", () => {
    const result = buildUserPrompt({ level: 5 });
    expect(result).toContain("Level 5");
  });

  it("includes race when specified", () => {
    const result = buildUserPrompt({ race: "Elf" });
    expect(result).toContain("Race: Elf");
  });

  it("combines race and raceVariant", () => {
    const result = buildUserPrompt({ race: "Elf", raceVariant: "High Elf" });
    expect(result).toContain("Race: High Elf Elf");
  });

  it("ignores raceVariant without race", () => {
    const result = buildUserPrompt({ raceVariant: "High Elf", class: "Wizard" });
    expect(result).not.toContain("High Elf");
    expect(result).toContain("Class: Wizard");
  });

  it("includes class when specified", () => {
    const result = buildUserPrompt({ class: "Wizard" });
    expect(result).toContain("Class: Wizard");
  });

  it("includes subclass when specified", () => {
    const result = buildUserPrompt({ class: "Wizard", subclass: "School of Evocation" });
    expect(result).toContain("Subclass: School of Evocation");
  });

  it("includes background when specified", () => {
    const result = buildUserPrompt({ background: "Sage" });
    expect(result).toContain("Background: Sage");
  });

  it("includes all fields together", () => {
    const result = buildUserPrompt({
      race: "Dwarf",
      raceVariant: "Hill Dwarf",
      class: "Cleric",
      subclass: "Life Domain",
      level: 3,
      background: "Acolyte",
    });
    expect(result).toContain("Level 3");
    expect(result).toContain("Race: Hill Dwarf Dwarf");
    expect(result).toContain("Class: Cleric");
    expect(result).toContain("Subclass: Life Domain");
    expect(result).toContain("Background: Acolyte");
    expect(result).toContain("unspecified options");
  });

  it("appends fill-in instruction when at least one constraint exists", () => {
    const result = buildUserPrompt({ level: 10 });
    expect(result).toContain("For any unspecified options");
  });

  it("does not append fill-in instruction for random prompts", () => {
    const result = buildUserPrompt({ isRandom: true });
    expect(result).not.toContain("For any unspecified options");
  });

  it("uses newline-separated format", () => {
    const result = buildUserPrompt({ race: "Elf", class: "Ranger", level: 5 });
    const lines = result.split("\n");
    expect(lines.length).toBeGreaterThanOrEqual(4);
  });
});
