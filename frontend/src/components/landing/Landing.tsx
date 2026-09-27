import Link from "next/link";
import { HeroVideo } from "@/components/HeroMedia";
import { buttonClass } from "@/components/ui";
import LandingHeader from "./LandingHeader";

export default function Landing() {
  return (
    <main className="tone-dark relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <HeroVideo />
      <LandingHeader />
      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-[90px] text-center">
        <h1 className="animate-fade-rise max-w-7xl font-serif text-5xl leading-[0.95] font-normal tracking-[-2.46px] text-ink sm:text-7xl md:text-8xl [&_em]:text-ink-2 [&_em]:not-italic">
          Dari <em>CV</em> ke lowongan yang cocok, <em>dalam satu meja kerja.</em>
        </h1>
        <p className="animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed text-ink-2 sm:text-lg">
          Unggah CV sekali. Kami susun profilmu, lalu cari lowongan dari 4 sumber sekaligus. Keputusan melamar tetap
          di tangan kamu.
        </p>
        <Link
          href="/login?mode=signup"
          className={buttonClass("glass", "animate-fade-rise-delay-2 mt-12 cursor-pointer px-14 py-5 text-base")}
        >
          Mulai
        </Link>
      </section>
    </main>
  );
}
