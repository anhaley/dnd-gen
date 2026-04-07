import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/pdf", () => ({
  fillCharacterSheet: vi.fn(),
}));

import { POST } from "@/app/api/export/route";
import { fillCharacterSheet } from "@/lib/pdf";

const mockFillCharacterSheet = fillCharacterSheet as ReturnType<typeof vi.fn>;

function makeCharacterBody() {
  return {
    name: "Thalindra Moonwhisper",
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
    weapons: null,
    equipment: [{ name: "Scholar's pack", summary: "" }],
    features: [{ name: "Arcane Recovery", summary: "" }],
    spellSlots: [{ level: 1, slots: 4 }],
    spells: [{ name: "Fire Bolt", level: 0 }],
    traits: {
      personalityTraits: "Curious",
      ideals: "Knowledge",
      bonds: "Spellbook",
      flaws: "Overthinks",
    },
  };
}

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/export", () => {
  it("returns PDF bytes with correct content type", async () => {
    const fakePdf = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    mockFillCharacterSheet.mockResolvedValue(fakePdf);

    const response = await POST(makeRequest(makeCharacterBody()));

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
  });

  it("sets Content-Disposition with sanitized filename", async () => {
    const fakePdf = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    mockFillCharacterSheet.mockResolvedValue(fakePdf);

    const response = await POST(makeRequest(makeCharacterBody()));

    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="Thalindra_Moonwhisper.pdf"'
    );
  });

  it("sanitizes special characters in filename", async () => {
    const fakePdf = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    mockFillCharacterSheet.mockResolvedValue(fakePdf);

    const body = { ...makeCharacterBody(), name: "Thal'indra (The Great)" };
    const response = await POST(makeRequest(body));

    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="Thal_indra__The_Great_.pdf"'
    );
  });

  it("passes character data to fillCharacterSheet", async () => {
    const fakePdf = new Uint8Array([0x25, 0x50, 0x44, 0x46]);
    mockFillCharacterSheet.mockResolvedValue(fakePdf);

    const body = makeCharacterBody();
    await POST(makeRequest(body));

    expect(mockFillCharacterSheet).toHaveBeenCalledOnce();
    expect(mockFillCharacterSheet.mock.calls[0][0]).toMatchObject({
      name: "Thalindra Moonwhisper",
      class: "Wizard",
    });
  });

  it("returns 500 when fillCharacterSheet throws", async () => {
    mockFillCharacterSheet.mockRejectedValue(new Error("Template not found"));

    const response = await POST(makeRequest(makeCharacterBody()));

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("Template not found");
  });
});
