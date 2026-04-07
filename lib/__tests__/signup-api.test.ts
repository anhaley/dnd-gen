import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSelectLimit = vi.fn();
const mockSelectWhere = vi.fn(() => ({ limit: mockSelectLimit }));
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

vi.mock("@/lib/db", () => ({
  db: {
    select: (...args: unknown[]) => mockSelect(...args),
    insert: (...args: unknown[]) => mockInsert(...args),
  },
}));

vi.mock("@/lib/db/schema", () => ({
  users: { id: Symbol("id"), email: Symbol("email") },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((col: unknown, val: unknown) => ({ col, val })),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("$2a$12$hashedpassword"),
  },
}));

import { POST } from "@/app/api/auth/signup/route";

function makeRequest(body: Record<string, unknown> = {}) {
  const data = {
    email: "gandalf@shire.com",
    password: "youshallnotpass",
    ...body,
  };
  return new Request("http://localhost/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockSelectLimit.mockResolvedValue([]);
  mockInsertReturning.mockResolvedValue([
    { id: "user-1", email: "gandalf@shire.com" },
  ]);
});

describe("POST /api/auth/signup", () => {
  it("creates a user and returns ok", async () => {
    const response = await POST(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true });
  });

  it("normalizes email to lowercase and trims whitespace", async () => {
    await POST(makeRequest({ email: "  Gandalf@Shire.COM  " }));

    const selectWhereCalls = mockSelectWhere.mock.calls;
    expect(selectWhereCalls.length).toBeGreaterThan(0);
  });

  it("returns 400 for missing email", async () => {
    const response = await POST(makeRequest({ email: "" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toMatch(/email/i);
  });

  it("returns 400 for invalid email format", async () => {
    const response = await POST(makeRequest({ email: "not-an-email" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toMatch(/email/i);
  });

  it("returns 400 for password shorter than 8 characters", async () => {
    const response = await POST(makeRequest({ password: "short" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toMatch(/password/i);
  });

  it("returns 400 for missing password", async () => {
    const response = await POST(makeRequest({ password: "" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toMatch(/password/i);
  });

  it("returns 409 when email already exists", async () => {
    mockSelectLimit.mockResolvedValue([{ id: "existing-user" }]);

    const response = await POST(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toMatch(/already exists/i);
  });

  it("returns 500 on unexpected database error", async () => {
    mockInsertReturning.mockRejectedValue(new Error("db error"));

    const response = await POST(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toMatch(/failed/i);
  });

  it("accepts an optional name field", async () => {
    await POST(makeRequest({ name: "Gandalf the Grey" }));

    const insertedValues = mockInsertValues.mock.calls[0][0] as { name: string | null };
    expect(insertedValues.name).toBe("Gandalf the Grey");
  });

  it("sets name to null when not provided", async () => {
    await POST(makeRequest());

    const insertedValues = mockInsertValues.mock.calls[0][0] as { name: string | null };
    expect(insertedValues.name).toBeNull();
  });
});
