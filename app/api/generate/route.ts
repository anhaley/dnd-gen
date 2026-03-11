import { NextResponse } from "next/server";
import { zodResponseFormat } from "openai/helpers/zod";
import openai from "@/lib/openai";
import { GenerateInputSchema, CharacterSchema } from "@/lib/schemas";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompts";
import { enrichCharacter } from "@/lib/combat";

export async function POST(request: Request) {
  try {
    console.log("[generate] POST /api/generate");
    const body = await request.json();
    const input = GenerateInputSchema.parse(body);
    const userPrompt = buildUserPrompt(input);

    console.log("[generate] User prompt:", userPrompt);

    const completion = await openai.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: zodResponseFormat(CharacterSchema, "character"),
      temperature: 0.9,
    });

    const message = completion.choices[0]?.message;
    console.log("[generate] Raw OpenAI response:", message?.content);
    console.log("[generate] Usage:", JSON.stringify(completion.usage));

    if (message?.refusal) {
      return NextResponse.json(
        { error: `Model refused: ${message.refusal}` },
        { status: 422 }
      );
    }

    const character = message?.parsed;
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
    console.error("Generate error:", err);

    const message =
      err instanceof Error ? err.message : "Failed to generate character";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
