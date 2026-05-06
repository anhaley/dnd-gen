import type { Character, EnrichedCharacter } from "@/lib/schemas";

/** Remove server-derived fields so the LLM sees only raw Character weapon rows. */
export function stripEnrichment(enriched: EnrichedCharacter): Character {
  const { spellAttackBonus, spellSaveDC, weapons: enrichedWeapons, ...rest } =
    enriched;
  void spellAttackBonus;
  void spellSaveDC;

  const weapons =
    enrichedWeapons == null || enrichedWeapons.length === 0
      ? null
      : enrichedWeapons.map((w) => ({
          name: w.name,
          damage: w.damage,
          damageType: w.damageType,
          properties: w.properties,
        }));

  return {
    ...rest,
    weapons,
  };
}
