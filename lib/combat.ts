import {
  SPELLCASTING_ABILITY,
  SUBCLASS_SPELLCASTING_ABILITY,
} from "./dnd-data";
import type {
  Character,
  AbilityScores,
  EnrichedWeapon,
  EnrichedCharacter,
} from "./schemas";

type AbilityKey = keyof AbilityScores;

const CANONICAL_SAVES: Record<string, string> = {
  str: "Strength",
  strength: "Strength",
  dex: "Dexterity",
  dexterity: "Dexterity",
  con: "Constitution",
  constitution: "Constitution",
  int: "Intelligence",
  intelligence: "Intelligence",
  wis: "Wisdom",
  wisdom: "Wisdom",
  cha: "Charisma",
  charisma: "Charisma",
};

const CANONICAL_SKILLS: Record<string, string> = {
  acrobatics: "Acrobatics",
  "animal handling": "Animal Handling",
  arcana: "Arcana",
  athletics: "Athletics",
  deception: "Deception",
  history: "History",
  insight: "Insight",
  intimidation: "Intimidation",
  investigation: "Investigation",
  medicine: "Medicine",
  nature: "Nature",
  perception: "Perception",
  performance: "Performance",
  persuasion: "Persuasion",
  religion: "Religion",
  "sleight of hand": "Sleight of Hand",
  stealth: "Stealth",
  survival: "Survival",
};

export function normalizeSavingThrows(saves: string[]): string[] {
  return saves.map((s) => CANONICAL_SAVES[s.toLowerCase().trim()] ?? s);
}

export function normalizeSkills(skills: string[]): string[] {
  return skills.map((s) => CANONICAL_SKILLS[s.toLowerCase().trim()] ?? s);
}

const RANGED_WEAPONS = new Set([
  "longbow",
  "shortbow",
  "light crossbow",
  "heavy crossbow",
  "hand crossbow",
  "dart",
  "sling",
  "blowgun",
  "net",
]);

function abilityMod(score: number): number {
  return Math.floor((score - 10) / 2);
}

function isRanged(weapon: { name: string; properties: string[] }): boolean {
  if (weapon.properties.some((p) => p.toLowerCase() === "ammunition")) {
    return true;
  }
  return RANGED_WEAPONS.has(weapon.name.toLowerCase());
}

function isFinesse(properties: string[]): boolean {
  return properties.some((p) => p.toLowerCase() === "finesse");
}

function weaponAbilityMod(
  weapon: { name: string; properties: string[] },
  scores: AbilityScores
): number {
  const strMod = abilityMod(scores.str);
  const dexMod = abilityMod(scores.dex);

  if (isFinesse(weapon.properties)) {
    return Math.max(strMod, dexMod);
  }
  return isRanged(weapon) ? dexMod : strMod;
}

function monkMartialArtsDie(level: number): string {
  if (level >= 17) return "1d10";
  if (level >= 11) return "1d8";
  if (level >= 5) return "1d6";
  return "1d4";
}

function buildUnarmedStrike(
  className: string,
  level: number,
  scores: AbilityScores,
  proficiencyBonus: number
): EnrichedWeapon {
  const isMonk = className === "Monk";
  const strMod = abilityMod(scores.str);
  const dexMod = abilityMod(scores.dex);
  const mod = isMonk ? Math.max(strMod, dexMod) : strMod;
  const damage = isMonk ? monkMartialArtsDie(level) : "1";

  return {
    name: "Unarmed Strike",
    damage,
    damageType: "bludgeoning",
    properties: isMonk ? ["Martial Arts"] : [],
    attackBonus: proficiencyBonus + mod,
    damageBonus: mod,
  };
}

function getSpellcastingAbility(
  className: string,
  subclass: string
): AbilityKey | null {
  if (className in SPELLCASTING_ABILITY) {
    return SPELLCASTING_ABILITY[className];
  }
  if (subclass in SUBCLASS_SPELLCASTING_ABILITY) {
    return SUBCLASS_SPELLCASTING_ABILITY[subclass];
  }
  return null;
}

export function enrichCharacter(character: Character): EnrichedCharacter {
  character = {
    ...character,
    savingThrows: normalizeSavingThrows(character.savingThrows),
    skills: normalizeSkills(character.skills),
  };

  const { proficiencyBonus, abilityScores } = character;

  const castingAbility = getSpellcastingAbility(
    character.class,
    character.subclass
  );

  let spellAttackBonus: number | null = null;
  let spellSaveDC: number | null = null;

  if (castingAbility && character.spells && character.spells.length > 0) {
    const mod = abilityMod(abilityScores[castingAbility]);
    spellAttackBonus = proficiencyBonus + mod;
    spellSaveDC = 8 + proficiencyBonus + mod;
  }

  const enrichedWeapons: EnrichedWeapon[] = (character.weapons ?? []).map(
    (w) => {
      const mod = weaponAbilityMod(w, abilityScores);
      return {
        ...w,
        attackBonus: proficiencyBonus + mod,
        damageBonus: mod,
      };
    }
  );

  const hasUnarmed = enrichedWeapons.some(
    (w) => w.name.toLowerCase() === "unarmed strike"
  );
  if (!hasUnarmed) {
    enrichedWeapons.push(
      buildUnarmedStrike(
        character.class,
        character.level,
        abilityScores,
        proficiencyBonus
      )
    );
  }

  return {
    ...character,
    weapons: enrichedWeapons,
    spellAttackBonus,
    spellSaveDC,
  };
}
