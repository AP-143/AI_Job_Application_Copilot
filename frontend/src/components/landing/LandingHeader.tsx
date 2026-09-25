import Link from "next/link";
import Wordmark from "@/components/Wordmark";
import { buttonClass } from "@/components/ui";

const LINKS = [
  { href: "#cara-kerja", label: "Cara kerja" },
  { href: "#sumber", label: "Sumber" },
  { href: "#faq", label: "FAQ" },
] as const;

const link = "text-sm text-ink-2 transition-colors hover:text-ink";

export default function LandingHeader() {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-7xl flex-row items-center justify-between px-8 py-6">
      <Link href="/" aria-label="Application Desk, ke beranda" className="rounded-xs">
        <Wordmark serif />
      </Link>
      <nav aria-label="Navigasi beranda" className="hidden items-center gap-8 md:flex">
        <a href="#" aria-current="page" className="text-sm text-ink">
          Beranda
        </a>
        {LINKS.map((item) => (
          <a key={item.href} href={item.href} className={link}>
            {item.label}
          </a>
        ))}
      </nav>
      <Link href="/login" className={buttonClass("glass", "min-h-0 px-6 py-2.5 text-sm")}>
        Masuk
      </Link>
    </header>
  );
}
