import Link from "next/link";
import Wordmark from "@/components/Wordmark";
import { HeroVideo } from "@/components/HeroMedia";
import { Accordion, ArrowDot, StatGrid, buttonClass, titleClass } from "@/components/ui";
import HowItWorks from "./HowItWorks";
import LandingHeader from "./LandingHeader";
import { FACTS, FAQ, SOURCES } from "./content";

const startButton = buttonClass("primary", "min-h-12 gap-3 pr-2");

const HERO_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

export default function Landing() {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-[100svh] font-body">
      <main>
        <section className="tone-dark tone-hero relative isolate flex min-h-[100svh] flex-col overflow-hidden">
          <HeroVideo src={HERO_VIDEO_URL} bare />
          <LandingHeader />
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-[90px] text-center">
            <h1 className="animate-fade-rise max-w-7xl font-serif text-5xl leading-[0.95] font-normal tracking-[-2.46px] text-ink sm:text-7xl md:text-8xl [&_em]:text-ink-2 [&_em]:not-italic">
              Dari <em>CV</em> ke lowongan yang cocok, <em>dalam satu meja kerja.</em>
            </h1>
            <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-ink-2 sm:text-lg">
              Unggah CV sekali. Kami susun profilmu, lalu cari lowongan dari 4 sumber sekaligus. Keputusan melamar
              tetap di tangan kamu.
            </p>
            <Link
              href="/login?mode=signup"
              className={buttonClass("glass", "animate-fade-rise-delay-2 mt-12 cursor-pointer px-14 py-5 text-base")}
            >
              Mulai
            </Link>
          </div>
        </section>

        <section className="wash">
          <div className="page py-24 sm:py-32">
            <p className="mx-auto max-w-[24ch] text-center text-[clamp(1.75rem,3.6vw,3rem)] leading-[1.15] font-light tracking-[-0.025em] text-ink [&_strong]:font-bold">
              Kami <strong>membaca CV-mu</strong>, bukan menebak. Kamu yang <strong>memutuskan</strong> ke mana melamar.
            </p>
          </div>
        </section>

        <HowItWorks />

        <section id="sumber" aria-labelledby="sources-heading" className="page py-24 sm:py-32">
          <h2 id="sources-heading" className={`${titleClass} mx-auto max-w-[20ch] text-center`}>
            Lowongan dari <strong>4 sumber</strong> sekaligus.
          </h2>
          <ul className="line-grid mt-14 grid-cols-2 lg:grid-cols-4">
            {SOURCES.map((source) => (
              <li key={source.name} className="flex min-h-40 flex-col items-center justify-center gap-1 p-6 text-center">
                <span className="text-heading font-bold tracking-[-0.02em] text-ink">{source.name}</span>
                <span className="text-meta text-ink-2">{source.note}</span>
              </li>
            ))}
          </ul>
          <StatGrid className="mt-10" items={FACTS} />
        </section>

        <section id="faq" aria-labelledby="faq-heading" className="tone-dark surface-dark scroll-mt-[4.5rem]">
          <div className="page grid gap-10 py-24 sm:py-32 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <h2 id="faq-heading" className={`${titleClass} max-w-[14ch]`}>
              Pertanyaan yang <strong>sering muncul</strong>.
            </h2>
            <Accordion items={FAQ} />
          </div>
        </section>

        <section className="page py-24 sm:py-32">
          <div className="flex flex-col items-start justify-between gap-8 border-t border-line pt-12 sm:flex-row sm:items-end">
            <h2 className={`${titleClass} max-w-[16ch]`}>
              Mulai dari <strong>CV kamu</strong>.
            </h2>
            <Link href="/login?mode=signup" className={startButton}>
              Mulai
              <ArrowDot inverse className="h-8 w-8" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="page pb-10">
        <div className="flex flex-col gap-4 border-t border-line pt-6 text-meta text-ink-2 sm:flex-row sm:items-center sm:justify-between">
          <Wordmark />
          <nav aria-label="Akun" className="flex gap-6">
            <Link href="/login" className="transition-colors hover:text-ink">
              Masuk
            </Link>
            <Link href="/login?mode=signup" className="transition-colors hover:text-ink">
              Daftar
            </Link>
          </nav>
          <p>© {year} Application Desk</p>
        </div>
      </footer>
    </div>
  );
}
