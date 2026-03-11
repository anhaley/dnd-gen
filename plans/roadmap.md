# D&D Character Generator — Roadmap

## Completed

- [x] Scaffold Next.js project with TypeScript + Tailwind CSS, install openai and zod
- [x] Set up .env.local and .env.example with OPENAI_API_KEY
- [x] Create lib/openai.ts (client), lib/schemas.ts (Zod character schema + TS types), lib/prompts.ts (system + user prompt builder)
- [x] Create app/api/generate/route.ts — validate input, call OpenAI with JSON mode, validate and return character
- [x] Build CharacterForm with dropdowns for race, class, subclass, level, background + random button
- [x] Build CharacterSheet to display generated character data in a styled card
- [x] Build CharacterHistory sidebar/panel listing saved characters with load/delete actions
- [x] Wire up page.tsx with form submission, loading spinner, error handling, character display, and history panel
- [x] Dark fantasy-themed styling, error states, .env.example, and README for onboarding
- [x] Expand sourcebooks (XGtE, TCoE, MotM, SCAG, EEPC, Fizban's, CoS, DMG)
- [x] Race variant dropdown (subraces)
- [x] Spell slots display grouped by level, with Warlock Pact Magic handling
- [x] Server-side computed spell attack bonus and spell save DC
- [x] Server-side computed weapon attack/damage bonuses with structured weapon data
- [x] Unarmed strike always included, with Monk Martial Arts scaling
- [x] Sources modal showing included sourcebooks
- [x] Vitest unit test suite (combat, schemas, prompts, dnd-data, db-schema)
- [x] Deploy to Vercel
- [x] Database persistence — Neon Postgres via Vercel Marketplace with Drizzle ORM, replacing localStorage entirely

## Up Next

### User accounts and authentication
Add sign-in so characters are tied to a user. Neon Auth (Better Auth-based, built into the database) or NextAuth.js are leading options.

## Backlog

### PDF export
Export characters to PDF via `pdf-lib` using the official WotC form-fillable character sheet. Server-side generation, form stays editable.

### Multiple PDF templates
Custom-designed PDF templates beyond the official WotC sheet.

### Character image generation
Generate character portraits via DALL-E or similar image model.

### Sharing characters via URL
Generate shareable links for individual characters.
