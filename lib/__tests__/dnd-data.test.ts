import { describe, it, expect } from "vitest";
import {
  RACES,
  RACE_VARIANTS,
  CLASSES,
  SUBCLASSES,
  BACKGROUNDS,
  ALIGNMENTS,
  SPELLCASTING_ABILITY,
  SUBCLASS_SPELLCASTING_ABILITY,
} from "../dnd-data";

describe("RACES", () => {
  it("contains expected core races", () => {
    const core = ["Human", "Elf", "Dwarf", "Halfling", "Dragonborn", "Gnome", "Half-Elf", "Half-Orc", "Tiefling"];
    for (const race of core) {
      expect(RACES).toContain(race);
    }
  });

  it("contains MotM races", () => {
    const motm = ["Aarakocra", "Aasimar", "Bugbear", "Changeling", "Firbolg", "Githyanki", "Githzerai", "Goblin", "Goliath", "Kenku", "Kobold", "Lizardfolk", "Minotaur", "Orc", "Tabaxi", "Tortle", "Triton", "Yuan-ti"];
    for (const race of motm) {
      expect(RACES).toContain(race);
    }
  });

  it("is sorted alphabetically", () => {
    const sorted = [...RACES].sort((a, b) => a.localeCompare(b));
    expect([...RACES]).toEqual(sorted);
  });

  it("has no duplicates", () => {
    expect(new Set(RACES).size).toBe(RACES.length);
  });
});

describe("RACE_VARIANTS", () => {
  it("has variants for races with subraces", () => {
    expect(RACE_VARIANTS["Elf"]).toBeDefined();
    expect(RACE_VARIANTS["Dwarf"]).toBeDefined();
    expect(RACE_VARIANTS["Halfling"]).toBeDefined();
    expect(RACE_VARIANTS["Human"]).toBeDefined();
    expect(RACE_VARIANTS["Dragonborn"]).toBeDefined();
    expect(RACE_VARIANTS["Gnome"]).toBeDefined();
    expect(RACE_VARIANTS["Genasi"]).toBeDefined();
    expect(RACE_VARIANTS["Shifter"]).toBeDefined();
  });

  it("all variant keys are in RACES", () => {
    for (const key of Object.keys(RACE_VARIANTS)) {
      expect(RACES).toContain(key);
    }
  });

  it("each variant list is non-empty", () => {
    for (const [race, variants] of Object.entries(RACE_VARIANTS)) {
      expect(variants.length, `${race} should have variants`).toBeGreaterThan(0);
    }
  });

  it("includes Fizban's dragonborn variants", () => {
    expect(RACE_VARIANTS["Dragonborn"]).toContain("Chromatic");
    expect(RACE_VARIANTS["Dragonborn"]).toContain("Gem");
    expect(RACE_VARIANTS["Dragonborn"]).toContain("Metallic");
  });
});

describe("CLASSES", () => {
  it("contains all 13 classes including Artificer", () => {
    expect(CLASSES).toHaveLength(13);
    const expected = ["Artificer", "Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"];
    expect([...CLASSES]).toEqual(expected);
  });

  it("is sorted alphabetically", () => {
    const sorted = [...CLASSES].sort((a, b) => a.localeCompare(b));
    expect([...CLASSES]).toEqual(sorted);
  });
});

describe("SUBCLASSES", () => {
  it("has subclasses for every class", () => {
    for (const cls of CLASSES) {
      expect(SUBCLASSES[cls], `Missing subclasses for ${cls}`).toBeDefined();
      expect(SUBCLASSES[cls].length, `${cls} should have subclasses`).toBeGreaterThan(0);
    }
  });

  it("has no extra keys beyond CLASSES", () => {
    const classSet = new Set<string>(CLASSES);
    for (const key of Object.keys(SUBCLASSES)) {
      expect(classSet.has(key), `Unexpected subclass key: ${key}`).toBe(true);
    }
  });

  it("includes DMG villain subclasses", () => {
    expect(SUBCLASSES["Cleric"]).toContain("Death Domain");
    expect(SUBCLASSES["Paladin"]).toContain("Oathbreaker");
  });

  it("includes XGtE subclasses", () => {
    expect(SUBCLASSES["Barbarian"]).toContain("Path of the Zealot");
    expect(SUBCLASSES["Bard"]).toContain("College of Glamour");
    expect(SUBCLASSES["Fighter"]).toContain("Samurai");
    expect(SUBCLASSES["Rogue"]).toContain("Inquisitive");
  });

  it("includes TCoE subclasses", () => {
    expect(SUBCLASSES["Cleric"]).toContain("Peace Domain");
    expect(SUBCLASSES["Cleric"]).toContain("Twilight Domain");
    expect(SUBCLASSES["Druid"]).toContain("Circle of Stars");
    expect(SUBCLASSES["Sorcerer"]).toContain("Aberrant Mind");
  });

  it("has no duplicate subclasses within a class", () => {
    for (const [cls, subs] of Object.entries(SUBCLASSES)) {
      expect(new Set(subs).size, `Duplicate subclass in ${cls}`).toBe(subs.length);
    }
  });
});

describe("BACKGROUNDS", () => {
  it("contains core PHB backgrounds", () => {
    const core = ["Acolyte", "Criminal", "Folk Hero", "Noble", "Sage", "Soldier", "Urchin"];
    for (const bg of core) {
      expect(BACKGROUNDS).toContain(bg);
    }
  });

  it("contains SCAG backgrounds", () => {
    const scag = ["City Watch", "Clan Crafter", "Cloistered Scholar", "Courtier", "Far Traveler", "Inheritor", "Knight of the Order", "Mercenary Veteran", "Urban Bounty Hunter", "Uthgardt Tribe Member", "Waterdhavian Noble"];
    for (const bg of scag) {
      expect(BACKGROUNDS).toContain(bg);
    }
  });

  it("contains Curse of Strahd background", () => {
    expect(BACKGROUNDS).toContain("Haunted One");
  });

  it("has no duplicates", () => {
    expect(new Set(BACKGROUNDS).size).toBe(BACKGROUNDS.length);
  });
});

describe("ALIGNMENTS", () => {
  it("has exactly 9 alignments", () => {
    expect(ALIGNMENTS).toHaveLength(9);
  });

  it("covers all standard alignments", () => {
    expect(ALIGNMENTS).toContain("Lawful Good");
    expect(ALIGNMENTS).toContain("True Neutral");
    expect(ALIGNMENTS).toContain("Chaotic Evil");
  });
});

describe("SPELLCASTING_ABILITY", () => {
  it("maps all caster classes", () => {
    const casters = ["Artificer", "Bard", "Cleric", "Druid", "Paladin", "Ranger", "Sorcerer", "Warlock", "Wizard"];
    for (const cls of casters) {
      expect(SPELLCASTING_ABILITY[cls], `Missing mapping for ${cls}`).toBeDefined();
    }
  });

  it("uses correct abilities", () => {
    expect(SPELLCASTING_ABILITY["Wizard"]).toBe("int");
    expect(SPELLCASTING_ABILITY["Artificer"]).toBe("int");
    expect(SPELLCASTING_ABILITY["Cleric"]).toBe("wis");
    expect(SPELLCASTING_ABILITY["Druid"]).toBe("wis");
    expect(SPELLCASTING_ABILITY["Ranger"]).toBe("wis");
    expect(SPELLCASTING_ABILITY["Bard"]).toBe("cha");
    expect(SPELLCASTING_ABILITY["Paladin"]).toBe("cha");
    expect(SPELLCASTING_ABILITY["Sorcerer"]).toBe("cha");
    expect(SPELLCASTING_ABILITY["Warlock"]).toBe("cha");
  });

  it("does not include non-caster classes", () => {
    const nonCasters = ["Barbarian", "Fighter", "Monk", "Rogue"];
    for (const cls of nonCasters) {
      expect(SPELLCASTING_ABILITY[cls]).toBeUndefined();
    }
  });
});

describe("SUBCLASS_SPELLCASTING_ABILITY", () => {
  it("maps Eldritch Knight to INT", () => {
    expect(SUBCLASS_SPELLCASTING_ABILITY["Eldritch Knight"]).toBe("int");
  });

  it("maps Arcane Trickster to INT", () => {
    expect(SUBCLASS_SPELLCASTING_ABILITY["Arcane Trickster"]).toBe("int");
  });
});
