import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const characters = pgTable("characters", {
  id: uuid("id").primaryKey().defaultRandom(),
  savedAt: timestamp("saved_at", { withTimezone: true }).notNull().defaultNow(),

  name: text("name").notNull(),
  race: text("race").notNull(),
  raceVariant: text("race_variant"),
  class: text("class").notNull(),
  subclass: text("subclass").notNull(),
  level: integer("level").notNull(),
  background: text("background").notNull(),
  alignment: text("alignment").notNull(),

  hitPoints: integer("hit_points").notNull(),
  armorClass: integer("armor_class").notNull(),
  armorClassBreakdown: text("armor_class_breakdown").notNull(),
  speed: text("speed").notNull(),
  proficiencyBonus: integer("proficiency_bonus").notNull(),
  spellAttackBonus: integer("spell_attack_bonus"),
  spellSaveDC: integer("spell_save_dc"),

  backstory: text("backstory").notNull(),

  abilityScores: jsonb("ability_scores").notNull(),
  savingThrows: jsonb("saving_throws").notNull(),
  skills: jsonb("skills").notNull(),
  proficiencies: jsonb("proficiencies").notNull(),
  weapons: jsonb("weapons"),
  equipment: jsonb("equipment").notNull(),
  features: jsonb("features").notNull(),
  spellSlots: jsonb("spell_slots"),
  spells: jsonb("spells"),
  traits: jsonb("traits").notNull(),
});
