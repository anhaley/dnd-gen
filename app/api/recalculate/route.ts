import { NextResponse } from "next/server";
import { enrichCharacter } from "@/lib/combat";
import { stripEnrichment } from "@/lib/strip-character";
import type { EnrichedCharacter } from "@/lib/schemas";

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
