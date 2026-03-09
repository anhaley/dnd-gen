"use client";

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-amber-900/30 border-t-amber-500" />
      <p className="mt-4 text-sm text-stone-400 animate-pulse">
        Rolling the dice...
      </p>
    </div>
  );
}
