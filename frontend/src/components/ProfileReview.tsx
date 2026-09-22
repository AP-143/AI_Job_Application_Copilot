import type { ReactNode } from "react";
import type { ProfileExtractionResult } from "@/lib/types";

function safeHref(url: string | null | undefined): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

function formatRange(start: string | null | undefined, end: string | null | undefined) {
  return [start, end].filter(Boolean).join(" - ") || "Tanggal belum tersedia";
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  const headingId = title.toLowerCase().replaceAll(" ", "-");

  return (
    <section aria-labelledby={headingId} className="border-t border-line py-8 first:border-t-0 first:pt-0">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
        {eyebrow}
      </p>
      <h3 id={headingId} className="mt-2 font-display text-2xl tracking-[-0.025em] text-ink">
        {title}
      </h3>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ProfileStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-l border-line pl-3">
      <p className="font-mono text-lg leading-none text-ink">{String(value).padStart(2, "0")}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-soft">{label}</p>
    </div>
  );
}

export default function ProfileReview({
  result,
}: {
  result: ProfileExtractionResult;
}) {
  const { profile, warnings } = result;
  const contactLinks: Array<{ label: string; href: string }> = [];
  const linkedIn = safeHref(profile.contact.linkedin_url);
  const portfolio = safeHref(profile.contact.portfolio_url);

  if (linkedIn) contactLinks.push({ label: "LinkedIn", href: linkedIn });
  if (portfolio) contactLinks.push({ label: "Portfolio", href: portfolio });

  profile.contact.other_links.forEach((link, index) => {
    const href = safeHref(link);
    if (href) contactLinks.push({ label: `Link ${index + 1}`, href });
  });

  return (
    <div className="border border-line bg-surface">
      <div className="grid gap-7 border-b border-line p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:p-9">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            Candidate record / source document
          </p>
          <h2 className="mt-3 break-words font-display text-4xl leading-[0.95] tracking-[-0.04em] text-ink sm:text-5xl">
            {profile.contact.full_name || "Profil kamu"}
          </h2>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-ink-soft">
            {profile.contact.email && <a className="hover:text-ink" href={`mailto:${profile.contact.email}`}>{profile.contact.email}</a>}
            {profile.contact.phone && <a className="hover:text-ink" href={`tel:${profile.contact.phone}`}>{profile.contact.phone}</a>}
            {profile.contact.location && <span>{profile.contact.location}</span>}
          </div>
        </div>

        <div className="max-w-full border-l-2 border-accent pl-3 lg:max-w-52">
          <p className="truncate font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft" title={result.source_filename}>
            {result.source_filename}
          </p>
          <p className="mt-1 text-sm leading-5 text-ink">Dokumen terakhir dibaca untuk dossier ini.</p>
        </div>
      </div>

      <div className="grid gap-px bg-line sm:grid-cols-3">
        <div className="bg-surface p-4 sm:p-5"><ProfileStat label="Pengalaman" value={profile.experience.length} /></div>
        <div className="bg-surface p-4 sm:p-5"><ProfileStat label="Keahlian" value={profile.skills.length} /></div>
        <div className="bg-surface p-4 sm:p-5"><ProfileStat label="Proyek" value={profile.projects.length} /></div>
      </div>

      {warnings.length > 0 && (
        <section role="status" aria-label="Bagian profil yang perlu ditinjau" className="border-b border-line bg-[var(--copper-soft)] px-5 py-5 sm:px-7 lg:px-9">
          <div className="grid gap-4 lg:grid-cols-[13rem_minmax(0,1fr)]">
            <div>
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">Review needed</p>
              <h3 className="mt-2 font-display text-2xl text-ink">Cek sebelum lanjut</h3>
            </div>
            <div>
              <p className="text-sm leading-6 text-ink">Bagian berikut belum cukup jelas dari CV. Pastikan informasinya benar saat kamu menilai hasil pencarian.</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {warnings.map((warning) => (
                  <li key={warning.field} className="border-l border-accent pl-3 text-sm text-ink">
                    <span className="font-semibold">{warning.field}</span>: {warning.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="p-5 sm:p-7 lg:p-9">
          {profile.summary && (
            <Section eyebrow="Overview" title="Ringkasan">
              <p className="max-w-3xl text-base leading-7 text-ink">{profile.summary}</p>
            </Section>
          )}

          {profile.experience.length > 0 && (
            <Section eyebrow="Track record" title="Pengalaman">
              <div className="space-y-0">
                {profile.experience.map((experience, index) => (
                  <article key={`${experience.company}-${experience.title}-${index}`} className="grid gap-3 border-t border-line py-5 first:border-t-0 first:pt-0 sm:grid-cols-[minmax(0,1fr)_10rem]">
                    <div className="min-w-0">
                      <h4 className="break-words text-base font-semibold text-ink">{experience.title}</h4>
                      <p className="mt-1 text-sm text-ink-soft">{experience.company}{experience.location ? ` / ${experience.location}` : ""}</p>
                      {experience.bullets.length > 0 && (
                        <ul className="mt-4 space-y-2 text-sm leading-6 text-ink-soft">
                          {experience.bullets.map((bullet, bulletIndex) => <li key={bulletIndex} className="relative pl-4 before:absolute before:left-0 before:top-2.5 before:h-1 before:w-1 before:bg-accent">{bullet}</li>)}
                        </ul>
                      )}
                      {experience.skills_used.length > 0 && (
                        <p className="mt-4 text-xs leading-5 text-ink-soft"><span className="font-semibold text-ink">Digunakan:</span> {experience.skills_used.join(", ")}</p>
                      )}
                    </div>
                    <p className="font-mono text-[10px] leading-5 uppercase tracking-[0.1em] text-ink-soft sm:text-right">
                      {formatRange(experience.start_date, experience.is_current ? "Sekarang" : experience.end_date)}
                    </p>
                  </article>
                ))}
              </div>
            </Section>
          )}

          {profile.projects.length > 0 && (
            <Section eyebrow="Selected work" title="Proyek">
              <div className="grid gap-3 sm:grid-cols-2">
                {profile.projects.map((project, index) => {
                  const href = safeHref(project.link);
                  return (
                    <article key={`${project.name}-${index}`} className="border border-line p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="min-w-0 break-words font-semibold text-ink">{project.name}</h4>
                        {project.date && <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">{project.date}</span>}
                      </div>
                      {project.role && <p className="mt-2 text-xs font-semibold uppercase tracking-[0.1em] text-accent">{project.role}</p>}
                      {project.description && <p className="mt-3 text-sm leading-6 text-ink-soft">{project.description}</p>}
                      {project.technologies.length > 0 && <p className="mt-3 text-xs leading-5 text-ink-soft">{project.technologies.join(" / ")}</p>}
                      {href && <a href={href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block border-b border-ink pb-0.5 text-sm font-semibold text-ink">Buka proyek</a>}
                    </article>
                  );
                })}
              </div>
            </Section>
          )}

          {profile.education.length > 0 && (
            <Section eyebrow="Foundation" title="Pendidikan">
              <div className="space-y-4">
                {profile.education.map((education, index) => (
                  <article key={`${education.institution}-${index}`} className="grid gap-2 border-t border-line pt-4 first:border-t-0 first:pt-0 sm:grid-cols-[minmax(0,1fr)_10rem]">
                    <div className="min-w-0">
                      <h4 className="break-words font-semibold text-ink">{education.institution}</h4>
                      <p className="mt-1 text-sm text-ink-soft">{[education.degree, education.field_of_study, education.location].filter(Boolean).join(" / ")}</p>
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft sm:text-right">{formatRange(education.start_date, education.end_date)}</p>
                  </article>
                ))}
              </div>
            </Section>
          )}
        </div>

        <aside className="border-t border-line bg-[var(--surface-muted)] p-5 sm:p-7 lg:border-l lg:border-t-0 lg:p-7">
          {profile.skills.length > 0 && (
            <section aria-labelledby="skills-heading">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">Core signals</p>
              <h3 id="skills-heading" className="mt-2 font-display text-2xl text-ink">Keahlian</h3>
              <div className="mt-5 flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span key={skill.name} className="border border-line bg-surface px-2.5 py-1.5 text-xs text-ink">
                    {skill.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {contactLinks.length > 0 && (
            <section aria-labelledby="links-heading" className="mt-8 border-t border-line pt-7">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">References</p>
              <h3 id="links-heading" className="mt-2 font-display text-2xl text-ink">Tautan</h3>
              <ul className="mt-4 space-y-3">
                {contactLinks.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="inline-flex border-b border-ink pb-0.5 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent">
                      {link.label}
                      <span aria-hidden="true" className="ml-2 text-accent">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(profile.certifications.length > 0 || profile.languages.length > 0) && (
            <section aria-labelledby="other-heading" className="mt-8 border-t border-line pt-7">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">Additional detail</p>
              <h3 id="other-heading" className="mt-2 font-display text-2xl text-ink">Lainnya</h3>
              <dl className="mt-4 space-y-4 text-sm leading-6">
                {profile.certifications.length > 0 && <div><dt className="font-semibold text-ink">Sertifikasi</dt><dd className="text-ink-soft">{profile.certifications.join(", ")}</dd></div>}
                {profile.languages.length > 0 && <div><dt className="font-semibold text-ink">Bahasa</dt><dd className="text-ink-soft">{profile.languages.join(", ")}</dd></div>}
              </dl>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
