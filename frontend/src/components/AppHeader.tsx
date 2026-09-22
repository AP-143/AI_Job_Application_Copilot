import Link from "next/link";
import LogoutButton from "./LogoutButton";

type AppHeaderProps = {
  active: "profile" | "jobs";
  userEmail: string;
};

function BrandMark() {
  return (
    <span
      aria-hidden="true"
      className="relative grid h-9 w-9 place-items-center border border-ink bg-surface"
    >
      <span className="h-3 w-3 border border-accent bg-accent-soft" />
      <span className="absolute bottom-1 left-1 h-1 w-1 bg-cobalt" />
    </span>
  );
}

export default function AppHeader({ active, userEmail }: AppHeaderProps) {
  const navItem = (
    current: AppHeaderProps["active"],
    href: string,
    mobileLabel: string,
    label: string
  ) =>
    current === active ? (
      <Link
        href={href}
        aria-current="page"
        aria-label={label}
        className="border-b-2 border-accent px-1 py-3 text-xs font-semibold tracking-[0.08em] text-ink"
      >
        <span className="sm:hidden">{mobileLabel}</span>
        <span className="hidden sm:inline">{label}</span>
      </Link>
    ) : (
      <Link
        href={href}
        aria-label={label}
        className="border-b-2 border-transparent px-1 py-3 text-xs font-medium tracking-[0.08em] text-ink-soft transition-colors hover:text-ink"
      >
        <span className="sm:hidden">{mobileLabel}</span>
        <span className="hidden sm:inline">{label}</span>
      </Link>
    );

  return (
    <header className="app-topbar sticky top-0 z-40 border-b border-line">
      <div className="mx-auto flex min-h-16 max-w-[1440px] items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-10">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 text-ink focus-visible:rounded-sm"
          aria-label="Application Desk, kembali ke dossier"
        >
          <BrandMark />
          <span className="hidden leading-none sm:block">
            <span className="block font-display text-lg">Application</span>
            <span className="mt-0.5 block font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              Desk
            </span>
          </span>
        </Link>

        <nav className="ml-1 flex h-16 items-center gap-3 sm:ml-4 sm:gap-6" aria-label="Navigasi utama">
          {navItem("profile", "/", "01", "01 DOSSIER")}
          {navItem("jobs", "/jobs", "02", "02 LOWONGAN")}
        </nav>

        <div className="ml-auto flex min-w-0 items-center gap-2 border-l border-line pl-2 sm:gap-3 sm:pl-5">
          <span
            title={userEmail}
            className="hidden max-w-44 truncate text-xs text-ink-soft lg:block"
          >
            {userEmail}
          </span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
