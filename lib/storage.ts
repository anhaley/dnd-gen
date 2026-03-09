import { EnrichedCharacter, SavedCharacter } from "./schemas";

const STORAGE_KEY = "dnd-gen-characters";

export function saveCharacter(character: EnrichedCharacter): SavedCharacter {
  const saved: SavedCharacter = {
    ...character,
    id: crypto.randomUUID(),
    savedAt: Date.now(),
  };
  const existing = getCharacters();
  existing.unshift(saved);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  }
  return saved;
}

export function getCharacters(): SavedCharacter[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as SavedCharacter[];
  } catch {
    return [];
  }
}

export function getCharacter(id: string): SavedCharacter | undefined {
  return getCharacters().find((c) => c.id === id);
}

export function deleteCharacter(id: string): void {
  const characters = getCharacters().filter((c) => c.id !== id);
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
  }
}
