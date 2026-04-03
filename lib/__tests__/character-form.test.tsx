// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CharacterForm from "@/components/CharacterForm";

vi.mock("@/lib/dnd-data", () => ({
  RACES: ["Elf", "Human", "Dwarf"],
  RACE_VARIANTS: {
    Elf: ["High Elf", "Wood Elf"],
    Dwarf: ["Hill Dwarf", "Mountain Dwarf"],
  } as Record<string, string[]>,
  CLASSES: ["Fighter", "Wizard"],
  SUBCLASSES: {
    Fighter: ["Champion", "Battle Master"],
    Wizard: ["Evocation", "Abjuration"],
  } as Record<string, string[]>,
  BACKGROUNDS: ["Sage", "Noble"],
}));

const onGenerate = vi.fn();

function getFieldByLabel(labelText: string): HTMLSelectElement | HTMLInputElement {
  const label = screen.getByText(labelText);
  const control = label.parentElement!.querySelector("select, input");
  if (!control) throw new Error(`No form control found for label "${labelText}"`);
  return control as HTMLSelectElement | HTMLInputElement;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("CharacterForm", () => {
  describe("button labels", () => {
    it("renders both buttons with default labels", () => {
      render(<CharacterForm onGenerate={onGenerate} isLoading={false} />);

      expect(screen.getByRole("button", { name: "Generate Character" })).toBeDefined();
      expect(screen.getByRole("button", { name: "Fully Random" })).toBeDefined();
    });

    it("disables both buttons when isLoading is true", () => {
      render(<CharacterForm onGenerate={onGenerate} isLoading={true} />);

      const generateBtn = screen.getByRole("button", { name: /generate character/i });
      const randomBtn = screen.getByRole("button", { name: /fully random/i });
      expect((generateBtn as HTMLButtonElement).disabled).toBe(true);
      expect((randomBtn as HTMLButtonElement).disabled).toBe(true);
    });
  });

  describe("loading state per button", () => {
    it("shows Generating only on Generate Character when it was clicked", async () => {
      const { rerender } = render(
        <CharacterForm onGenerate={onGenerate} isLoading={false} />
      );

      await userEvent.click(screen.getByRole("button", { name: "Generate Character" }));

      rerender(<CharacterForm onGenerate={onGenerate} isLoading={true} />);

      expect(screen.getByRole("button", { name: "Generating..." })).toBeDefined();
      expect(screen.getByRole("button", { name: "Fully Random" })).toBeDefined();
    });

    it("shows Generating only on Fully Random when it was clicked", async () => {
      const { rerender } = render(
        <CharacterForm onGenerate={onGenerate} isLoading={false} />
      );

      await userEvent.click(screen.getByRole("button", { name: "Fully Random" }));

      rerender(<CharacterForm onGenerate={onGenerate} isLoading={true} />);

      expect(screen.getByRole("button", { name: "Generating..." })).toBeDefined();
      expect(screen.getByRole("button", { name: "Generate Character" })).toBeDefined();
    });
  });

  describe("form submission", () => {
    it("calls onGenerate with isRandom true when Fully Random is clicked", async () => {
      render(<CharacterForm onGenerate={onGenerate} isLoading={false} />);

      await userEvent.click(screen.getByRole("button", { name: "Fully Random" }));

      expect(onGenerate).toHaveBeenCalledWith({ isRandom: true });
    });

    it("calls onGenerate with form values when Generate Character is clicked", async () => {
      render(<CharacterForm onGenerate={onGenerate} isLoading={false} />);

      await userEvent.selectOptions(getFieldByLabel("Race"), "Elf");
      await userEvent.selectOptions(getFieldByLabel("Race Variant"), "High Elf");
      await userEvent.selectOptions(getFieldByLabel("Class"), "Wizard");
      await userEvent.selectOptions(getFieldByLabel("Subclass"), "Evocation");
      await userEvent.clear(getFieldByLabel("Level"));
      await userEvent.type(getFieldByLabel("Level"), "5");
      await userEvent.selectOptions(getFieldByLabel("Background"), "Sage");

      await userEvent.click(screen.getByRole("button", { name: "Generate Character" }));

      expect(onGenerate).toHaveBeenCalledWith({
        race: "Elf",
        raceVariant: "High Elf",
        class: "Wizard",
        subclass: "Evocation",
        level: 5,
        background: "Sage",
        isRandom: false,
      });
    });

    it("sends undefined for empty optional fields", async () => {
      render(<CharacterForm onGenerate={onGenerate} isLoading={false} />);

      await userEvent.click(screen.getByRole("button", { name: "Generate Character" }));

      expect(onGenerate).toHaveBeenCalledWith({
        race: undefined,
        raceVariant: undefined,
        class: undefined,
        subclass: undefined,
        level: undefined,
        background: undefined,
        isRandom: false,
      });
    });
  });

  describe("conditional dropdowns", () => {
    it("does not show Race Variant when no race is selected", () => {
      render(<CharacterForm onGenerate={onGenerate} isLoading={false} />);

      expect(screen.queryByText("Race Variant")).toBeNull();
    });

    it("does not show Race Variant for a race without variants", async () => {
      render(<CharacterForm onGenerate={onGenerate} isLoading={false} />);

      await userEvent.selectOptions(getFieldByLabel("Race"), "Human");

      expect(screen.queryByText("Race Variant")).toBeNull();
    });

    it("shows Race Variant when a race with variants is selected", async () => {
      render(<CharacterForm onGenerate={onGenerate} isLoading={false} />);

      await userEvent.selectOptions(getFieldByLabel("Race"), "Elf");

      const variantSelect = getFieldByLabel("Race Variant") as HTMLSelectElement;
      expect(variantSelect).toBeDefined();
      expect(variantSelect.querySelectorAll("option").length).toBe(3); // placeholder + 2 variants
    });

    it("resets race variant when race changes", async () => {
      render(<CharacterForm onGenerate={onGenerate} isLoading={false} />);

      await userEvent.selectOptions(getFieldByLabel("Race"), "Elf");
      await userEvent.selectOptions(getFieldByLabel("Race Variant"), "High Elf");

      await userEvent.selectOptions(getFieldByLabel("Race"), "Dwarf");

      const variantSelect = getFieldByLabel("Race Variant") as HTMLSelectElement;
      expect(variantSelect.value).toBe("");
    });

    it("disables Subclass until a class is selected", () => {
      render(<CharacterForm onGenerate={onGenerate} isLoading={false} />);

      expect((getFieldByLabel("Subclass") as HTMLSelectElement).disabled).toBe(true);
    });

    it("enables Subclass after a class is selected", async () => {
      render(<CharacterForm onGenerate={onGenerate} isLoading={false} />);

      await userEvent.selectOptions(getFieldByLabel("Class"), "Fighter");

      expect((getFieldByLabel("Subclass") as HTMLSelectElement).disabled).toBe(false);
    });

    it("resets subclass when class changes", async () => {
      render(<CharacterForm onGenerate={onGenerate} isLoading={false} />);

      await userEvent.selectOptions(getFieldByLabel("Class"), "Fighter");
      await userEvent.selectOptions(getFieldByLabel("Subclass"), "Champion");

      await userEvent.selectOptions(getFieldByLabel("Class"), "Wizard");

      const subclassSelect = getFieldByLabel("Subclass") as HTMLSelectElement;
      expect(subclassSelect.value).toBe("");
    });
  });
});
