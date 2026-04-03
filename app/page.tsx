"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import CharacterForm from "@/components/CharacterForm";
import CharacterSheet from "@/components/CharacterSheet";
import CharacterHistory from "@/components/CharacterHistory";
import LoadingSpinner from "@/components/LoadingSpinner";
import SourcesModal from "@/components/SourcesModal";
import {
  EnrichedCharacter,
  GenerateInput,
  SavedCharacter,
} from "@/lib/schemas";

export default function Home() {
  const { data: session, status } = useSession();
  const isSignedIn = status === "authenticated";

  const sheetRef = useRef<HTMLElement>(null);

  const [character, setCharacter] = useState<
    SavedCharacter | EnrichedCharacter | null
  >(null);
  const [savedCharacters, setSavedCharacters] = useState<SavedCharacter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSources, setShowSources] = useState(false);

  const isUnsaved = character !== null && !("id" in character);

  useEffect(() => {
    if (character && !isLoading) {
      sheetRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [character, isLoading]);

  useEffect(() => {
    if (!isSignedIn) {
      setSavedCharacters([]);
      return;
    }
    fetch("/api/characters")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setSavedCharacters(data))
      .catch(() => {});
  }, [isSignedIn]);

  async function refreshHistory() {
    if (!isSignedIn) return;
    try {
      const res = await fetch("/api/characters");
      if (res.ok) setSavedCharacters(await res.json());
    } catch {}
  }

  const handleGenerate = useCallback(async (input: GenerateInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      const data: EnrichedCharacter = await res.json();
      setCharacter(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  async function handleSave() {
    if (!character) return;

    try {
      const res = await fetch("/api/characters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(character),
      });

      if (res.ok) {
        const saved: SavedCharacter = await res.json();
        setCharacter(saved);
        await refreshHistory();
      }
    } catch {}
  }

  function handleLoadCharacter(char: SavedCharacter) {
    setCharacter(char);
    setError(null);
    setShowHistory(false);
  }

  async function handleDeleteCharacter(id: string) {
    try {
      await fetch(`/api/characters/${id}`, { method: "DELETE" });
      await refreshHistory();
      if (character && "id" in character && character.id === id) {
        setCharacter(null);
      }
    } catch {}
  }

  return (
    <div className="flex min-h-screen">
      {/* Mobile history toggle — only when signed in */}
      {isSignedIn && (
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="fixed top-4 left-4 z-30 rounded-lg border border-amber-900/30 bg-stone-900/90 p-2 text-amber-400 backdrop-blur-sm transition hover:bg-stone-800 lg:hidden"
          aria-label="Toggle history"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path
              fillRule="evenodd"
              d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}

      {/* History sidebar — only when signed in */}
      {isSignedIn && (
        <aside
          className={`fixed inset-y-0 left-0 z-20 w-72 transform border-r border-amber-900/20 bg-stone-950/95 backdrop-blur-sm transition-transform duration-200 lg:relative lg:translate-x-0 ${
            showHistory ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-amber-900/20 px-4 py-4">
              <h2 className="font-serif text-lg font-semibold text-amber-200">
                History
              </h2>
              <span className="text-xs text-stone-500">
                {savedCharacters.length} saved
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <CharacterHistory
                characters={savedCharacters}
                onLoad={handleLoadCharacter}
                onDelete={handleDeleteCharacter}
                activeId={character && "id" in character ? character.id : undefined}
              />
            </div>
          </div>
        </aside>
      )}

      {/* Overlay for mobile sidebar */}
      {isSignedIn && showHistory && (
        <div
          className="fixed inset-0 z-10 bg-black/50 lg:hidden"
          onClick={() => setShowHistory(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 px-4 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          {/* Auth header */}
          <div className="mb-4 flex justify-end gap-3 text-sm">
            {isSignedIn ? (
              <>
                <span className="text-stone-400">{session.user?.email}</span>
                <button
                  onClick={() => signOut()}
                  className="text-amber-400 transition hover:text-amber-300"
                >
                  Sign out
                </button>
              </>
            ) : (
              status !== "loading" && (
                <Link
                  href="/signin"
                  className="text-amber-400 transition hover:text-amber-300"
                >
                  Sign in
                </Link>
              )
            )}
          </div>

          {/* Title */}
          <header className="mb-8 text-center">
            <h1 className="font-serif text-4xl font-bold tracking-tight text-amber-100 sm:text-5xl">
              D&D Character Generator
            </h1>
            <p className="mt-2 text-stone-400">
              Create a 5th Edition (2014) character in seconds
            </p>
            <button
              onClick={() => setShowSources(true)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-amber-900/30 px-3 py-1.5 text-sm text-stone-400 transition hover:border-amber-700/40 hover:text-amber-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06V3.04a.75.75 0 00-.546-.721A9.006 9.006 0 0015 2a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3a9.006 9.006 0 00-2.454.319A.75.75 0 002 4.04v12.02a.75.75 0 00.954.721A7.462 7.462 0 015 16.5c1.578 0 3.05.488 4.25 1.32V4.065z" />
              </svg>
              Sources
            </button>
          </header>

          <SourcesModal
            open={showSources}
            onClose={() => setShowSources(false)}
          />

          {/* Form card */}
          <section className="mb-8 rounded-xl border border-amber-900/20 bg-stone-900/50 p-5 sm:p-6">
            <CharacterForm onGenerate={handleGenerate} isLoading={isLoading} />
          </section>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-800/40 bg-red-950/30 px-4 py-3 text-sm text-red-300">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}

          {/* Loading */}
          {isLoading && <LoadingSpinner />}

          {/* Character sheet */}
          {character && !isLoading && (
            <>
              <section
                ref={sheetRef}
                className="rounded-xl border border-amber-900/20 bg-stone-900/50 p-5 sm:p-6"
              >
                <CharacterSheet character={character} />
              </section>

              {!isSignedIn && (
                <p className="mt-4 text-center text-sm text-stone-500">
                  <Link
                    href="/signin"
                    className="text-amber-400 hover:text-amber-300"
                  >
                    Sign in
                  </Link>{" "}
                  to save characters and build your collection.
                </p>
              )}
            </>
          )}
        </div>
      </main>

      {/* Floating save button */}
      {isSignedIn && !isLoading && isUnsaved && (
        <button
          onClick={handleSave}
          className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full bg-amber-700 px-5 py-3 text-sm font-semibold text-stone-100 shadow-lg shadow-black/40 transition hover:bg-amber-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          Save this character
        </button>
      )}
    </div>
  );
}
