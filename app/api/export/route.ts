import { NextResponse } from "next/server";
import { fillCharacterSheet } from "@/lib/pdf";
import type { EnrichedCharacter } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    console.log("[export] POST /api/export");
    const body: EnrichedCharacter = await request.json();

    const pdfBytes = await fillCharacterSheet(body);

    const safeName = body.name.replace(/[^a-zA-Z0-9_-]/g, "_");

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeName}.pdf"`,
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to generate PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
