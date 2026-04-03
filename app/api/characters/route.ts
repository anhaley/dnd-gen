import { NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { characters } from "@/lib/db/schema";
import { rowToSavedCharacter } from "@/lib/db/mappers";
import type { EnrichedCharacter } from "@/lib/schemas";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[characters] GET /api/characters user=%s", session.user.id);
    const rows = await db
      .select()
      .from(characters)
      .where(eq(characters.userId, session.user.id))
      .orderBy(desc(characters.savedAt));

    console.log("[characters] Returning %d characters", rows.length);
    return NextResponse.json(rows.map(rowToSavedCharacter));
  } catch (err) {
    console.error("GET /api/characters error:", err);
    return NextResponse.json(
      { error: "Failed to load characters" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[characters] POST /api/characters user=%s", session.user.id);
    const body: EnrichedCharacter = await request.json();

    const [row] = await db
      .insert(characters)
      .values({
        userId: session.user.id,
        name: body.name,
        race: body.race,
        raceVariant: body.raceVariant,
        class: body.class,
        subclass: body.subclass,
        level: body.level,
        background: body.background,
        alignment: body.alignment,
        hitPoints: body.hitPoints,
        armorClass: body.armorClass,
        armorClassBreakdown: body.armorClassBreakdown,
        speed: body.speed,
        proficiencyBonus: body.proficiencyBonus,
        spellAttackBonus: body.spellAttackBonus,
        spellSaveDC: body.spellSaveDC,
        backstory: body.backstory,
        abilityScores: body.abilityScores,
        savingThrows: body.savingThrows,
        skills: body.skills,
        proficiencies: body.proficiencies,
        weapons: body.weapons,
        equipment: body.equipment,
        features: body.features,
        spellSlots: body.spellSlots,
        spells: body.spells,
        traits: body.traits,
      })
      .returning();

    console.log("[characters] Saved character id=%s name=%s", row.id, row.name);
    return NextResponse.json(rowToSavedCharacter(row));
  } catch (err) {
    console.error("POST /api/characters error:", err);
    return NextResponse.json(
      { error: "Failed to save character" },
      { status: 500 }
    );
  }
}
