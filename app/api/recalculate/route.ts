import { NextResponse } from "next/server";
import { enrichCharacter } from "@/lib/combat";
import type { Character, EnrichedCharacter } from "@/lib/schemas";

function stripEnrichment(enriched: EnrichedCharacter): Character {
  const weapons = (enriched.weapons ?? []).map(
    ({ attackBonus: _, damageBonus: __, ...base }) => base
  );

  const { spellAttackBonus: _, spellSaveDC: __, ...rest } = enriched;

  return {
    ...rest,
    weapons: weapons.length > 0 ? weapons : null,
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
