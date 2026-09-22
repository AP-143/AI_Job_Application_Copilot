import Link from "next/link";
import LogoutButton from "./LogoutButton";

type AppHeaderProps = {
  active: "profile" | "jobs";
  userEmail: string;
};

export function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <span className={`flex items-baseline gap-[3px] text-[1.5rem] leading-none tracking-[-0.045em] ${light ? "text-dk-ink" : "text-ink"}`}>
      <span className="font-bold">desk</span>
      <span aria-hidden="true" className={`inline-block h-[7px] w-[7px] rounded-full ${light ? "bg-dk-ink" : "bg-ink"}`} />
      <span className="sr-only">Application Desk</span>
    </span>
  );
}

const NAV = [
  { key: "profile", href: "/", label: "Profil" },
  { key: "jobs", href: "/jobs", label: "Lowongan" },
] as const;

export default function AppHeader({ active, userEmail }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl">
      <div className="page grid min-h-[4.5rem] grid-cols-[auto_1fr_auto] items-center gap-3">
        <Link href="/" aria-label="Application Desk, ke halaman profil" className="rounded-xs">
          <Wordmark />
        </Link>

        <nav aria-label="Navigasi utama" className="flex justify-center gap-1 sm:gap-4">
          {NAV.map((item) => {
            const current = item.key === active;
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-full px-3 text-body transition-[color,font-weight,background-color] duration-[var(--dur-fast)] ease-[var(--ease)] sm:px-4 ${
                  current ? "bg-sunken font-semibold text-ink" : "text-ink-2 hover:font-semibold hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex min-w-0 items-center gap-3">
          <span title={userEmail} className="hidden max-w-52 truncate text-meta text-ink-2 lg:block">
            {userEmail}
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
