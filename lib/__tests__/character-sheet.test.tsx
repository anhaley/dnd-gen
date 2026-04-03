// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CharacterSheet from "@/components/CharacterSheet";
import type { EnrichedCharacter } from "@/lib/schemas";

function makeCharacter(
  overrides: Partial<EnrichedCharacter> = {}
): EnrichedCharacter {
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

describe("CharacterSheet export button", () => {
  it("renders export button when onExport is provided", () => {
    render(
      <CharacterSheet
        character={makeCharacter()}
        onExport={() => {}}
      />
    );

    expect(screen.getByText("Export to PDF")).toBeDefined();
  });

  it("does not render export button when onExport is not provided", () => {
    render(<CharacterSheet character={makeCharacter()} />);

    expect(screen.queryByText("Export to PDF")).toBeNull();
    expect(screen.queryByText("Exporting...")).toBeNull();
  });

  it("shows 'Exporting...' and disables button when isExporting is true", () => {
    render(
      <CharacterSheet
        character={makeCharacter()}
        onExport={() => {}}
        isExporting={true}
      />
    );

    const btn = screen.getByText("Exporting...");
    expect(btn).toBeDefined();
    expect(btn.closest("button")!.disabled).toBe(true);
  });

  it("calls onExport when button is clicked", () => {
    const onExport = vi.fn();
    render(
      <CharacterSheet character={makeCharacter()} onExport={onExport} />
    );

    fireEvent.click(screen.getByText("Export to PDF"));

    expect(onExport).toHaveBeenCalledOnce();
  });

  it("does not call onExport when disabled", () => {
    const onExport = vi.fn();
    render(
      <CharacterSheet
        character={makeCharacter()}
        onExport={onExport}
        isExporting={true}
      />
    );

    fireEvent.click(screen.getByText("Exporting..."));

    expect(onExport).not.toHaveBeenCalled();
  });
});
