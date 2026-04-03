"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center font-serif text-3xl font-bold text-amber-100">
          Sign In
        </h1>
        <p className="mb-8 text-center text-sm text-stone-400">
          Sign in to save your generated characters
        </p>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-amber-900/20 bg-stone-900/50 p-6 space-y-5"
        >
          {error && (
            <div className="rounded-lg border border-red-800/40 bg-red-950/30 px-4 py-2.5 text-sm text-red-300">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-stone-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-amber-900/30 bg-stone-800/50 px-3 py-2 text-sm text-stone-100 outline-none transition focus:border-amber-600/50 focus:ring-1 focus:ring-amber-600/30"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-stone-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-amber-900/30 bg-stone-800/50 px-3 py-2 text-sm text-stone-100 outline-none transition focus:border-amber-600/50 focus:ring-1 focus:ring-amber-600/30"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-semibold text-stone-100 transition hover:bg-amber-600 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-amber-400 hover:text-amber-300">
            Sign up
          </Link>
        </p>

        <p className="mt-3 text-center">
          <Link href="/" className="text-sm text-stone-500 hover:text-stone-400">
            ← Back to generator
          </Link>
        </p>
      </div>
    </div>
  );
}
