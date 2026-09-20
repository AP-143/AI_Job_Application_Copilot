"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (!data.session) {
      setError(
        "Akun dibuat, tapi belum ada sesi login. Cek email kamu untuk konfirmasi, lalu coba masuk lagi."
      );
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">
          Job Application Copilot
        </p>
        <h1 className="mt-3 font-display text-3xl text-ink">
          {mode === "signin" ? "Masuk" : "Daftar"}
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="text-sm text-ink-soft">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-ink outline-none focus:border-ink-soft"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm text-ink-soft">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full border border-line bg-transparent px-3 py-2 text-ink outline-none focus:border-ink-soft"
            />
          </div>

          {error && (
            <p className="border-l-2 border-accent pl-3 text-sm text-accent">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full border border-ink bg-ink px-3 py-2 text-sm font-medium text-surface transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Memproses…" : mode === "signin" ? "Masuk" : "Daftar"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 text-sm text-ink-soft underline underline-offset-4 hover:text-ink"
        >
          {mode === "signin"
            ? "Belum punya akun? Daftar"
            : "Sudah punya akun? Masuk"}
        </button>
      </div>
    </main>
  );
}
