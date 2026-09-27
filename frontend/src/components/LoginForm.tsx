"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Wordmark from "@/components/Wordmark";
import { HeroVideo } from "@/components/HeroMedia";
import { Alert, Button, Icon, buttonClass } from "@/components/ui";

export type AuthMode = "signin" | "signup";

function authErrorMessage(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "Email atau password tidak cocok. Periksa ejaan, atau pilih Daftar kalau belum punya akun.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Email ini sudah terdaftar. Pilih Masuk dan gunakan password akun tersebut.";
  if (m.includes("email not confirmed"))
    return "Email belum dikonfirmasi. Buka tautan konfirmasi di inbox kamu, lalu masuk lagi.";
  if (m.includes("password should be") || m.includes("weak password"))
    return "Password terlalu lemah. Gunakan minimal 6 karakter, lebih baik campuran huruf dan angka.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Terlalu banyak percobaan. Tunggu satu menit, lalu coba lagi.";
  if (m.includes("fetch") || m.includes("network"))
    return "Tidak bisa terhubung ke server. Periksa koneksi internet, lalu coba lagi.";
  return `Detail dari server: ${message}`;
}

/* Glass pill that wraps an input; the input itself stays transparent so the ring from ::before shows. */
const fieldShell =
  "liquid-glass flex h-14 items-center rounded-full bg-white/[0.04] backdrop-blur-md transition-shadow duration-[var(--dur-fast)] " +
  "focus-within:shadow-[inset_0_1px_1px_rgb(255_255_255/0.1),0_0_0_3px_rgb(255_255_255/0.22)] " +
  "has-[[aria-invalid=true]]:shadow-[inset_0_1px_1px_rgb(255_255_255/0.1),0_0_0_2px_var(--danger)]";

const fieldInput =
  "h-full w-full min-w-0 bg-transparent px-6 text-base text-ink placeholder:text-ink-2 focus:outline-none disabled:opacity-60";

export default function LoginForm({ initialMode }: { initialMode: AuthMode }) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignin = mode === "signin";

  function switchMode(next: AuthMode) {
    setMode(next);
    setError(null);
    setNotice(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error } = isSignin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (error) {
      setError(authErrorMessage(error.message));
      return;
    }

    if (!data.session) {
      setNotice(
        `Akun untuk ${email} sudah dibuat. Buka email konfirmasi yang baru kami kirim, lalu kembali ke sini untuk masuk.`
      );
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <main className="tone-dark relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <HeroVideo />

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-6">
        <Link href="/" aria-label="Application Desk, ke beranda" className="rounded-xs">
          <Wordmark />
        </Link>
        <Link href="/" className={buttonClass("glass", "min-h-0 gap-2 px-6 py-2.5 text-sm")}>
          <Icon name="arrow" className="h-4 w-4 rotate-180" />
          Beranda
        </Link>
      </header>

      <section
        aria-labelledby="auth-heading"
        className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 pt-8 pb-16 text-center"
      >
        <h1
          id="auth-heading"
          key={mode}
          className="animate-fade-rise font-serif text-5xl leading-[0.95] font-normal tracking-[-1.5px] text-ink sm:text-6xl [&_em]:text-ink-2 [&_em]:not-italic"
        >
          {isSignin ? (
            <>
              Selamat datang <em>lagi.</em>
            </>
          ) : (
            <>
              Buat akun <em>baru.</em>
            </>
          )}
        </h1>
        <p className="animate-fade-rise-delay mt-5 text-base leading-relaxed text-ink-2">
          {isSignin
            ? "Profil dan hasil pencarian terakhirmu sudah menunggu."
            : "Profil dan preferensi pencarianmu akan tersimpan di akun ini."}
        </p>

        <form
          onSubmit={handleSubmit}
          aria-label={isSignin ? "Form masuk" : "Form pendaftaran"}
          className="animate-fade-rise-delay-2 mt-10 space-y-3 text-left"
        >
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <div className={fieldShell}>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              spellCheck={false}
              disabled={loading}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              aria-invalid={error ? true : undefined}
              className={fieldInput}
            />
          </div>

          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <div className={fieldShell}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete={isSignin ? "current-password" : "new-password"}
              disabled={loading}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={isSignin ? "Password" : "Password, minimal 6 karakter"}
              aria-invalid={error ? true : undefined}
              className={fieldInput}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              aria-pressed={showPassword}
              className="mr-2 grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-2 transition-colors hover:text-ink"
            >
              <Icon name={showPassword ? "eyeOff" : "eye"} />
            </button>
          </div>

          <div aria-live="polite" className="empty:hidden">
            {error && <Alert title={isSignin ? "Belum bisa masuk" : "Akun belum bisa dibuat"}>{error}</Alert>}
            {notice && (
              <Alert tone="success" title="Cek email kamu">
                {notice}
              </Alert>
            )}
          </div>

          <Button
            type="submit"
            variant="glass"
            loading={loading}
            loadingText={isSignin ? "Memeriksa akun…" : "Membuat akun…"}
            className="mt-3 h-14 w-full text-base"
          >
            {isSignin ? "Masuk" : "Buat akun"}
          </Button>
        </form>

        <p className="mt-8 text-sm text-ink-2">
          {isSignin ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
          <button
            type="button"
            onClick={() => switchMode(isSignin ? "signup" : "signin")}
            className="text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink"
          >
            {isSignin ? "Daftar" : "Masuk"}
          </button>
        </p>

        <p className="mt-10 text-xs leading-relaxed text-ink-2">
          Kami tidak pernah mengirim lamaran atas namamu. Setiap keputusan tetap di tanganmu.
        </p>
      </section>
    </main>
  );
}
