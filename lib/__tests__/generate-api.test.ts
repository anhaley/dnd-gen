import { describe, it, expect, vi, beforeEach } from "vitest";

const mockParse = vi.fn();

vi.mock("@/lib/openai", () => ({
  default: {
    chat: {
      completions: {
        parse: (...args: unknown[]) => mockParse(...args),
      },
    },
  },
}));

vi.mock("openai/helpers/zod", () => ({
  zodResponseFormat: vi.fn(() => ({ type: "json_schema" })),
}));

import { POST } from "@/app/api/generate/route";

function makeCompletionResult(parsed: Record<string, unknown> | null, refusal?: string) {
  return {
    choices: [
      {
        message: {
          parsed,
          refusal: refusal ?? null,
          content: parsed ? JSON.stringify(parsed) : null,
        },
      },
    ],
    usage: { prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 },
  };
}

function makeCharacterData(overrides: Record<string, unknown> = {}) {
  return {
    name: "Grog",
    race: "Half-Orc",
    raceVariant: null,
    class: "Barbarian",
    subclass: "Path of the Berserker",
    level: 5,
    background: "Outlander",
    alignment: "Chaotic Neutral",
    abilityScores: { str: 20, dex: 14, con: 16, int: 6, wis: 10, cha: 8 },
    hitPoints: 55,
    armorClass: 14,
    armorClassBreakdown: "Unarmored Defense (10 + DEX 2 + CON 3) = 15",
    speed: "30 ft.",
    proficiencyBonus: 3,
    savingThrows: ["Strength", "Constitution"],
    skills: ["Athletics", "Intimidation"],
    proficiencies: ["All armor", "Shields"],
    weapons: [
      { name: "Greataxe", damage: "1d12", damageType: "slashing", properties: ["heavy", "two-handed"] },
    ],
    equipment: ["Explorer's pack"],
    features: ["Rage", "Reckless Attack", "Extra Attack"],
    spellSlots: null,
    spells: null,
    traits: {
      personalityTraits: "I live for combat.",
      ideals: "Might makes right.",
      bonds: "My tribe.",
      flaws: "I'm not very bright.",
    },
    backstory: "Raised in a nomadic orc tribe.",
    ...overrides,
  };
}

function makePostRequest(body: Record<string, unknown> = {}) {
  return new Request("http://localhost/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ race: "Half-Orc", class: "Barbarian", level: 5, ...body }),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/generate", () => {
  it("returns an enriched character on success", async () => {
    mockParse.mockResolvedValue(makeCompletionResult(makeCharacterData()));

    const response = await POST(makePostRequest());
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      name: "Grog",
      race: "Half-Orc",
      class: "Barbarian",
      spellAttackBonus: null,
      spellSaveDC: null,
    });
  });

  it("adds computed weapon bonuses to the response", async () => {
    mockParse.mockResolvedValue(makeCompletionResult(makeCharacterData()));

    const response = await POST(makePostRequest());
    const data = await response.json();

    const greataxe = data.weapons.find((w: { name: string }) => w.name === "Greataxe");
    expect(greataxe).toBeDefined();
    expect(greataxe.attackBonus).toBeTypeOf("number");
    expect(greataxe.damageBonus).toBeTypeOf("number");
  });

  it("always includes unarmed strike in weapons", async () => {
    mockParse.mockResolvedValue(makeCompletionResult(makeCharacterData()));

    const response = await POST(makePostRequest());
    const data = await response.json();

    const unarmed = data.weapons.find((w: { name: string }) => w.name === "Unarmed Strike");
    expect(unarmed).toBeDefined();
  });

  describe("raceVariant sanitization", () => {
    it("converts raceVariant string 'null' to JSON null", async () => {
      mockParse.mockResolvedValue(
        makeCompletionResult(makeCharacterData({ raceVariant: "null" }))
      );

      const response = await POST(makePostRequest());
      const data = await response.json();

      expect(data.raceVariant).toBeNull();
    });

    it("preserves a real raceVariant value", async () => {
      mockParse.mockResolvedValue(
        makeCompletionResult(makeCharacterData({ race: "Elf", raceVariant: "High Elf" }))
      );

      const response = await POST(makePostRequest({ race: "Elf" }));
      const data = await response.json();

      expect(data.raceVariant).toBe("High Elf");
    });

    it("preserves actual null raceVariant", async () => {
      mockParse.mockResolvedValue(
        makeCompletionResult(makeCharacterData({ raceVariant: null }))
      );

      const response = await POST(makePostRequest());
      const data = await response.json();

      expect(data.raceVariant).toBeNull();
    });
  });

  it("returns 422 when model refuses", async () => {
    mockParse.mockResolvedValue(
      makeCompletionResult(null, "I cannot generate that content")
    );

    const response = await POST(makePostRequest());
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.error).toContain("Model refused");
  });

  it("returns 502 when model returns no parsed content", async () => {
    mockParse.mockResolvedValue({
      choices: [{ message: { parsed: null, refusal: null, content: null } }],
      usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    });

    const response = await POST(makePostRequest());
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toBe("No response from OpenAI");
  });

  it("returns 500 on unexpected error", async () => {
    mockParse.mockRejectedValue(new Error("Rate limit exceeded"));

    const response = await POST(makePostRequest());
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Rate limit exceeded");
  });
});
