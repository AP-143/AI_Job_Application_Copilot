import Link from "next/link";
import Wordmark from "@/components/Wordmark";
import { HeroVideo } from "@/components/HeroMedia";
import { Accordion, ArrowDot, StatGrid, buttonClass, displayClass, titleClass } from "@/components/ui";
import HowItWorks from "./HowItWorks";
import LandingHeader from "./LandingHeader";
import { FACTS, FAQ, SOURCES } from "./content";

const startButton = buttonClass("primary", "min-h-12 gap-3 pr-2");

export default function Landing() {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-[100svh]">
      <LandingHeader />

      <main>
        <section className="tone-dark relative isolate flex min-h-[90svh] flex-col justify-center overflow-hidden text-center">
          <HeroVideo />
          <div className="page flex flex-col items-center pt-[7.5rem] pb-20">
            <h1 className={`${displayClass} animate-rise max-w-[18ch]`}>
              Dari <strong>CV</strong> ke <strong>lowongan yang cocok</strong>, dalam satu meja kerja.
            </h1>
            <p className="mt-6 max-w-[34rem] text-lead text-ink">
              Unggah CV sekali. Kami susun profilmu, lalu cari lowongan dari 4 sumber sekaligus.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
              <Link href="/login?mode=signup" className={startButton}>
                Mulai
                <ArrowDot inverse className="h-8 w-8" />
              </Link>
              <a href="#cara-kerja" className={buttonClass("link")}>
                Lihat cara kerja
              </a>
            </div>
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

        <section aria-labelledby="sources-heading" className="page py-24 sm:py-32">
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
