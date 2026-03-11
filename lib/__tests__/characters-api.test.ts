import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSelectOrderBy = vi.fn();
const mockSelectFrom = vi.fn(() => ({ orderBy: mockSelectOrderBy }));
const mockSelect = vi.fn(() => ({ from: mockSelectFrom }));

const mockInsertReturning = vi.fn();
const mockInsertValues = vi.fn(() => ({ returning: mockInsertReturning }));
const mockInsert = vi.fn(() => ({ values: mockInsertValues }));

const mockDeleteWhere = vi.fn();
const mockDelete = vi.fn(() => ({ where: mockDeleteWhere }));

vi.mock("@/lib/db", () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    insert: (...args: unknown[]) => mockInsert(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

vi.mock("@/lib/db/schema", () => ({
  characters: { savedAt: Symbol("savedAt"), id: Symbol("id") },
}));

vi.mock("drizzle-orm", () => ({
  desc: vi.fn((col: unknown) => col),
  eq: vi.fn((col: unknown, val: unknown) => ({ col, val })),
}));

import { GET, POST } from "@/app/api/characters/route";
import { DELETE } from "@/app/api/characters/[id]/route";

function makeDbRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "abc-123",
    savedAt: new Date("2025-06-15T12:00:00Z"),
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
    weapons: null,
    equipment: ["Scholar's pack"],
    features: ["Arcane Recovery"],
    spellSlots: [{ level: 1, slots: 4 }],
    spells: [{ name: "Fire Bolt", level: 0 }],
    traits: {
      personalityTraits: "Curious",
      ideals: "Knowledge",
      bonds: "Spellbook",
      flaws: "Overthinks",
    },
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/characters", () => {
  it("returns mapped characters on success", async () => {
    const rows = [makeDbRow(), makeDbRow({ id: "def-456", name: "Grog" })];
    mockSelectOrderBy.mockResolvedValue(rows);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(2);
    expect(body[0]).toMatchObject({ id: "abc-123", name: "Thalindra" });
    expect(body[1]).toMatchObject({ id: "def-456", name: "Grog" });
  });

  it("converts savedAt to a timestamp number", async () => {
    mockSelectOrderBy.mockResolvedValue([makeDbRow()]);

    const response = await GET();
    const [char] = await response.json();

    expect(typeof char.savedAt).toBe("number");
    expect(char.savedAt).toBe(new Date("2025-06-15T12:00:00Z").getTime());
  });

  it("returns an empty array when no characters exist", async () => {
    mockSelectOrderBy.mockResolvedValue([]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
  });

  it("returns 500 on database error", async () => {
    mockSelectOrderBy.mockRejectedValue(new Error("connection refused"));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toMatchObject({ error: "Failed to load characters" });
  });
});

describe("POST /api/characters", () => {
  function makePostRequest(data: Record<string, unknown> = {}) {
    const body = {
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
      weapons: null,
      equipment: ["Scholar's pack"],
      features: ["Arcane Recovery"],
      spellSlots: [{ level: 1, slots: 4 }],
      spells: [{ name: "Fire Bolt", level: 0 }],
      traits: {
        personalityTraits: "Curious",
        ideals: "Knowledge",
        bonds: "Spellbook",
        flaws: "Overthinks",
      },
      ...data,
    };
    return new Request("http://localhost/api/characters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  it("saves and returns the mapped character", async () => {
    const returnedRow = makeDbRow();
    mockInsertReturning.mockResolvedValue([returnedRow]);

    const response = await POST(makePostRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      id: "abc-123",
      name: "Thalindra",
      race: "Elf",
      raceVariant: "High Elf",
    });
    expect(typeof body.savedAt).toBe("number");
  });

  it("passes all fields to the database insert", async () => {
    mockInsertReturning.mockResolvedValue([makeDbRow()]);

    await POST(makePostRequest());

    expect(mockInsertValues).toHaveBeenCalledTimes(1);
    const inserted = mockInsertValues.mock.calls[0][0];
    expect(inserted).toMatchObject({
      name: "Thalindra",
      race: "Elf",
      raceVariant: "High Elf",
      class: "Wizard",
      level: 5,
    });
  });

  it("returns 500 on database error", async () => {
    mockInsertReturning.mockRejectedValue(new Error("constraint violation"));

    const response = await POST(makePostRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toMatchObject({ error: "Failed to save character" });
  });
});

describe("DELETE /api/characters/[id]", () => {
  function makeDeleteRequest(id: string) {
    return {
      request: new Request(`http://localhost/api/characters/${id}`, {
        method: "DELETE",
      }),
      params: { params: Promise.resolve({ id }) },
    };
  }

  it("returns ok: true on successful delete", async () => {
    mockDeleteWhere.mockResolvedValue(undefined);
    const { request, params } = makeDeleteRequest("abc-123");

    const response = await DELETE(request, params);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true });
  });

  it("calls db.delete with the correct id", async () => {
    mockDeleteWhere.mockResolvedValue(undefined);
    const { request, params } = makeDeleteRequest("xyz-789");

    await DELETE(request, params);

    expect(mockDeleteWhere).toHaveBeenCalledTimes(1);
  });

  it("returns 500 on database error", async () => {
    mockDeleteWhere.mockRejectedValue(new Error("db offline"));
    const { request, params } = makeDeleteRequest("abc-123");

    const response = await DELETE(request, params);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toMatchObject({ error: "Failed to delete character" });
  });
});
