import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

export { Toast } from "./Toast";

/* ---------- Icons: one set, 1.5 stroke, 24px grid ---------- */

const ICON_PATHS = {
  file: "M6 2.75h7.25L18 7.5v13.75H6zM13 2.75V7.5h5M9 12.5h6M9 16h6",
  upload: "M12 15.5V4m0 0L7.5 8.5M12 4l4.5 4.5M4.75 15v4.25h14.5V15",
  check: "M5 12.5l4.5 4.5L19 7.5",
  alert: "M12 8.5v5m0 3v.01M10.3 3.9L2.8 17a2 2 0 001.7 3h15a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z",
  info: "M12 11v5.5m0-9v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  close: "M6 6l12 12M18 6L6 18",
  external: "M14 4.75h5.25V10M19 5l-8 8M17 14v5.25H4.75V7H10",
  arrow: "M5 12h14m0 0l-5.5-5.5M19 12l-5.5 5.5",
  eye: "M2.75 12S6 5.75 12 5.75 21.25 12 21.25 12 18 18.25 12 18.25 2.75 12 2.75 12zM12 14.75a2.75 2.75 0 100-5.5 2.75 2.75 0 000 5.5z",
  eyeOff: "M3.5 3.5l17 17M10.2 5.95A9 9 0 0112 5.75c6 0 9.25 6.25 9.25 6.25a15 15 0 01-2.6 3.35M6.6 6.9A15.3 15.3 0 002.75 12S6 18.25 12 18.25a9 9 0 004.6-1.3M9.9 9.9a2.75 2.75 0 003.9 3.9",
  search: "M10.75 17.5a6.75 6.75 0 100-13.5 6.75 6.75 0 000 13.5zM20 20l-4.5-4.5",
  pin: "M12 21s-6.75-5.6-6.75-11.25a6.75 6.75 0 0113.5 0C18.75 15.4 12 21 12 21zM12 12.25a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
  clock: "M12 7.5V12l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  wallet: "M4.75 7.25h14.5v11.5H4.75zM4.75 7.25l10.5-3v3M15.5 13h1.5",
  plus: "M12 5v14M5 12h14",
} as const;

export type IconName = keyof typeof ICON_PATHS;

export function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={`shrink-0 animate-spin ${className}`}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
      <path d="M21 12a9 9 0 00-9-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/* ---------- Type ---------- */

/* The one big headline per page: light weight with bold keywords (Bou's "only hires" pattern). */
export const displayClass =
  "text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.06] font-light tracking-[-0.03em] text-ink [&_strong]:font-bold";

/* Section headings on the landing page and similar. */
export const titleClass =
  "text-[clamp(2rem,4vw,3.25rem)] leading-[1.1] font-light tracking-[-0.025em] text-ink [&_strong]:font-bold";

/* Round arrow badge after link text. `inverse` flips it inside a filled ink button. Follows the section tone. */
export function ArrowDot({ inverse = false, className = "" }: { inverse?: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full transition-transform duration-[var(--dur-base)] ease-[var(--ease)] group-hover:translate-x-1 ${
        inverse ? "bg-on-ink text-ink" : "bg-ink text-on-ink"
      } ${className}`}
    >
      <Icon name="arrow" className="h-3.5 w-3.5" />
    </span>
  );
}

/* ---------- Button ---------- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "link" | "arrow";

const BUTTON_BASE =
  "group relative inline-flex min-h-11 select-none items-center justify-center gap-2 rounded-full text-body font-medium " +
  "transition-[background-color,border-color,color,box-shadow,transform,font-weight] duration-[var(--dur-fast)] ease-[var(--ease)] " +
  "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 aria-busy:pointer-events-none motion-reduce:active:transform-none";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-ink px-6 text-on-ink hover:bg-ink-hover",
  secondary: "border border-ink bg-transparent px-6 text-ink hover:bg-ink hover:text-on-ink",
  ghost: "px-4 text-ink-2 hover:bg-sunken hover:text-ink",
  link: "min-h-0 rounded-none px-0 text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink active:scale-100",
  arrow: "gap-3 pr-1 pl-0 text-ink hover:font-semibold",
};

export function buttonClass(variant: ButtonVariant = "primary", extra = "") {
  return `${BUTTON_BASE} ${BUTTON_VARIANTS[variant]} ${extra}`;
}

export function Button({
  variant = "primary",
  loading = false,
  loadingText,
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
  loadingText?: string;
}) {
  const isArrow = variant === "arrow";
  return (
    <button
      type="button"
      aria-busy={loading || undefined}
      className={buttonClass(variant, className)}
      {...props}
    >
      {loading && !isArrow && <Spinner />}
      {loading && loadingText ? loadingText : children}
      {isArrow && (loading ? <Spinner className="h-7 w-7 p-1.5" /> : <ArrowDot />)}
    </button>
  );
}

/* ---------- Field ---------- */

export const inputClass =
  "block min-h-12 w-full rounded-sm border border-line-strong bg-surface px-4 py-3 text-body text-ink " +
  "placeholder:text-ink-3 transition-[border-color,box-shadow] duration-[var(--dur-fast)] ease-[var(--ease)] " +
  "hover:border-ink focus-visible:border-ink focus-visible:shadow-[0_0_0_4px_var(--ring)] focus-visible:outline-none " +
  "aria-[invalid=true]:border-danger aria-[invalid=true]:shadow-[0_0_0_4px_rgb(194_38_29/0.1)] " +
  "disabled:cursor-not-allowed disabled:bg-sunken disabled:text-ink-3";

export function Field({
  id,
  label,
  hint,
  error,
  aside,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-meta font-semibold text-ink">
          {label}
        </label>
        {aside}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-meta text-ink-2">
          {hint}
        </p>
      )}
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`${id}-error`} className="mt-2 flex items-start gap-1.5 text-meta font-medium text-danger">
          <Icon name="alert" className="mt-px h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ---------- Panel (card) ---------- */

export function Panel({
  children,
  className = "",
  float = false,
}: {
  children: ReactNode;
  className?: string;
  float?: boolean;
}) {
  return (
    <div
      className={`rounded-md bg-surface ${
        float
          ? "shadow-[0_0_0_1px_rgb(10_10_10/0.06),0_24px_60px_-24px_rgb(10_10_10/0.3)]"
          : "border border-line"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ---------- Tag (pill) ---------- */

export function Tag({ children, tone = "light" }: { children: ReactNode; tone?: "light" | "outline" }) {
  const tones = {
    light: "bg-sunken text-ink",
    outline: "border border-line-strong text-ink",
  };
  return (
    <span
      className={`inline-flex min-h-6 items-center gap-1.5 rounded-full px-2.5 text-tag font-bold uppercase ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-7 items-center rounded-full bg-sunken px-3 text-meta font-medium text-ink">
      {children}
    </span>
  );
}

/* ---------- Stat grid (hairline cells, value above label) ---------- */

export function StatGrid({
  items,
  className = "",
  columns = "grid-cols-2 lg:grid-cols-4",
  compact = false,
}: {
  items: ReadonlyArray<{ value: ReactNode; label: string }>;
  className?: string;
  columns?: string;
  compact?: boolean;
}) {
  return (
    <dl className={`line-grid ${columns} ${className}`}>
      {items.map((item) => (
        <div key={item.label} className={`flex flex-col-reverse gap-2 ${compact ? "p-3" : "p-5 sm:p-6"}`}>
          <dt className="text-meta text-ink-2">{item.label}</dt>
          <dd
            className={`tabular leading-none font-light tracking-[-0.02em] text-ink ${
              compact ? "text-heading" : "text-[clamp(2rem,3.4vw,3rem)]"
            }`}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------- Accordion (native details, works without JS) ---------- */

export function Accordion({ items }: { items: ReadonlyArray<{ question: string; answer: ReactNode }> }) {
  return (
    <div className="border-t border-line">
      {items.map((item) => (
        <details key={item.question} className="group border-b border-line">
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-lead text-ink [&::-webkit-details-marker]:hidden">
            {item.question}
            <span
              aria-hidden="true"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line-strong transition-transform duration-[var(--dur-base)] ease-[var(--ease)] group-open:rotate-45"
            >
              <Icon name="plus" className="h-4 w-4" />
            </span>
          </summary>
          <div className="max-w-[40rem] pr-14 pb-6 text-body text-ink-2">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}

/* ---------- Skeleton ---------- */

export function Skeleton({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <span aria-hidden="true" className={`skeleton block ${className}`} style={style} />;
}

/* ---------- Empty state ---------- */

export function EmptyState({
  title,
  children,
  action,
}: {
  title: ReactNode;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-[34rem] flex-col items-center px-4 py-16 text-center sm:py-24">
      <h3 className="text-heading font-light text-ink [&_strong]:font-bold">{title}</h3>
      <div className="mt-3 text-body text-ink-2">{children}</div>
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}

/* ---------- Alert ---------- */

export function Alert({
  tone = "danger",
  title,
  children,
  action,
}: {
  tone?: "danger" | "info" | "success";
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  const tones = {
    danger: { box: "bg-danger-soft", icon: "alert" as const, color: "text-danger" },
    info: { box: "bg-sunken", icon: "info" as const, color: "text-ink" },
    success: { box: "bg-mint", icon: "check" as const, color: "text-ink" },
  }[tone];

  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      className={`animate-fade flex flex-col gap-3 rounded-sm px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 ${tones.box}`}
    >
      <div className="flex min-w-0 gap-3">
        <Icon name={tones.icon} className={`mt-0.5 h-5 w-5 ${tones.color}`} />
        <div className="min-w-0">
          <p className={`font-semibold ${tones.color}`}>{title}</p>
          {children && <div className="mt-0.5 break-words text-meta text-ink-2 sm:text-body">{children}</div>}
        </div>
      </div>
      {action && <div className="shrink-0 pl-8 sm:pl-0">{action}</div>}
    </div>
  );
}

