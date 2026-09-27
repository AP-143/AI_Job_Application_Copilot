import Link from "next/link";
import LogoutButton from "./LogoutButton";
import Wordmark from "./Wordmark";

type AppHeaderProps = {
  active: "profile" | "jobs";
  userEmail: string;
};

const NAV = [
  { key: "profile", href: "/", label: "Profil" },
  { key: "jobs", href: "/jobs", label: "Lowongan" },
] as const;

/* Sits over the top of the navy video hero and scrolls away with it. */
export default function AppHeader({ active, userEmail }: AppHeaderProps) {
  return (
    <header className="tone-dark absolute inset-x-0 top-0 z-40">
      <div className="page grid min-h-[4.5rem] grid-cols-[auto_1fr_auto] items-center gap-3 py-6">
        <Link href="/" aria-label="Application Desk, ke halaman profil" className="rounded-xs">
          <Wordmark />
        </Link>

        <nav aria-label="Navigasi utama" className="flex justify-center gap-5 sm:gap-8">
          {NAV.map((item) => {
            const current = item.key === active;
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`inline-flex min-h-11 items-center text-sm transition-colors ${
                  current ? "text-ink" : "text-ink-2 hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex min-w-0 items-center gap-4">
          <span title={userEmail} className="hidden max-w-52 truncate text-sm text-ink-2 lg:block">
            {userEmail}
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
