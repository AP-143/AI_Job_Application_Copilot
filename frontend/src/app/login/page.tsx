"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function Brand({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden="true"
        className={`relative grid h-10 w-10 place-items-center border ${
          inverted ? "border-[rgb(244_240_232_/_0.34)]" : "border-ink bg-surface"
        }`}
      >
        <span className="h-3 w-3 border border-[var(--copper)] bg-[var(--copper)]" />
        <span className="absolute bottom-1 left-1 h-1 w-1 bg-[var(--cobalt)]" />
      </span>
      <span className="leading-none">
        <span className="block font-display text-xl">Application</span>
        <span className={`mt-1 block font-mono text-[9px] font-semibold uppercase tracking-[0.2em] ${inverted ? "text-[rgb(244_240_232_/_0.65)]" : "text-ink-soft"}`}>
          Desk
        </span>
      </span>
    </div>
  );
}

function DossierObject() {
  return (
    <div aria-hidden="true" className="dossier-stage relative mt-4 w-full max-w-sm">
      <div className="dossier-stack motion-float">
        <div className="dossier-sheet dossier-sheet--back" />
        <div className="dossier-sheet dossier-sheet--middle" />
        <div className="dossier-sheet dossier-sheet--front">
          <div className="relative z-10 flex h-full flex-col justify-between p-[13%] text-ink">
            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              Career record
            </span>
            <span className="font-display text-4xl leading-[0.87] tracking-[-0.05em]">
              A clearer<br />next move.
            </span>
          </div>
          <span className="dossier-stamp">START</span>
          <span className="dossier-orbit" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
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
        "Akun dibuat, tetapi belum ada sesi masuk. Cek email untuk konfirmasi lalu masuk lagi."
      );
      return;
    }

    router.push("/");
    router.refresh();
  }

  const isSignin = mode === "signin";

  return (
    <main className="min-h-[100svh] bg-paper text-ink lg:grid lg:grid-cols-[minmax(0,1.06fr)_minmax(32rem,0.94fr)]">
      <section className="relative hidden min-h-[100svh] overflow-hidden bg-[var(--night)] text-[var(--paper)] lg:flex lg:flex-col lg:p-10 xl:p-14">
        <div className="absolute inset-0 hairline-grid opacity-25" aria-hidden="true" />
        <div className="relative z-10"><Brand inverted /></div>

        <div className="relative z-10 mt-auto max-w-xl pt-20">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--copper-soft)]">
            Global job search, on your terms
          </p>
          <h2 className="mt-5 font-display text-5xl leading-[0.93] tracking-[-0.05em] text-[var(--paper)] xl:text-6xl">
            Pencarian yang lebih terarah.
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-[rgb(244_240_232_/_0.7)]">
            Susun profil, cari peluang, lalu tetap buat keputusan dan kirim lamaran sendiri.
          </p>

          <div className="mt-8 grid max-w-md grid-cols-2 border-y border-[rgb(244_240_232_/_0.2)] py-5">
            <div className="border-r border-[rgb(244_240_232_/_0.2)] pr-5">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--copper-soft)]">01</span>
              <p className="mt-2 text-sm text-[var(--paper)]">Bangun dossier</p>
            </div>
            <div className="pl-5">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--copper-soft)]">02</span>
              <p className="mt-2 text-sm text-[var(--paper)]">Temukan lowongan</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 -mb-24 mt-4 ml-auto w-[82%] xl:w-[74%]">
          <DossierObject />
        </div>
      </section>

      <section className="flex min-h-[100svh] items-center justify-center px-4 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden"><Brand /></div>

          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
            {isSignin ? "Welcome back" : "Start your desk"}
          </p>
          <h1 className="mt-4 font-display text-5xl leading-[0.93] tracking-[-0.05em] text-ink sm:text-6xl">
            {isSignin ? "Masuk ke dossier kamu." : "Buat ruang kerja kamu."}
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-6 text-ink-soft">
            {isSignin
              ? "Lanjutkan pencarian dengan konteks yang sudah kamu susun."
              : "Simpan profil dan preferensi pencarian dalam satu tempat yang rapi."}
          </p>

          <form onSubmit={handleSubmit} className="mt-9 border-t border-line pt-7" aria-label={isSignin ? "Form masuk" : "Form pendaftaran"}>
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="text-sm font-semibold text-ink">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nama@email.com"
                  className="mt-2 min-h-12 w-full border border-line bg-surface px-4 text-sm text-ink placeholder:text-ink-soft/70 transition-colors focus:border-[var(--cobalt)] focus:ring-2 focus:ring-[var(--cobalt)]/15"
                />
              </div>
              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <label htmlFor="password" className="text-sm font-semibold text-ink">Password</label>
                  {!isSignin && <span id="password-hint" className="text-xs text-ink-soft">Minimal 6 karakter</span>}
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete={isSignin ? "current-password" : "new-password"}
                  aria-describedby={!isSignin ? "password-hint" : undefined}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Masukkan password"
                  className="mt-2 min-h-12 w-full border border-line bg-surface px-4 text-sm text-ink placeholder:text-ink-soft/70 transition-colors focus:border-[var(--cobalt)] focus:ring-2 focus:ring-[var(--cobalt)]/15"
                />
              </div>
            </div>

            {error && (
              <p role="alert" className="mt-5 border-l-2 border-accent bg-accent-soft px-3 py-3 text-sm leading-6 text-ink">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="mt-7 inline-flex min-h-12 w-full items-center justify-center bg-[var(--night)] px-5 text-sm font-semibold text-surface transition-transform hover:-translate-y-0.5 hover:bg-[var(--night-raised)] disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transform-none"
            >
              {loading ? "Memproses..." : isSignin ? "Masuk ke workspace" : "Buat akun"}
              {!loading && <span aria-hidden="true" className="ml-4 text-[var(--copper-soft)]">02</span>}
            </button>
          </form>

          <div className="mt-7 border-t border-line pt-6">
            <p className="text-sm text-ink-soft">
              {isSignin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
              <button
                type="button"
                onClick={() => setMode(isSignin ? "signup" : "signin")}
                className="border-b border-ink pb-0.5 font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
              >
                {isSignin ? "Daftar sekarang" : "Masuk"}
              </button>
            </p>
          </div>

          <p className="mt-7 text-xs leading-5 text-ink-soft">
            Kamu tetap memegang kendali atas tiap keputusan dan pengiriman lamaran.
          </p>
        </div>
      </section>
    </main>
  );
}
