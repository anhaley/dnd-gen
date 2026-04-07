import { describe, it, expect, vi, beforeEach } from "vitest";

const mockAuth = vi.fn();

vi.mock("@/auth", () => ({
  auth: () => mockAuth(),
}));

const mockSelectOrderBy = vi.fn();
const mockSelectWhere = vi.fn(() => ({ orderBy: mockSelectOrderBy }));
const mockSelectFrom = vi.fn(() => ({ where: mockSelectWhere }));
const mockSelect = vi.fn((...args: unknown[]) => {
  void args;
  return { from: mockSelectFrom };
});

const mockInsertReturning = vi.fn();
const mockInsertValues = vi.fn((values: unknown) => {
  void values;
  return { returning: mockInsertReturning };
});
const mockInsert = vi.fn((...args: unknown[]) => {
  void args;
  return { values: mockInsertValues };
});

const mockDeleteWhere = vi.fn();
const mockDelete = vi.fn((...args: unknown[]) => {
  void args;
  return { where: mockDeleteWhere };
});

vi.mock("@/lib/db", () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    insert: (...args: unknown[]) => mockInsert(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));

vi.mock("@/lib/db/schema", () => ({
  characters: { savedAt: Symbol("savedAt"), id: Symbol("id"), userId: Symbol("userId") },
}));

vi.mock("drizzle-orm", () => ({
  and: vi.fn((...args: unknown[]) => args),
  desc: vi.fn((col: unknown) => col),
  eq: vi.fn((col: unknown, val: unknown) => ({ col, val })),
}));

import { GET, POST } from "@/app/api/characters/route";
import { DELETE } from "@/app/api/characters/[id]/route";

const TEST_USER_ID = "user-uuid-1234";
const AUTHED_SESSION = { user: { id: TEST_USER_ID, email: "test@example.com" } };

function makeDbRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "abc-123",
    savedAt: new Date("2025-06-15T12:00:00Z"),
    userId: TEST_USER_ID,
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
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue(AUTHED_SESSION);
});

describe("GET /api/characters", () => {
  it("returns mapped characters for the authenticated user", async () => {
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

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toMatchObject({ error: "Unauthorized" });
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

  it("attaches the session userId on insert", async () => {
    mockInsertReturning.mockResolvedValue([makeDbRow()]);

    await POST(makePostRequest());

    expect(mockInsertValues).toHaveBeenCalledTimes(1);
    const inserted = mockInsertValues.mock.calls[0][0] as { userId: string };
    expect(inserted.userId).toBe(TEST_USER_ID);
  });

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);

    const response = await POST(makePostRequest());
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toMatchObject({ error: "Unauthorized" });
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

  it("returns 401 when not authenticated", async () => {
    mockAuth.mockResolvedValue(null);
    const { request, params } = makeDeleteRequest("abc-123");

    const response = await DELETE(request, params);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toMatchObject({ error: "Unauthorized" });
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
