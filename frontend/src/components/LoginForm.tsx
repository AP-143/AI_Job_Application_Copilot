"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Wordmark from "@/components/Wordmark";
import { HeroVideo } from "@/components/HeroMedia";
import { Alert, Button, Field, Icon, displayClass, inputClass } from "@/components/ui";

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

const STEPS = [
  { title: "Unggah CV", body: "PDF, DOCX, atau TXT." },
  { title: "Periksa profil", body: "Bagian yang kurang jelas ditandai." },
  { title: "Cari lowongan", body: "Dari 30 hari terakhir." },
];

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
    <main className="relative min-h-[100svh] bg-bg">
      {/* Mobile: a video band on top. Desktop: the video fills the page behind the form card. */}
      <section className="tone-dark relative isolate flex min-h-[42svh] flex-col overflow-hidden lg:absolute lg:inset-0 lg:min-h-0">
        <HeroVideo />
        <div className="page flex min-h-[4.5rem] items-center">
          <Link href="/" aria-label="Application Desk, ke beranda" className="rounded-xs">
            <Wordmark />
          </Link>
        </div>
        {/* .page sets padding-inline outside any layer, so the right gutter for the card goes on an inner div. */}
        <div className="page mt-auto pb-10 lg:my-auto lg:pb-0">
          <div className="lg:pr-[32rem]">
            <h1 className={`${displayClass} animate-rise max-w-[14ch]`}>
              Satu CV untuk <strong>lowongan yang cocok</strong>.
            </h1>
            <ol className="mt-12 hidden max-w-[36rem] grid-cols-3 gap-6 lg:grid">
              {STEPS.map((step, index) => (
                <li key={step.title} className="border-t border-line pt-4">
                  <span className="tabular text-meta text-ink-3">{index + 1}</span>
                  <p className="mt-1 font-semibold text-ink">{step.title}</p>
                  <p className="text-meta text-ink-2">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <div className="page relative py-10 lg:pointer-events-none lg:flex lg:min-h-[100svh] lg:items-center lg:justify-end lg:py-24">
        <section
          aria-labelledby="auth-heading"
          className="tone-light mx-auto w-full max-w-[27rem] lg:pointer-events-auto lg:mx-0 lg:rounded-md lg:bg-bg lg:p-8 lg:shadow-[0_40px_100px_-30px_rgb(0_0_0/0.6)]"
        >
          <div role="group" aria-label="Pilih masuk atau daftar" className="relative grid grid-cols-2 rounded-full bg-sunken p-1">
            <span
              aria-hidden="true"
              className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-ink transition-transform duration-[var(--dur-base)] ease-[var(--ease-out)] ${
                isSignin ? "translate-x-0" : "translate-x-full"
              }`}
            />
            {(["signin", "signup"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={mode === value}
                onClick={() => switchMode(value)}
                className={`relative min-h-10 rounded-full text-body font-semibold transition-colors duration-[var(--dur-fast)] ${
                  mode === value ? "text-on-ink" : "text-ink-2 hover:text-ink"
                }`}
              >
                {value === "signin" ? "Masuk" : "Daftar"}
              </button>
            ))}
          </div>

          <h2 id="auth-heading" className="mt-7 text-heading font-light text-ink">
            {isSignin ? (
              <>
                Selamat datang <strong>lagi</strong>.
              </>
            ) : (
              <>
                Buat akun <strong>baru</strong>.
              </>
            )}
          </h2>
          <p className="mt-1.5 text-body text-ink-2">
            {isSignin
              ? "Profil dan hasil pencarian terakhirmu sudah menunggu."
              : "Profil dan preferensi pencarianmu akan tersimpan di akun ini."}
          </p>

          <form onSubmit={handleSubmit} aria-label={isSignin ? "Form masuk" : "Form pendaftaran"} className="mt-6 space-y-5">
            <Field id="email" label="Email">
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
                placeholder="nama@email.com"
                aria-invalid={error ? true : undefined}
                className={inputClass}
              />
            </Field>

            <Field
              id="password"
              label="Password"
              aside={!isSignin && <span className="text-meta text-ink-2">Minimal 6 karakter</span>}
            >
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  autoComplete={isSignin ? "current-password" : "new-password"}
                  disabled={loading}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  aria-invalid={error ? true : undefined}
                  className={`${inputClass} pr-14`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-sm text-ink-2 transition-colors hover:text-ink focus-visible:outline-offset-[-2px]"
                >
                  <Icon name={showPassword ? "eyeOff" : "eye"} />
                </button>
              </div>
            </Field>

            <div aria-live="polite">
              {error && <Alert title={isSignin ? "Belum bisa masuk" : "Akun belum bisa dibuat"}>{error}</Alert>}
              {notice && (
                <Alert tone="success" title="Cek email kamu">
                  {notice}
                </Alert>
              )}
            </div>

            <Button
              type="submit"
              loading={loading}
              loadingText={isSignin ? "Memeriksa akun…" : "Membuat akun…"}
              className="min-h-12 w-full"
            >
              {isSignin ? "Masuk" : "Buat akun"}
            </Button>
          </form>

          <p className="mt-6 text-meta text-ink-2">
            Kami tidak pernah mengirim lamaran atas namamu. Setiap keputusan tetap di tanganmu.
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-meta text-ink-2 transition-colors hover:text-ink"
          >
            <Icon name="arrow" className="h-4 w-4 rotate-180" />
            Kembali ke beranda
          </Link>
        </section>
      </div>
    </main>
  );
}
