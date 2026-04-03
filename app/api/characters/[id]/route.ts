import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { characters } from "@/lib/db/schema";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    console.log("[characters] DELETE /api/characters/%s user=%s", id, session.user.id);
    await db
      .delete(characters)
      .where(and(eq(characters.id, id), eq(characters.userId, session.user.id)));
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
