import Link from "next/link";
import Wordmark from "@/components/Wordmark";
import { buttonClass } from "@/components/ui";

export default function LandingHeader() {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-7xl flex-row items-center justify-between px-8 py-6">
      <Link href="/" aria-label="Application Desk, ke beranda" className="rounded-xs">
        <Wordmark />
      </Link>
      <Link href="/login" className={buttonClass("glass", "min-h-0 px-6 py-2.5 text-sm")}>
        Masuk
      </Link>
    </header>
  );
}
