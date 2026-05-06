import { NextResponse } from "next/server";
import { zodResponseFormat } from "openai/helpers/zod";
import openai from "@/lib/openai";
import {
  CharacterSchema,
  TweakInputSchema,
  type EnrichedCharacter,
} from "@/lib/schemas";
import { TWEAK_SYSTEM_PROMPT, buildTweakUserPrompt } from "@/lib/prompts";
import { enrichCharacter } from "@/lib/combat";
import { stripEnrichment } from "@/lib/strip-character";

export async function POST(request: Request) {
  try {
    console.log("[tweak] POST /api/tweak");
    const body = await request.json();
    const { message, character: rawCharacter } = TweakInputSchema.parse(body);

    const fromClient = rawCharacter as EnrichedCharacter;
    const stripped = stripEnrichment(fromClient);
    CharacterSchema.parse(stripped);

    const userPrompt = buildTweakUserPrompt(stripped, message);
    const useFullModel = !stripped.level || stripped.level >= 12;
    const model = useFullModel ? "gpt-4o" : "gpt-4o-mini";
    console.log("[tweak] Model:", model, "level:", stripped.level);

    const completion = await openai.chat.completions.parse({
      model,
      messages: [
        { role: "system", content: TWEAK_SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: zodResponseFormat(CharacterSchema, "character"),
      temperature: 0.7,
    });

    const choice = completion.choices[0];
    const msg = choice?.message;

    if (choice?.finish_reason === "length") {
      console.warn("[tweak] Response truncated due to token limit");
    }

    if (msg?.refusal) {
      return NextResponse.json(
        { error: `Model refused: ${msg.refusal}` },
        { status: 422 }
      );
    }

    const character = msg?.parsed;
    if (!character) {
      return NextResponse.json(
        { error: "No response from OpenAI" },
        { status: 502 }
      );
    }

    if (character.raceVariant === "null") {
      character.raceVariant = null;
    }

    const enriched = enrichCharacter(character);
    return NextResponse.json(enriched);
  } catch (err) {
    console.error("Tweak error:", err);
    const messageText =
      err instanceof Error ? err.message : "Failed to tweak character";
    return NextResponse.json({ error: messageText }, { status: 500 });
  }
}
