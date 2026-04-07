import { readFileSync } from "fs";
import { join } from "path";
import {
  PDFDocument,
  PDFForm,
  PDFTextField,
  PDFCheckBox,
  PDFName,
  PDFString,
  PDFRef,
  PDFNumber,
  StandardFonts,
  rgb,
} from "pdf-lib";
import {
  SPELLCASTING_ABILITY,
  SUBCLASS_SPELLCASTING_ABILITY,
} from "./dnd-data";
import type { EnrichedCharacter, AbilityScores, NamedSummary } from "./schemas";

function formatNamedSummaryLine(entry: NamedSummary): string {
  const s = entry.summary.trim();
  return s ? `${entry.name}: ${s}` : entry.name;
}

function abilityMod(score: number): number {
  return Math.floor((score - 10) / 2);
}

function modStr(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

const SKILL_ABILITY: Record<string, keyof AbilityScores> = {
  Acrobatics: "dex",
  "Animal Handling": "wis",
  Arcana: "int",
  Athletics: "str",
  Deception: "cha",
  History: "int",
  Insight: "wis",
  Intimidation: "cha",
  Investigation: "int",
  Medicine: "wis",
  Nature: "int",
  Perception: "wis",
  Performance: "cha",
  Persuasion: "cha",
  Religion: "int",
  "Sleight of Hand": "dex",
  Stealth: "dex",
  Survival: "wis",
};

// Maps skill name -> PDF text field name (note trailing spaces on some)
const SKILL_FIELD: Record<string, string> = {
  Acrobatics: "Acrobatics",
  "Animal Handling": "Animal",
  Arcana: "Arcana",
  Athletics: "Athletics",
  Deception: "Deception ",
  History: "History ",
  Insight: "Insight",
  Intimidation: "Intimidation",
  Investigation: "Investigation ",
  Medicine: "Medicine",
  Nature: "Nature",
  Perception: "Perception ",
  Performance: "Performance",
  Persuasion: "Persuasion",
  Religion: "Religion",
  "Sleight of Hand": "SleightofHand",
  Stealth: "Stealth ",
  Survival: "Survival",
};

// Maps skill name -> PDF checkbox field name for proficiency
const SKILL_CHECKBOX: Record<string, string> = {
  Acrobatics: "Check Box 23",
  "Animal Handling": "Check Box 24",
  Arcana: "Check Box 25",
  Athletics: "Check Box 26",
  Deception: "Check Box 27",
  History: "Check Box 28",
  Insight: "Check Box 29",
  Intimidation: "Check Box 30",
  Investigation: "Check Box 31",
  Medicine: "Check Box 32",
  Nature: "Check Box 33",
  Perception: "Check Box 34",
  Performance: "Check Box 35",
  Persuasion: "Check Box 36",
  Religion: "Check Box 37",
  "Sleight of Hand": "Check Box 38",
  Stealth: "Check Box 39",
  Survival: "Check Box 40",
};

const SAVE_ABILITY_ORDER: (keyof AbilityScores)[] = [
  "str",
  "dex",
  "con",
  "int",
  "wis",
  "cha",
];

const SAVE_FIELD: Record<string, string> = {
  str: "ST Strength",
  dex: "ST Dexterity",
  con: "ST Constitution",
  int: "ST Intelligence",
  wis: "ST Wisdom",
  cha: "ST Charisma",
};

const SAVE_CHECKBOX: Record<string, string> = {
  str: "Check Box 11",
  dex: "Check Box 18",
  con: "Check Box 19",
  int: "Check Box 20",
  wis: "Check Box 21",
  cha: "Check Box 22",
};

const SAVE_NAME_TO_KEY: Record<string, keyof AbilityScores> = {
  Strength: "str",
  Dexterity: "dex",
  Constitution: "con",
  Intelligence: "int",
  Wisdom: "wis",
  Charisma: "cha",
};

const ABILITY_TO_FULL: Record<keyof AbilityScores, string> = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};

const HIT_DICE: Record<string, string> = {
  Artificer: "d8",
  Barbarian: "d12",
  Bard: "d8",
  Cleric: "d8",
  Druid: "d8",
  Fighter: "d10",
  Monk: "d8",
  Paladin: "d10",
  Ranger: "d10",
  Rogue: "d8",
  Sorcerer: "d6",
  Warlock: "d8",
  Wizard: "d6",
};

// Spell field names in visual order per level (verified against WotC PDF template)
const SPELL_FIELDS: Record<number, string[]> = {
  0: ["1014", "1016", "1017", "1018", "1019", "1020", "1021", "1022"].map((n) => `Spells ${n}`),
  1: ["1015", "1023", "1024", "1025", "1026", "1027", "1028", "1029", "1030", "1031", "1032", "1033"].map((n) => `Spells ${n}`),
  2: ["1046", "1034", "1035", "1036", "1037", "1038", "1039", "1040", "1041", "1042", "1043", "1044", "1045"].map((n) => `Spells ${n}`),
  3: ["1048", "1047", "1049", "1050", "1051", "1052", "1053", "1054", "1055", "1056", "1057", "1058", "1059"].map((n) => `Spells ${n}`),
  4: ["1061", "1060", "1062", "1063", "1064", "1065", "1066", "1067", "1068", "1069", "1070", "1071", "1072"].map((n) => `Spells ${n}`),
  5: ["1074", "1073", "1075", "1076", "1077", "1078", "1079", "1080", "1081"].map((n) => `Spells ${n}`),
  6: ["1083", "1082", "1084", "1085", "1086", "1087", "1088", "1089", "1090"].map((n) => `Spells ${n}`),
  7: ["1092", "1091", "1093", "1094", "1095", "1096", "1097", "1098", "1099"].map((n) => `Spells ${n}`),
  8: ["10101", "10100", "10102", "10103", "10104", "10105", "10106"].map((n) => `Spells ${n}`),
  9: ["10108", "10107", "10109", "101010", "101011", "101012", "101013"].map((n) => `Spells ${n}`),
};

// Slot total fields: SlotsTotal 19 = Level 1 through SlotsTotal 27 = Level 9
const SLOT_TOTAL_FIELD: Record<number, string> = {
  1: "SlotsTotal 19",
  2: "SlotsTotal 20",
  3: "SlotsTotal 21",
  4: "SlotsTotal 22",
  5: "SlotsTotal 23",
  6: "SlotsTotal 24",
  7: "SlotsTotal 25",
  8: "SlotsTotal 26",
  9: "SlotsTotal 27",
};

function ensureDA(field: PDFTextField, size: number) {
  try {
    field.setFontSize(size);
  } catch {
    field.acroField.dict.set(
      PDFName.of("DA"),
      PDFString.of(`/Helv ${size} Tf 0 g`)
    );
    field.setFontSize(size);
  }
}

function safeSetText(
  form: PDFForm,
  fieldName: string,
  value: string,
  fontSize = 0
) {
  try {
    const field = form.getField(fieldName);
    if (field instanceof PDFTextField) {
      ensureDA(field, fontSize);
      field.setText(value);
    }
  } catch {
    // Field not found — skip silently
  }
}

function safeCheckBox(
  pdf: PDFDocument,
  form: PDFForm,
  fieldName: string,
  checked: boolean
) {
  try {
    const field = form.getField(fieldName);
    if (!(field instanceof PDFCheckBox)) return;

    if (checked) {
      field.check();
      drawProficiencyDot(pdf, field);
    } else {
      field.uncheck();
    }
  } catch {
    // Field not found — skip silently
  }
}

/**
 * Hide the checkbox annotation and draw a filled circle directly on the page
 * at the checkbox position. This bypasses annotation rendering entirely.
 */
function drawProficiencyDot(pdf: PDFDocument, cb: PDFCheckBox) {
  const widget = cb.acroField.getWidgets()[0];
  if (!widget) return;

  const rect = widget.getRectangle();
  const pageRef = widget.dict.get(PDFName.of("P"));
  if (!pageRef) return;

  // Hide the annotation so it doesn't cover our drawn dot
  const flags = widget.dict.get(PDFName.of("F"));
  const currentFlags = flags instanceof PDFNumber ? flags.asNumber() : 0;
  widget.dict.set(PDFName.of("F"), PDFNumber.of(currentFlags | 0x0002));

  const pages = pdf.getPages();
  const page = pages.find(
    (p) => p.ref.toString() === (pageRef as PDFRef).toString()
  );
  if (!page) return;

  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  const r = Math.min(rect.width, rect.height) * 0.35;

  page.drawCircle({ x: cx, y: cy, size: r, color: rgb(0, 0, 0) });
}

export async function fillCharacterSheet(
  character: EnrichedCharacter,
  templatePath?: string
): Promise<Uint8Array> {
  const pdfPath =
    templatePath ??
    join(process.cwd(), "public", "templates", "character-sheet.pdf");
  const bytes = readFileSync(pdfPath);
  const pdf = await PDFDocument.load(bytes);
  const form = pdf.getForm();

  const { abilityScores, proficiencyBonus } = character;

  // --- Page 1: Core ---

  safeSetText(form, "CharacterName", character.name);
  safeSetText(form, "CharacterName 2", character.name);

  const classLevel = character.subclass
    ? `${character.class} (${character.subclass}) ${character.level}`
    : `${character.class} ${character.level}`;
  safeSetText(form, "ClassLevel", classLevel);

  safeSetText(form, "Background", character.background);

  const raceName =
    character.raceVariant && character.raceVariant !== "null"
      ? `${character.raceVariant} ${character.race}`
      : character.race;
  safeSetText(form, "Race ", raceName);

  safeSetText(form, "Alignment", character.alignment);
  safeSetText(form, "ProfBonus", modStr(proficiencyBonus));

  // Ability scores + modifiers
  safeSetText(form, "STR", String(abilityScores.str));
  safeSetText(form, "STRmod", modStr(abilityMod(abilityScores.str)));
  safeSetText(form, "DEX", String(abilityScores.dex));
  safeSetText(form, "DEXmod ", modStr(abilityMod(abilityScores.dex)));
  safeSetText(form, "CON", String(abilityScores.con));
  safeSetText(form, "CONmod", modStr(abilityMod(abilityScores.con)));
  safeSetText(form, "INT", String(abilityScores.int));
  safeSetText(form, "INTmod", modStr(abilityMod(abilityScores.int)));
  safeSetText(form, "WIS", String(abilityScores.wis));
  safeSetText(form, "WISmod", modStr(abilityMod(abilityScores.wis)));
  safeSetText(form, "CHA", String(abilityScores.cha));
  safeSetText(form, "CHamod", modStr(abilityMod(abilityScores.cha)));

  // Initiative = DEX mod
  safeSetText(form, "Initiative", modStr(abilityMod(abilityScores.dex)), 14);

  // Combat stats
  safeSetText(form, "AC", String(character.armorClass), 16);
  safeSetText(form, "Speed", character.speed, 10);
  safeSetText(form, "HPMax", String(character.hitPoints));
  safeSetText(form, "HPCurrent", String(character.hitPoints));

  // Hit Dice
  const hitDie = HIT_DICE[character.class] ?? "d8";
  safeSetText(form, "HDTotal", String(character.level));
  safeSetText(form, "HD", `${character.level}${hitDie}`);

  // Saving throws (text values only; checkboxes deferred until after updateFieldAppearances)
  // OpenAI may return abbreviated keys ("dex") or full names ("Dexterity")
  const proficientSaves = new Set(
    character.savingThrows
      .map((s) => {
        const lower = s.toLowerCase();
        if (SAVE_ABILITY_ORDER.includes(lower as keyof AbilityScores))
          return lower;
        return SAVE_NAME_TO_KEY[s] ?? null;
      })
      .filter(Boolean) as (keyof AbilityScores)[]
  );

  for (const ability of SAVE_ABILITY_ORDER) {
    const mod = abilityMod(abilityScores[ability]);
    const isProficient = proficientSaves.has(ability);
    const total = isProficient ? mod + proficiencyBonus : mod;
    safeSetText(form, SAVE_FIELD[ability], modStr(total));
  }

  // Skills (text values only; checkboxes deferred)
  // Normalize to lowercase for case-insensitive matching against SKILL_ABILITY keys
  const proficientSkillsLower = new Set(
    character.skills.map((s) => s.toLowerCase())
  );

  for (const [skillName, abilityKey] of Object.entries(SKILL_ABILITY)) {
    const mod = abilityMod(abilityScores[abilityKey]);
    const isProficient = proficientSkillsLower.has(skillName.toLowerCase());
    const total = isProficient ? mod + proficiencyBonus : mod;
    safeSetText(form, SKILL_FIELD[skillName], modStr(total));
  }

  // Passive Perception
  const perceptionMod = abilityMod(abilityScores.wis);
  const perceptionProf = proficientSkillsLower.has("perception")
    ? proficiencyBonus
    : 0;
  safeSetText(form, "Passive", String(10 + perceptionMod + perceptionProf));

  // Weapons (up to 3 slots on the WotC sheet)
  const weapons = character.weapons ?? [];
  const wpnFields = [
    {
      name: "Wpn Name",
      atk: "Wpn1 AtkBonus",
      dmg: "Wpn1 Damage",
    },
    {
      name: "Wpn Name 2",
      atk: "Wpn2 AtkBonus ",
      dmg: "Wpn2 Damage ",
    },
    {
      name: "Wpn Name 3",
      atk: "Wpn3 AtkBonus  ",
      dmg: "Wpn3 Damage ",
    },
  ];

  for (let i = 0; i < Math.min(weapons.length, 3); i++) {
    const w = weapons[i];
    safeSetText(form, wpnFields[i].name, w.name);
    safeSetText(form, wpnFields[i].atk, modStr(w.attackBonus));
    safeSetText(
      form,
      wpnFields[i].dmg,
      `${w.damage}${w.damageBonus >= 0 ? "+" : ""}${w.damageBonus} ${w.damageType}`
    );
  }

  // Extra weapons beyond 3 go into the AttacksSpellcasting text area
  if (weapons.length > 3) {
    const extra = weapons
      .slice(3)
      .map(
        (w) =>
          `${w.name}: ${modStr(w.attackBonus)} to hit, ${w.damage}${w.damageBonus >= 0 ? "+" : ""}${w.damageBonus} ${w.damageType}`
      )
      .join("\n");
    safeSetText(form, "AttacksSpellcasting", extra, 8);
  }

  // Proficiencies & Languages
  safeSetText(form, "ProficienciesLang", character.proficiencies.join(", "), 8);

  // Equipment
  const equipmentList = character.equipment.map(formatNamedSummaryLine).join(", ");
  safeSetText(form, "Equipment", equipmentList, 8);

  // Features and Traits
  safeSetText(
    form,
    "Features and Traits",
    character.features.map(formatNamedSummaryLine).join("\n"),
    8
  );

  // Personality
  safeSetText(form, "PersonalityTraits ", character.traits.personalityTraits, 8);
  safeSetText(form, "Ideals", character.traits.ideals, 8);
  safeSetText(form, "Bonds", character.traits.bonds, 8);
  safeSetText(form, "Flaws", character.traits.flaws, 8);

  // --- Page 2: Backstory ---

  safeSetText(form, "Backstory", character.backstory, 8);

  // --- Page 3: Spellcasting ---

  if (character.spells && character.spells.length > 0) {
    // Spellcasting class header
    safeSetText(form, "Spellcasting Class 2", character.class);

    const castAbilityKey =
      SPELLCASTING_ABILITY[character.class] ??
      SUBCLASS_SPELLCASTING_ABILITY[character.subclass] ??
      null;

    if (castAbilityKey) {
      safeSetText(
        form,
        "SpellcastingAbility 2",
        ABILITY_TO_FULL[castAbilityKey]
      );
    }

    if (character.spellSaveDC != null) {
      safeSetText(form, "SpellSaveDC  2", String(character.spellSaveDC));
    }
    if (character.spellAttackBonus != null) {
      safeSetText(form, "SpellAtkBonus 2", modStr(character.spellAttackBonus));
    }

    // Spell slots per level
    if (character.spellSlots) {
      for (const slot of character.spellSlots) {
        const fieldName = SLOT_TOTAL_FIELD[slot.level];
        if (fieldName) {
          safeSetText(form, fieldName, String(slot.slots));
        }
      }
    }

    // Group spells by level
    const spellsByLevel: Record<number, string[]> = {};
    for (const spell of character.spells) {
      if (!spellsByLevel[spell.level]) spellsByLevel[spell.level] = [];
      spellsByLevel[spell.level].push(spell.name);
    }

    // Fill spell name fields
    for (const [levelStr, names] of Object.entries(spellsByLevel)) {
      const level = Number(levelStr);
      const fields = SPELL_FIELDS[level];
      if (!fields) continue;
      for (let i = 0; i < Math.min(names.length, fields.length); i++) {
        safeSetText(form, fields[i], names[i]);
      }
    }
  }

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  form.updateFieldAppearances(font);

  // --- Checkboxes: must run AFTER updateFieldAppearances to avoid being reset ---

  for (const ability of SAVE_ABILITY_ORDER) {
    safeCheckBox(pdf, form, SAVE_CHECKBOX[ability], proficientSaves.has(ability));
  }

  for (const skillName of Object.keys(SKILL_ABILITY)) {
    safeCheckBox(
      pdf,
      form,
      SKILL_CHECKBOX[skillName],
      proficientSkillsLower.has(skillName.toLowerCase())
    );
  }

  return pdf.save();
}
