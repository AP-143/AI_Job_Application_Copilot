"use client";

import { useState, type ReactNode } from "react";
import type { ExtractionWarning, ProfileExtractionResult } from "@/lib/types";
import { fieldLabel, groupWarnings, sectionAnchor, type ProfileSectionId } from "@/lib/profile";
import { Icon, Tag, panelClass, panelTitleClass } from "./ui";

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
  return [start, end].filter(Boolean).join(" – ") || "Tanggal belum tercantum";
}

function PanelWarnings({ items }: { items: ExtractionWarning[] }) {
  return (
    <ul className="mb-5 space-y-2">
      {items.map((warning, index) => (
        <li key={`${warning.field}-${index}`} className="flex gap-3 rounded-sm bg-danger-soft px-4 py-3">
          <Icon name="alert" className="mt-0.5 h-4 w-4 text-danger" />
          <span>
            <span className="block text-meta font-semibold text-ink">{fieldLabel(warning.field)}</span>
            <span className="block text-meta text-ink-2">{warning.message}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

function Panel({
  section,
  label,
  warnings = [],
  children,
}: {
  section: ProfileSectionId;
  label: ReactNode;
  warnings?: ExtractionWarning[];
  children?: ReactNode;
}) {
  const headingId = `${sectionAnchor(section)}-heading`;
  return (
    <section
      id={sectionAnchor(section)}
      aria-labelledby={headingId}
      className={`scroll-mt-6 ${panelClass}`}
    >
      <h2 id={headingId} className={`${panelTitleClass} mb-5`}>
        {label}
      </h2>
      {warnings.length > 0 && <PanelWarnings items={warnings} />}
      {children}
    </section>
  );
}

/** Shows the first `visible` items; the toggle below the list reveals the rest in place. */
function Clamp<T>({
  items,
  visible,
  render,
  className,
}: {
  items: T[];
  visible: number;
  render: (item: T, index: number) => ReactNode;
  className: string;
}) {
  const [open, setOpen] = useState(false);
  const hidden = items.length - visible;
  return (
    <>
      <ul className={className}>{(open ? items : items.slice(0, visible)).map(render)}</ul>
      {hidden > 0 && (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="mt-4 inline-flex min-h-9 items-center gap-1.5 text-meta font-medium text-ink transition-colors hover:text-ink-2"
        >
          {open ? "Sembunyikan" : `Tampilkan ${hidden} lainnya`}
          <Icon name="plus" className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-45" : ""}`} />
        </button>
      )}
    </>
  );
}

const underline = "underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink";
const bullet =
  "relative pl-4 before:absolute before:top-[0.6em] before:left-0 before:h-1 before:w-1 before:rounded-full before:bg-ink-3";

export default function ProfileReview({ result }: { result: ProfileExtractionResult }) {
  const { profile, warnings } = result;
  const byRow = groupWarnings(warnings);

  const contactLinks: Array<{ label: string; href: string }> = [];
  const linkedIn = safeHref(profile.contact.linkedin_url);
  const portfolio = safeHref(profile.contact.portfolio_url);
  if (linkedIn) contactLinks.push({ label: "LinkedIn", href: linkedIn });
  if (portfolio) contactLinks.push({ label: "Portofolio", href: portfolio });
  profile.contact.other_links.forEach((link) => {
    const href = safeHref(link);
    if (href) contactLinks.push({ label: new URL(href).hostname.replace(/^www\./, ""), href });
  });

  const contactItems = [
    profile.contact.email && {
      key: "email",
      node: (
        <a className={underline} href={`mailto:${profile.contact.email}`}>
          {profile.contact.email}
        </a>
      ),
    },
    profile.contact.phone && {
      key: "phone",
      node: (
        <a className={underline} href={`tel:${profile.contact.phone}`}>
          {profile.contact.phone}
        </a>
      ),
    },
    profile.contact.location && { key: "loc", node: <span>{profile.contact.location}</span> },
  ].filter(Boolean) as Array<{ key: string; node: ReactNode }>;

  const hasContact = contactItems.length > 0 || contactLinks.length > 0;
  const hasOther = profile.certifications.length > 0 || profile.languages.length > 0;

  return (
    <div className="page grid gap-5 pt-10 pb-24 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:items-start">
      <div className="flex min-w-0 flex-col gap-5">
        {(profile.summary || byRow.summary) && (
          <Panel section="summary" label="Ringkasan" warnings={byRow.summary}>
            {profile.summary && <p className="max-w-[46rem] text-body leading-relaxed text-ink-2">{profile.summary}</p>}
          </Panel>
        )}

        {(profile.experience.length > 0 || byRow.experience) && (
          <Panel section="experience" label="Pengalaman" warnings={byRow.experience}>
            <div className="divide-y divide-line">
              {profile.experience.map((experience, index) => (
                <article key={`${experience.company}-${experience.title}-${index}`} className="py-5 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                    <div className="min-w-0">
                      <h3 className="break-words font-semibold text-ink">{experience.title}</h3>
                      <p className="text-meta text-ink-2">
                        {[experience.company, experience.location].filter(Boolean).join(", ")}
                      </p>
                    </div>
                    <Tag>{formatRange(experience.start_date, experience.is_current ? "sekarang" : experience.end_date)}</Tag>
                  </div>
                  {experience.bullets.length > 0 && (
                    <Clamp
                      items={experience.bullets}
                      visible={3}
                      className="mt-3 space-y-1.5 text-meta leading-relaxed text-ink-2"
                      render={(text, bulletIndex) => (
                        <li key={bulletIndex} className={bullet}>
                          {text}
                        </li>
                      )}
                    />
                  )}
                  {experience.skills_used.length > 0 && (
                    <p className="mt-3 text-meta text-ink-3">
                      <span className="font-semibold text-ink-2">Dipakai: </span>
                      {experience.skills_used.join(", ")}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </Panel>
        )}

        {(profile.projects.length > 0 || byRow.projects) && (
          <Panel section="projects" label="Proyek" warnings={byRow.projects}>
            <div className="grid gap-5 sm:grid-cols-2">
              {profile.projects.map((project, index) => {
                const href = safeHref(project.link);
                return (
                  <article key={`${project.name}-${index}`} className="min-w-0 rounded-md bg-sunken p-4">
                    {project.date && <Tag tone="outline">{project.date}</Tag>}
                    <h3 className={`break-words font-semibold text-ink ${project.date ? "mt-2" : ""}`}>{project.name}</h3>
                    {project.description && (
                      <p className="mt-1 line-clamp-3 text-meta leading-relaxed text-ink-2">{project.description}</p>
                    )}
                    {(project.role || project.technologies.length > 0) && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {project.role && <Tag tone="outline">{project.role}</Tag>}
                        {project.technologies.slice(0, 4).map((tech, techIndex) => (
                          <Tag key={`${tech}-${techIndex}`} tone="outline">
                            {tech}
                          </Tag>
                        ))}
                      </div>
                    )}
                    {href && (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mt-3 inline-flex items-center gap-1.5 text-meta text-ink ${underline}`}
                      >
                        Buka proyek
                        <Icon name="external" className="h-3.5 w-3.5 text-ink-3" />
                        <span className="sr-only">(tab baru)</span>
                      </a>
                    )}
                  </article>
                );
              })}
            </div>
          </Panel>
        )}
      </div>

      <div className="flex min-w-0 flex-col gap-5">
        {(hasContact || byRow.contact) && (
          <Panel section="contact" label="Kontak" warnings={byRow.contact}>
            {hasContact && (
              <ul className="space-y-2 text-meta text-ink">
                {contactItems.map((item) => (
                  <li key={item.key} className="break-all">
                    {item.node}
                  </li>
                ))}
                {contactLinks.map((link, index) => (
                  <li key={`${link.href}-${index}`}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 ${underline}`}
                    >
                      {link.label}
                      <Icon name="external" className="h-3.5 w-3.5 text-ink-3" />
                      <span className="sr-only">(tab baru)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        )}

        {(profile.skills.length > 0 || byRow.skills) && (
          <Panel
            section="skills"
            label={
              <>
                Keahlian <span className="text-ink-2">{profile.skills.length}</span>
              </>
            }
            warnings={byRow.skills}
          >
            <Clamp
              items={profile.skills}
              visible={16}
              className="flex flex-wrap gap-2"
              render={(skill, index) => (
                <li key={`${skill.name}-${index}`} className="max-w-full">
                  <span className="inline-block max-w-full rounded-lg bg-sunken px-3 py-1.5 text-meta leading-snug text-ink">
                    {skill.name}
                  </span>
                </li>
              )}
            />
          </Panel>
        )}

        {(profile.education.length > 0 || byRow.education) && (
          <Panel section="education" label="Pendidikan" warnings={byRow.education}>
            <div className="space-y-4">
              {profile.education.map((education, index) => (
                <article key={`${education.institution}-${index}`}>
                  <h3 className="break-words font-semibold text-ink">{education.institution}</h3>
                  <p className="text-meta text-ink-2">
                    {[education.degree, education.field_of_study, education.location].filter(Boolean).join(", ")}
                  </p>
                  <p className="mt-1 text-meta text-ink-3">{formatRange(education.start_date, education.end_date)}</p>
                </article>
              ))}
            </div>
          </Panel>
        )}

        {(hasOther || byRow.other) && (
          <Panel section="other" label="Lainnya" warnings={byRow.other}>
            {hasOther && (
              <dl className="space-y-4">
                {profile.certifications.length > 0 && (
                  <div>
                    <dt className="text-meta font-semibold text-ink">Sertifikasi</dt>
                    <dd className="mt-1 text-meta text-ink-2">{profile.certifications.join(", ")}</dd>
                  </div>
                )}
                {profile.languages.length > 0 && (
                  <div>
                    <dt className="text-meta font-semibold text-ink">Bahasa</dt>
                    <dd className="mt-1 text-meta text-ink-2">{profile.languages.join(", ")}</dd>
                  </div>
                )}
              </dl>
            )}
          </Panel>
        )}
      </div>
    </div>
  );
}
