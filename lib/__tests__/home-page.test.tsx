// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import type { EnrichedCharacter, SavedCharacter } from "@/lib/schemas";

let mockSessionData: { data: unknown; status: string } = {
  data: null,
  status: "unauthenticated",
};

vi.mock("next-auth/react", () => ({
  useSession: () => mockSessionData,
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    <a href={href}>{children}</a>,
}));

let capturedOnGenerate: ((input: unknown) => void) | null = null;

vi.mock("@/components/CharacterForm", () => ({
  default: ({ onGenerate, isLoading }: { onGenerate: (input: unknown) => void; isLoading: boolean }) => {
    capturedOnGenerate = onGenerate;
    return <div data-testid="character-form" data-loading={isLoading} />;
  },
}));

let capturedSheetOnChange: ((character: EnrichedCharacter) => void) | null = null;

vi.mock("@/components/CharacterSheet", () => ({
  default: ({ character, editable, onChange }: { character: unknown; editable?: boolean; onChange?: (c: EnrichedCharacter) => void }) => {
    if (onChange) capturedSheetOnChange = onChange;
    return <div data-testid="character-sheet" data-name={(character as { name: string }).name} data-editable={editable ?? false} />;
  },
}));

vi.mock("@/components/CharacterHistory", () => ({
  default: () => <div data-testid="character-history" />,
}));

vi.mock("@/components/LoadingSpinner", () => ({
  default: () => <div data-testid="loading-spinner" />,
}));

vi.mock("@/components/SourcesModal", () => ({
  default: () => <div data-testid="sources-modal" />,
}));

import Home from "@/app/page";

function makeEnrichedCharacter(overrides: Partial<EnrichedCharacter> = {}): EnrichedCharacter {
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

function makeSavedCharacter(overrides: Partial<SavedCharacter> = {}): SavedCharacter {
  return {
    ...makeEnrichedCharacter(),
    id: "saved-abc-123",
    savedAt: Date.now(),
    userId: "user-uuid-1234",
    ...overrides,
  };
}

function setSession(status: "authenticated" | "unauthenticated" | "loading", email?: string) {
  if (status === "authenticated") {
    mockSessionData = {
      data: { user: { id: "user-uuid-1234", email: email ?? "test@example.com" } },
      status: "authenticated",
    };
  } else {
    mockSessionData = { data: null, status };
  }
}

const mockScrollIntoView = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  setSession("unauthenticated");
  capturedOnGenerate = null;
  capturedSheetOnChange = null;
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve([]),
  });
  Element.prototype.scrollIntoView = mockScrollIntoView;
});

async function triggerGeneration(character?: EnrichedCharacter) {
  const charData = character ?? makeEnrichedCharacter();

  (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(charData),
  });

  await act(async () => {
    capturedOnGenerate!({ isRandom: true });
  });
}

describe("Home page", () => {
  describe("floating save button visibility", () => {
    it("is not rendered when no character is displayed", async () => {
      setSession("authenticated");
      await act(async () => { render(<Home />); });

      expect(screen.queryByRole("button", { name: /save this character/i })).toBeNull();
    });

    it("is not rendered for anonymous users even with a character", async () => {
      setSession("unauthenticated");
      render(<Home />);

      await triggerGeneration();

      expect(screen.queryByRole("button", { name: /save this character/i })).toBeNull();
    });

    it("is rendered when signed in with an unsaved character", async () => {
      setSession("authenticated");
      render(<Home />);

      await triggerGeneration();

      expect(screen.getByRole("button", { name: /save this character/i })).toBeDefined();
    });

    it("is not rendered when character is already saved", async () => {
      setSession("authenticated");
      render(<Home />);

      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(makeSavedCharacter()),
      });

      await act(async () => {
        capturedOnGenerate!({ isRandom: true });
      });

      await waitFor(() => {
        expect(screen.getByTestId("character-sheet")).toBeDefined();
      });

      expect(screen.queryByRole("button", { name: /save this character/i })).toBeNull();
    });

    it("disappears after clicking save", async () => {
      setSession("authenticated");
      render(<Home />);

      await triggerGeneration();

      expect(screen.getByRole("button", { name: /save this character/i })).toBeDefined();

      const savedChar = makeSavedCharacter();
      (globalThis.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(savedChar),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([savedChar]),
        });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /save this character/i }));
      });

      await waitFor(() => {
        expect(screen.queryByRole("button", { name: /save this character/i })).toBeNull();
      });
    });
  });

  describe("save behavior", () => {
    it("POSTs to /api/characters with the current character", async () => {
      setSession("authenticated");
      render(<Home />);

      const charData = makeEnrichedCharacter({ name: "Grog" });
      await triggerGeneration(charData);

      const savedChar = makeSavedCharacter({ name: "Grog" });
      (globalThis.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(savedChar),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([savedChar]),
        });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /save this character/i }));
      });

      const saveCalls = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.filter(
        ([url, opts]: [string, RequestInit]) => url === "/api/characters" && opts?.method === "POST"
      );
      expect(saveCalls).toHaveLength(1);

      const body = JSON.parse(saveCalls[0][1].body as string);
      expect(body).toMatchObject({ name: "Grog", race: "Elf" });
    });

    it("refreshes history after successful save", async () => {
      setSession("authenticated");
      render(<Home />);

      await triggerGeneration();

      const savedChar = makeSavedCharacter();
      (globalThis.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(savedChar),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve([savedChar]),
        });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /save this character/i }));
      });

      await waitFor(() => {
        const historyFetches = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.filter(
          ([url, opts]: [string, RequestInit | undefined]) =>
            url === "/api/characters" && (!opts || opts.method === undefined || opts.method === "GET")
        );
        expect(historyFetches.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe("auto-scroll", () => {
    it("calls scrollIntoView when a character is displayed", async () => {
      setSession("unauthenticated");
      render(<Home />);

      await triggerGeneration();

      await waitFor(() => {
        expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
      });
    });
  });

  describe("auth-dependent UI", () => {
    it("shows Sign in link for anonymous users", () => {
      setSession("unauthenticated");
      render(<Home />);

      expect(screen.getByText("Sign in")).toBeDefined();
    });

    it("shows History sidebar when signed in", async () => {
      setSession("authenticated");
      await act(async () => { render(<Home />); });

      expect(screen.getByText("History")).toBeDefined();
    });

    it("does not show History sidebar for anonymous users", () => {
      setSession("unauthenticated");
      render(<Home />);

      expect(screen.queryByText("History")).toBeNull();
    });

    it("shows mobile history toggle when signed in", async () => {
      setSession("authenticated");
      await act(async () => { render(<Home />); });

      expect(screen.getByLabelText("Toggle history")).toBeDefined();
    });

    it("does not show mobile history toggle for anonymous users", () => {
      setSession("unauthenticated");
      render(<Home />);

      expect(screen.queryByLabelText("Toggle history")).toBeNull();
    });

    it("shows sign-in prompt below sheet for anonymous users", async () => {
      setSession("unauthenticated");
      render(<Home />);

      await triggerGeneration();

      expect(screen.getByText(/to save characters and build your collection/i)).toBeDefined();
    });

    it("does not show sign-in prompt for authenticated users", async () => {
      setSession("authenticated");
      render(<Home />);

      await triggerGeneration();

      expect(screen.queryByText(/to save characters and build your collection/i)).toBeNull();
    });
  });

  describe("always-editable sheet", () => {
    it("passes editable=true to CharacterSheet", async () => {
      setSession("unauthenticated");
      render(<Home />);

      await triggerGeneration();

      const sheet = screen.getByTestId("character-sheet");
      expect(sheet.getAttribute("data-editable")).toBe("true");
    });

    it("has no Edit toggle button", async () => {
      setSession("unauthenticated");
      render(<Home />);

      await triggerGeneration();

      expect(screen.queryByLabelText("Toggle edit mode")).toBeNull();
    });
  });

  describe("recalculate button", () => {
    it("is not visible when character has not been edited", async () => {
      setSession("unauthenticated");
      render(<Home />);

      await triggerGeneration();

      expect(screen.queryByRole("button", { name: /recalculate stats/i })).toBeNull();
    });

    it("appears after character is edited", async () => {
      setSession("unauthenticated");
      render(<Home />);

      await triggerGeneration();

      await act(async () => {
        capturedSheetOnChange!(makeEnrichedCharacter({ name: "Edited Name" }));
      });

      expect(screen.getByRole("button", { name: /recalculate stats/i })).toBeDefined();
    });

    it("calls /api/recalculate and hides itself on success", async () => {
      setSession("unauthenticated");
      render(<Home />);

      await triggerGeneration();

      await act(async () => {
        capturedSheetOnChange!(makeEnrichedCharacter({ name: "Edited" }));
      });

      const recalcResult = makeEnrichedCharacter({ name: "Edited" });
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(recalcResult),
      });

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /recalculate stats/i }));
      });

      await waitFor(() => {
        expect(screen.queryByRole("button", { name: /recalculate stats/i })).toBeNull();
      });

      const recalcCalls = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.filter(
        ([url, opts]: [string, RequestInit]) => url === "/api/recalculate" && opts?.method === "POST"
      );
      expect(recalcCalls).toHaveLength(1);
    });
  });
});
