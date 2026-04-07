# D&D 5E Character Generator

Generate D&D 5th Edition characters and NPCs instantly using AI. Configure race, class, subclass, level, and background — or let the generator surprise you with a fully random character.

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Environment variables:**

   Copy `.env.example` to `.env.local` and fill in values:

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Purpose |
   |----------|---------|
   | `OPENAI_API_KEY` | Required for `/api/generate`. [Get a key](https://platform.openai.com/api-keys). |
   | `DATABASE_URL` | Postgres (e.g. Neon) — required for saving characters when signed in. |
   | `AUTH_SECRET` | Secret for NextAuth session signing — use `openssl rand -base64 32`. |

3. **Run the dev server:**

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- **Next.js** (App Router) — React frontend + API routes
- **TypeScript** — type-safe character schema
- **Tailwind CSS** — dark fantasy-themed UI
- **OpenAI API** — character generation uses **`gpt-4o`** for level 12+ and when level is unspecified (e.g. random); **`gpt-4o-mini`** for levels 1–11 when level is set
- **Zod** — runtime schema validation (including structured output from the API)
- **NextAuth** — sign-in for cloud character storage
- **Drizzle ORM** + **Neon** (Postgres) — persisted characters per user
- **pdf-lib** — server-side PDF export (official WotC form-fillable character sheet template)

## Tests

```bash
npm test
```

## Included Sourcebooks

Races, classes, subclasses, and backgrounds are drawn from:

- **Player's Handbook** (PHB)
- **Dungeon Master's Guide** (DMG)
- **Xanathar's Guide to Everything** (XGtE)
- **Tasha's Cauldron of Everything** (TCoE)
- **Mordenkainen Presents: Monsters of the Multiverse** (MotM)
- **Sword Coast Adventurer's Guide** (SCAG)
- **Elemental Evil Player's Companion** (EEPC)
- **Fizban's Treasury of Dragons**
- **Curse of Strahd**

## How It Works

1. Pick your constraints (race, race variant, class, subclass, level, background) or hit **Fully Random**.
2. The app sends your choices to a Next.js API route, which calls the OpenAI API with a structured system prompt (including spell-count hints when class/level allow it).
3. The AI returns a complete character as JSON, validated against a strict Zod schema, then enriched (e.g. weapon bonuses, spell DCs).
4. The character is shown on an editable sheet. **Export to PDF** fills the bundled WotC-style form-fillable sheet server-side.
5. **Signed-in users:** characters are saved to the database and listed in the **History** sidebar. **Anonymous users:** generation works; persistence is session-only (no cloud save).
