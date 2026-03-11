// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { saveCharacter, getCharacters, getCharacter, deleteCharacter } from "../storage";
import type { EnrichedCharacter } from "../schemas";

function makeEnrichedCharacter(
  overrides: Partial<EnrichedCharacter> = {}
): EnrichedCharacter {
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
    proficiencies: ["All armor", "Shields"],
    weapons: null,
    equipment: ["Chain mail", "Shield"],
    features: ["Second Wind"],
    spellSlots: null,
    spells: null,
    traits: {
      personalityTraits: "Brave",
      ideals: "Honor",
      bonds: "My comrades",
      flaws: "Stubborn",
    },
    backstory: "A veteran soldier.",
    spellAttackBonus: null,
    spellSaveDC: null,
    ...overrides,
  };
}

vi.stubGlobal("crypto", {
  ...globalThis.crypto,
  randomUUID: vi.fn(() => "test-uuid-1234"),
});

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("saveCharacter", () => {
  it("returns a saved character with id and timestamp", () => {
    const char = makeEnrichedCharacter();
    const saved = saveCharacter(char);
    expect(saved.id).toBe("test-uuid-1234");
    expect(saved.savedAt).toBeTypeOf("number");
    expect(saved.name).toBe("Test Character");
  });

  it("persists to localStorage", () => {
    saveCharacter(makeEnrichedCharacter());
    const raw = localStorage.getItem("dnd-gen-characters");
    expect(raw).not.toBeNull();
    const stored = JSON.parse(raw!);
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe("Test Character");
  });

  it("prepends new characters to the list", () => {
    saveCharacter(makeEnrichedCharacter({ name: "First" }));
    saveCharacter(makeEnrichedCharacter({ name: "Second" }));
    const stored = JSON.parse(localStorage.getItem("dnd-gen-characters")!);
    expect(stored[0].name).toBe("Second");
    expect(stored[1].name).toBe("First");
  });
});

describe("getCharacters", () => {
  it("returns empty array when nothing saved", () => {
    expect(getCharacters()).toEqual([]);
  });

  it("returns saved characters", () => {
    saveCharacter(makeEnrichedCharacter({ name: "Hero" }));
    const chars = getCharacters();
    expect(chars).toHaveLength(1);
    expect(chars[0].name).toBe("Hero");
  });

  it("returns empty array for corrupted JSON", () => {
    localStorage.setItem("dnd-gen-characters", "not valid json{{{");
    expect(getCharacters()).toEqual([]);
  });
});

describe("getCharacter", () => {
  it("finds a character by id", () => {
    saveCharacter(makeEnrichedCharacter({ name: "FindMe" }));
    const found = getCharacter("test-uuid-1234");
    expect(found).toBeDefined();
    expect(found!.name).toBe("FindMe");
  });

  it("returns undefined for unknown id", () => {
    saveCharacter(makeEnrichedCharacter());
    expect(getCharacter("nonexistent")).toBeUndefined();
  });
});

describe("deleteCharacter", () => {
  it("removes a character by id", () => {
    saveCharacter(makeEnrichedCharacter());
    expect(getCharacters()).toHaveLength(1);
    deleteCharacter("test-uuid-1234");
    expect(getCharacters()).toHaveLength(0);
  });

  it("does nothing when id not found", () => {
    saveCharacter(makeEnrichedCharacter());
    deleteCharacter("nonexistent");
    expect(getCharacters()).toHaveLength(1);
  });

  it("updates localStorage after deletion", () => {
    saveCharacter(makeEnrichedCharacter());
    deleteCharacter("test-uuid-1234");
    const stored = JSON.parse(localStorage.getItem("dnd-gen-characters")!);
    expect(stored).toHaveLength(0);
  });
});
