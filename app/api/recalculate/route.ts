import { NextResponse } from "next/server";
import { enrichCharacter } from "@/lib/combat";
import type { Character, EnrichedCharacter } from "@/lib/schemas";

function stripEnrichment(enriched: EnrichedCharacter): Character {
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

export async function POST(request: Request) {
  try {
    console.log("[recalculate] POST /api/recalculate");
    const body: EnrichedCharacter = await request.json();
    const base = stripEnrichment(body);
    const enriched = enrichCharacter(base);
    return NextResponse.json(enriched);
  } catch (err) {
    console.error("Recalculate error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to recalculate";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
