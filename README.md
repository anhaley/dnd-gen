# D&D 5E Character Generator

Generate D&D 5th Edition characters and NPCs instantly using AI. Configure race, class, subclass, level, and background — or let the generator surprise you with a fully random character.

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Add your OpenAI API key:**

   Copy `.env.example` to `.env.local` and replace the placeholder with your key:

   ```bash
   cp .env.example .env.local
   ```

   Get an API key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys).

3. **Run the dev server:**

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- **Next.js** (App Router) — React frontend + API routes
- **TypeScript** — type-safe character schema
- **Tailwind CSS** — dark fantasy-themed UI
- **OpenAI API** (`gpt-4o-mini`) — AI-powered character generation
- **Zod** — runtime schema validation

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
2. The app sends your choices to a Next.js API route, which calls the OpenAI API with a structured prompt.
3. The AI returns a complete character as JSON, validated against a strict Zod schema.
4. The character is displayed and automatically saved to your browser's localStorage.
5. Load or delete past characters from the history sidebar.
