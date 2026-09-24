import type { ReactNode } from "react";
import type { ExtractionWarning, ProfileExtractionResult } from "@/lib/types";
import { fieldLabel, groupWarnings, sectionAnchor, type ProfileSectionId } from "@/lib/profile";
import { Icon, Tag } from "./ui";

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

function RowWarnings({ items }: { items: ExtractionWarning[] }) {
  return (
    <ul className="mb-8 space-y-2">
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

function Row({
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
      className="grid scroll-mt-24 gap-6 border-t border-line py-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-12 lg:py-16"
    >
      <h2 id={headingId} className="text-heading font-light text-ink [&_strong]:font-bold">
        {label}
      </h2>
      <div className="min-w-0">
        {warnings.length > 0 && <RowWarnings items={warnings} />}
        {children}
      </div>
    </section>
  );
}

const underline = "underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink";

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
    <div className="page pt-4 pb-24">
      {(hasContact || byRow.contact) && (
        <Row section="contact" label="Kontak" warnings={byRow.contact}>
          {hasContact && (
            <ul className="flex flex-wrap gap-x-8 gap-y-3 text-lead text-ink">
              {contactItems.map((item) => (
                <li key={item.key} className="break-all">
                  {item.node}
                </li>
              ))}
              {contactLinks.map((link, index) => (
                <li key={`${link.href}-${index}`}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 ${underline}`}>
                    {link.label}
                    <Icon name="external" className="h-4 w-4 text-ink-3" />
                    <span className="sr-only">(tab baru)</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Row>
      )}

      {(profile.summary || byRow.summary) && (
        <Row section="summary" label="Ringkasan" warnings={byRow.summary}>
          {profile.summary && (
            <p className="max-w-[42rem] text-[1.375rem] leading-[1.45] font-light tracking-[-0.01em] text-ink">{profile.summary}</p>
          )}
        </Row>
      )}

      {(profile.experience.length > 0 || byRow.experience) && (
        <Row section="experience" label="Pengalaman" warnings={byRow.experience}>
          <div className="space-y-12">
            {profile.experience.map((experience, index) => (
              <article key={`${experience.company}-${experience.title}-${index}`} className="max-w-[48rem]">
                <Tag>{formatRange(experience.start_date, experience.is_current ? "sekarang" : experience.end_date)}</Tag>
                <h3 className="mt-3 break-words text-lead font-semibold text-ink">{experience.title}</h3>
                <p className="text-body font-light text-ink-2">
                  {[experience.company, experience.location].filter(Boolean).join(", ")}
                </p>
                {experience.bullets.length > 0 && (
                  <ul className="mt-5 space-y-2.5 text-body text-ink-2">
                    {experience.bullets.map((bullet, bulletIndex) => (
                      <li
                        key={bulletIndex}
                        className="relative pl-5 before:absolute before:top-[0.6em] before:left-0 before:h-1.5 before:w-1.5 before:rounded-full before:bg-ink"
                      >
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
                {experience.skills_used.length > 0 && (
                  <p className="mt-5 text-meta text-ink-3">
                    <span className="font-semibold text-ink-2">Dipakai: </span>
                    {experience.skills_used.join(", ")}
                  </p>
                )}
              </article>
            ))}
          </div>
        </Row>
      )}

      {(profile.skills.length > 0 || byRow.skills) && (
        <Row
          section="skills"
          label={
            <>
              <strong>{profile.skills.length}</strong> keahlian
            </>
          }
          warnings={byRow.skills}
        >
          <ul className="flex max-w-[52rem] flex-wrap gap-2">
            {profile.skills.map((skill, index) => (
              <li key={`${skill.name}-${index}`}>
                <Tag>{skill.name}</Tag>
              </li>
            ))}
          </ul>
        </Row>
      )}

      {(profile.education.length > 0 || byRow.education) && (
        <Row section="education" label="Pendidikan" warnings={byRow.education}>
          <div className="space-y-8">
            {profile.education.map((education, index) => (
              <article key={`${education.institution}-${index}`}>
                <Tag>{formatRange(education.start_date, education.end_date)}</Tag>
                <h3 className="mt-3 break-words text-lead font-semibold text-ink">{education.institution}</h3>
                <p className="text-body font-light text-ink-2">
                  {[education.degree, education.field_of_study, education.location].filter(Boolean).join(", ")}
                </p>
              </article>
            ))}
          </div>
        </Row>
      )}

      {(profile.projects.length > 0 || byRow.projects) && (
        <Row section="projects" label="Proyek" warnings={byRow.projects}>
          <div className="space-y-12">
            {profile.projects.map((project, index) => {
              const href = safeHref(project.link);
              return (
                <article key={`${project.name}-${index}`} className="max-w-[48rem]">
                  {project.date && <Tag>{project.date}</Tag>}
                  <h3 className="mt-3 break-words text-lead font-semibold text-ink">{project.name}</h3>
                  {project.description && <p className="mt-1 text-body font-light text-ink-2">{project.description}</p>}
                  {(project.role || project.technologies.length > 0) && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.role && <Tag tone="outline">{project.role}</Tag>}
                      {project.technologies.slice(0, 6).map((tech, techIndex) => (
                        <Tag key={`${tech}-${techIndex}`}>{tech}</Tag>
                      ))}
                    </div>
                  )}
                  {href && (
                    <a href={href} target="_blank" rel="noopener noreferrer" className={`mt-4 inline-flex items-center gap-1.5 text-body text-ink ${underline}`}>
                      Buka proyek
                      <Icon name="external" className="h-4 w-4 text-ink-3" />
                      <span className="sr-only">(tab baru)</span>
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        </Row>
      )}

      {(hasOther || byRow.other) && (
        <Row section="other" label="Lainnya" warnings={byRow.other}>
          {hasOther && (
            <dl className="grid max-w-[48rem] gap-8 sm:grid-cols-2">
              {profile.certifications.length > 0 && (
                <div>
                  <dt className="text-meta font-semibold text-ink">Sertifikasi</dt>
                  <dd className="mt-1 text-body font-light text-ink-2">{profile.certifications.join(", ")}</dd>
                </div>
              )}
              {profile.languages.length > 0 && (
                <div>
                  <dt className="text-meta font-semibold text-ink">Bahasa</dt>
                  <dd className="mt-1 text-body font-light text-ink-2">{profile.languages.join(", ")}</dd>
                </div>
              )}
            </dl>
          )}
        </Row>
      )}
    </div>
  );
}
