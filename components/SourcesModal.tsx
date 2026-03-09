"use client";

import { useEffect, useRef } from "react";

const SOURCES = [
  "Player's Handbook",
  "Dungeon Master's Guide",
  "Xanathar's Guide to Everything",
  "Tasha's Cauldron of Everything",
  "Mordenkainen Presents: Monsters of the Multiverse",
  "Sword Coast Adventurer's Guide",
  "Elemental Evil Player's Companion",
  "Fizban's Treasury of Dragons",
  "Curse of Strahd",
];

interface SourcesModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SourcesModal({ open, onClose }: SourcesModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="max-w-md rounded-xl border border-amber-900/30 bg-stone-900 p-0 text-stone-200 shadow-2xl backdrop:bg-black/60"
    >
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-amber-200">
            Included Sources
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-stone-500 transition hover:text-stone-300"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
        <p className="mb-4 text-sm text-stone-400">
          Races, classes, subclasses, and backgrounds are drawn from these D&D
          5E (2014) sourcebooks:
        </p>
        <ul className="space-y-2">
          {SOURCES.map((name) => (
            <li
              key={name}
              className="flex items-center gap-2 text-sm text-stone-300"
            >
              <span className="text-amber-700/60">&#x2022;</span>
              {name}
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}
