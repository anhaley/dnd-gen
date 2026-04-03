import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/dnd-data", async () => {
  const actual = await vi.importActual<typeof import("@/lib/dnd-data")>("@/lib/dnd-data");
  return actual;
});

import { POST } from "@/app/api/recalculate/route";

function makeEnrichedBody(overrides: Record<string, unknown> = {}) {
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
    backstory: "A scholar.",
    abilityScores: { str: 8, dex: 14, con: 12, int: 18, wis: 10, cha: 10 },
    savingThrows: ["Intelligence", "Wisdom"],
    skills: ["Arcana", "History"],
    proficiencies: ["Daggers"],
    weapons: [
      {
        name: "Dagger",
        damage: "1d4",
        damageType: "piercing",
        properties: ["finesse", "light", "thrown"],
        attackBonus: 999,
        damageBonus: 999,
      },
    ],
    equipment: ["Scholar's pack"],
    features: ["Arcane Recovery"],
    spellSlots: [{ level: 1, slots: 4 }, { level: 3, slots: 2 }],
    spells: [
      { name: "Fire Bolt", level: 0 },
      { name: "Shield", level: 1 },
    ],
    traits: {
      personalityTraits: "Curious",
      ideals: "Knowledge",
      bonds: "Spellbook",
      flaws: "Overthinks",
    },
    ...overrides,
  };
}

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/recalculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/recalculate", () => {
  it("recalculates weapon bonuses from ability scores", async () => {
    const body = makeEnrichedBody();
    const response = await POST(makeRequest(body));
    const result = await response.json();

    expect(response.status).toBe(200);

    const dagger = result.weapons.find(
      (w: { name: string }) => w.name === "Dagger"
    );
    expect(dagger).toBeDefined();
    expect(dagger.attackBonus).not.toBe(999);
    expect(dagger.damageBonus).not.toBe(999);

    // Dagger is finesse: max(STR mod, DEX mod) + proficiency
    // STR 8 -> -1, DEX 14 -> +2, prof 3 -> attack = 5, damage = 2
    expect(dagger).toMatchObject({
      attackBonus: 5,
      damageBonus: 2,
    });
  });

  it("recalculates spell attack bonus and save DC", async () => {
    const body = makeEnrichedBody({
      spellAttackBonus: 0,
      spellSaveDC: 0,
    });

    const response = await POST(makeRequest(body));
    const result = await response.json();

    // Wizard uses INT: mod = +4, prof = 3 -> attack = 7, DC = 15
    expect(result).toMatchObject({
      spellAttackBonus: 7,
      spellSaveDC: 15,
    });
  });

  it("adds unarmed strike if missing", async () => {
    const body = makeEnrichedBody({ weapons: [] });

    const response = await POST(makeRequest(body));
    const result = await response.json();

    const unarmed = result.weapons.find(
      (w: { name: string }) => w.name === "Unarmed Strike"
    );
    expect(unarmed).toBeDefined();
  });

  it("preserves non-enriched fields unchanged", async () => {
    const body = makeEnrichedBody();
    const response = await POST(makeRequest(body));
    const result = await response.json();

    expect(result).toMatchObject({
      name: "Thalindra",
      race: "Elf",
      level: 5,
      hitPoints: 32,
      backstory: "A scholar.",
    });
  });

  it("handles characters with no weapons or spells", async () => {
    const body = makeEnrichedBody({
      weapons: null,
      spells: null,
      spellSlots: null,
      spellAttackBonus: null,
      spellSaveDC: null,
      class: "Fighter",
      subclass: "Champion",
    });

    const response = await POST(makeRequest(body));
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.spellAttackBonus).toBeNull();
    expect(result.spellSaveDC).toBeNull();
    // Should still get unarmed strike
    expect(result.weapons.length).toBeGreaterThanOrEqual(1);
  });
});
