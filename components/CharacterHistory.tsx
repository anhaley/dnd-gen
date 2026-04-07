"use client";

import { SavedCharacter } from "@/lib/schemas";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";

interface CharacterHistoryProps {
  characters: SavedCharacter[];
  onLoad: (character: SavedCharacter) => void;
  onDelete: (id: string) => void;
  activeId?: string;
}

export default function CharacterHistory({
  characters,
  onLoad,
  onDelete,
  activeId,
}: CharacterHistoryProps) {
  if (characters.length === 0) {
    return (
      <div className="px-2 py-8 text-center text-sm text-muted">
        No saved characters yet.
        <br />
        Generate one to get started!
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {characters.map((char) => (
        <div
          key={char.id}
          className={cn(
            "group flex cursor-pointer items-start justify-between rounded-lg border px-3 py-2.5 transition",
            activeId === char.id
              ? "border-primary/50 bg-primary/10"
              : "border-transparent hover:border-border hover:bg-surface-muted"
          )}
          onClick={() => onLoad(char)}
        >
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-foreground">{char.name}</p>
            <p className="truncate text-xs text-muted">
              Lvl {char.level} {char.race} {char.class}
            </p>
          </div>
          <Button
            type="button"
            variant="danger"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(char.id);
            }}
            className="ml-2 mt-0.5 shrink-0 opacity-0 transition group-hover:opacity-100"
            aria-label={`Delete ${char.name}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                clipRule="evenodd"
              />
            </svg>
          </Button>
        </div>
      ))}
    </div>
  );
}
