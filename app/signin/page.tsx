"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Alert, Button, Card, Input, linkButtonClass } from "@/components/ui";

const labelClass = "mb-1.5 block text-sm font-medium text-foreground/85";

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
        <h1 className="mb-2 text-center font-serif text-3xl font-bold text-heading">
          Sign In
        </h1>
        <p className="mb-8 text-center text-sm text-muted">
          Sign in to save your generated characters
        </p>

        <Card className="space-y-5 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <Alert>{error}</Alert>}

            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-sm"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-muted">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className={linkButtonClass}>
            Sign up
          </Link>
        </p>

        <p className="mt-3 text-center">
          <Link
            href="/"
            className={cn(linkButtonClass, "text-sm text-muted hover:text-foreground/80")}
          >
            ← Back to generator
          </Link>
        </p>
      </div>
    </div>
  );
}
