"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          name: name.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create account");
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created but sign-in failed. Please sign in manually.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center font-serif text-3xl font-bold text-amber-100">
          Create Account
        </h1>
        <p className="mb-8 text-center text-sm text-stone-400">
          Sign up to save and manage your characters
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
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-stone-300">
              Name <span className="text-stone-500">(optional)</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-amber-900/30 bg-stone-800/50 px-3 py-2 text-sm text-stone-100 outline-none transition focus:border-amber-600/50 focus:ring-1 focus:ring-amber-600/30"
              placeholder="Your name"
            />
          </div>

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
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-amber-900/30 bg-stone-800/50 px-3 py-2 text-sm text-stone-100 outline-none transition focus:border-amber-600/50 focus:ring-1 focus:ring-amber-600/30"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-stone-300">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-amber-900/30 bg-stone-800/50 px-3 py-2 text-sm text-stone-100 outline-none transition focus:border-amber-600/50 focus:ring-1 focus:ring-amber-600/30"
              placeholder="Re-enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-amber-700 px-4 py-2.5 text-sm font-semibold text-stone-100 transition hover:bg-amber-600 disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          Already have an account?{" "}
          <Link href="/signin" className="text-amber-400 hover:text-amber-300">
            Sign in
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
