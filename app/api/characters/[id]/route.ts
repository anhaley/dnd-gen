import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { characters } from "@/lib/db/schema";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("[characters] DELETE /api/characters/%s", id);
    await db.delete(characters).where(eq(characters.id, id));
    console.log("[characters] Deleted character id=%s", id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/characters/[id] error:", err);
    return NextResponse.json(
      { error: "Failed to delete character" },
      { status: 500 }
    );
  }
}
