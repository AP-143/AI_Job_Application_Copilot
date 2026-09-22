"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Wordmark } from "@/components/AppHeader";
import NightScene from "@/components/NightScene";
import { Alert, Button, Field, Icon, inputClass } from "@/components/ui";

type Mode = "signin" | "signup";

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

const SOURCES = ["RemoteOK", "Himalayas", "Adzuna", "Gemini"];

const STEPS = [
  { t: "Unggah CV", d: "PDF, DOCX, atau TXT." },
  { t: "Tinjau profil", d: "Pengalaman dan keahlian disusun rapi." },
  { t: "Cari lowongan", d: "Hanya yang diposting 30 hari terakhir." },
];

function Steps({ className }: { className: string }) {
  return (
    <ol className={`animate-rise grid w-full max-w-3xl gap-6 text-left sm:grid-cols-3 sm:gap-8 lg:max-w-[30rem] ${className}`} style={{ animationDelay: "700ms" }}>
      {STEPS.map((step, index) => (
        <li key={step.t} className="border-t border-white/15 pt-4">
          <span className="tabular text-meta text-dk-ink-3">{index + 1}</span>
          <p className="mt-1 font-semibold text-dk-ink">{step.t}</p>
          <p className="text-meta text-dk-ink-2">{step.d}</p>
        </li>
      ))}
    </ol>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignin = mode === "signin";

  function switchMode(next: Mode) {
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
    <main className="dark-hero flex min-h-[100svh] flex-col">
      <NightScene />

      <div className="page flex min-h-[4.5rem] items-center justify-between">
        <Wordmark light />
        <p className="hidden text-meta text-dk-ink-2 sm:block">Asisten lamaran kerja untuk kamu yang sibuk.</p>
      </div>

      <div className="page flex flex-1 flex-col items-center pt-10 pb-16 text-center sm:pt-16 lg:grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-16 lg:pt-6 lg:text-left">
        <div className="flex flex-col items-center lg:items-start">
        <h1 className="max-w-[16ch] text-[clamp(2.25rem,5vw,4.5rem)] leading-[1.06] font-light tracking-[-0.03em] text-dk-ink sm:max-w-[18ch]">
          {[
            <>Satu CV untuk</>,
            <><strong>lowongan global</strong> yang</>,
            <>masih segar.</>,
          ].map((line, index) => (
            <span key={index} className="reveal-line" style={{ "--i": index } as CSSProperties}>
              <span>{line}</span>
            </span>
          ))}
        </h1>

        <div
          className="animate-rise mt-8 inline-flex flex-wrap items-center justify-center gap-1.5 rounded-full border border-white/20 p-1.5"
          style={{ animationDelay: "420ms" }}
        >
          {SOURCES.map((source) => (
            <span key={source} className="inline-flex min-h-7 items-center gap-1.5 rounded-full bg-white/12 px-3 text-tag font-bold uppercase text-dk-ink">
              <Icon name="search" className="h-3 w-3" />
              {source}
            </span>
          ))}
          <span className="hidden px-3 text-meta text-dk-ink-2 sm:inline">dicari sekaligus</span>
        </div>
        <Steps className="mt-12 hidden lg:grid" />
        </div>

        <section
          aria-labelledby="auth-heading"
          className="animate-rise mt-12 w-full max-w-[27rem] justify-self-end rounded-md lg:mt-0 bg-surface p-6 text-left text-ink shadow-[0_40px_100px_-30px_rgb(0_0_0/0.6)] sm:p-8"
          style={{ animationDelay: "560ms" }}
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
              <>Selamat datang <strong>lagi</strong>.</>
            ) : (
              <>Buat akun <strong>baru</strong>.</>
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

          <p className="mt-6 text-meta text-ink-3">
            Kami tidak pernah mengirim lamaran atas namamu. Setiap keputusan tetap di tanganmu.
          </p>
        </section>

        <Steps className="mt-14 lg:hidden" />
      </div>
    </main>
  );
}
