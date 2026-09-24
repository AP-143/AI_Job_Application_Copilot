"use client";

import Link from "next/link";
import Wordmark from "@/components/Wordmark";
import { useScrolled } from "@/components/useScrolled";
import { buttonClass } from "@/components/ui";

const anchor =
  "hidden min-h-11 items-center rounded-full px-4 text-body text-ink-2 transition-colors duration-[var(--dur-fast)] hover:text-ink sm:inline-flex";

/* Transparent over the hero video, solid white once the page scrolls. */
export default function LandingHeader() {
  const scrolled = useScrolled();
  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color] duration-[var(--dur-base)] ease-[var(--ease)] ${
        scrolled ? "tone-light border-line bg-bg/90 backdrop-blur-xl" : "tone-dark border-transparent bg-transparent"
      }`}
    >
      <div className="page flex min-h-[4.5rem] items-center justify-between gap-4">
        <Link href="/" aria-label="Application Desk, ke beranda" className="rounded-xs">
          <Wordmark />
        </Link>
        <nav aria-label="Navigasi beranda" className="flex items-center gap-1 sm:gap-2">
          <a href="#cara-kerja" className={anchor}>
            Cara kerja
          </a>
          <a href="#faq" className={anchor}>
            FAQ
          </a>
          <Link href="/login" className={buttonClass("primary")}>
            Masuk
          </Link>
        </nav>
      </div>
    </header>
  );
}
