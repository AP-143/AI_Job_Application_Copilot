import type { ReactNode } from "react";
import type { ProfileExtractionResult } from "@/lib/types";
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

export function displayName(name: string | null | undefined): string {
  const clean = (name ?? "").trim();
  if (!clean) return "Profil kamu";
  if (clean !== clean.toUpperCase()) return clean;
  return clean.toLowerCase().replace(/(^|[\s'-])(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase());
}

const FIELD_LABELS: Record<string, string> = {
  contact: "Kontak",
  full_name: "Nama",
  email: "Email",
  phone: "Nomor telepon",
  location: "Lokasi",
  linkedin_url: "LinkedIn",
  portfolio_url: "Portofolio",
  other_links: "Tautan lain",
  summary: "Ringkasan",
  skills: "Keahlian",
  experience: "Pengalaman",
  education: "Pendidikan",
  projects: "Proyek",
  certifications: "Sertifikasi",
  languages: "Bahasa",
  start_date: "tanggal mulai",
  end_date: "tanggal selesai",
  gpa: "IPK",
};

function fieldLabel(field: string): string {
  return field
    .split(/[.[\]]+/)
    .filter(Boolean)
    .map((part) => (/^\d+$/.test(part) ? `#${Number(part) + 1}` : FIELD_LABELS[part] ?? part.replaceAll("_", " ")))
    .join(" › ");
}

function Row({ label, children, id }: { label: ReactNode; children: ReactNode; id: string }) {
  return (
    <section
      aria-labelledby={id}
      className="grid gap-6 border-t border-line py-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-12 lg:py-16"
    >
      <h2 id={id} className="text-heading font-light text-ink [&_strong]:font-bold">
        {label}
      </h2>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

const underline = "underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink";

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
  if (portfolio) contactLinks.push({ label: "Portofolio", href: portfolio });

  profile.contact.other_links.forEach((link) => {
    const href = safeHref(link);
    if (href) contactLinks.push({ label: new URL(href).hostname.replace(/^www\./, ""), href });
  });

  const contactItems = [
    profile.contact.email && { key: "email", node: <a className={underline} href={`mailto:${profile.contact.email}`}>{profile.contact.email}</a> },
    profile.contact.phone && { key: "phone", node: <a className={underline} href={`tel:${profile.contact.phone}`}>{profile.contact.phone}</a> },
    profile.contact.location && { key: "loc", node: <span>{profile.contact.location}</span> },
  ].filter(Boolean) as Array<{ key: string; node: ReactNode }>;

  return (
    <div className="page pb-24">
      {warnings.length > 0 && (
        <section role="status" aria-labelledby="warnings-heading" className="mb-12 rounded-md bg-danger-soft p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-12">
            <h2 id="warnings-heading" className="flex items-start gap-3 text-heading font-light text-ink">
              <Icon name="alert" className="mt-1.5 h-6 w-6 text-danger" />
              <span>
                <strong className="font-bold">{warnings.length} bagian</strong> perlu kamu cek.
              </span>
            </h2>
            <div>
              <p className="max-w-[40rem] text-body text-ink-2">
                Bagian ini kurang jelas di CV. Pastikan informasinya benar sebelum menilai lowongan, atau perbaiki CV lalu unggah ulang.
              </p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {warnings.map((warning, index) => (
                  <li key={`${warning.field}-${index}`} className="rounded-sm bg-white/70 px-4 py-3">
                    <span className="block text-body font-semibold text-ink">{fieldLabel(warning.field)}</span>
                    <span className="block text-meta text-ink-2">{warning.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {(contactItems.length > 0 || contactLinks.length > 0) && (
        <Row id="contact-heading" label="Kontak">
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
        </Row>
      )}

      {profile.summary && (
        <Row id="summary-heading" label="Ringkasan">
          <p className="max-w-[42rem] text-[1.375rem] leading-[1.45] font-light tracking-[-0.01em] text-ink">{profile.summary}</p>
        </Row>
      )}

      {profile.experience.length > 0 && (
        <Row id="experience-heading" label="Pengalaman">
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

      {profile.skills.length > 0 && (
        <Row
          id="skills-heading"
          label={
            <>
              <strong>{profile.skills.length}</strong> keahlian
            </>
          }
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

      {profile.projects.length > 0 && (
        <Row id="projects-heading" label="Proyek">
          <div className="grid gap-x-6 gap-y-10 md:grid-cols-2">
            {profile.projects.map((project, index) => {
              const href = safeHref(project.link);
              return (
                <article key={`${project.name}-${index}`} className="group">
                  <div className="dark-block grid aspect-[16/10] place-items-center p-6 text-center">
                    <span
                      aria-hidden="true"
                      className="text-[clamp(1.5rem,3vw,2.25rem)] leading-[1.05] font-bold tracking-[-0.03em] text-dk-ink transition-transform duration-[var(--dur-slow)] ease-[var(--ease)] group-hover:scale-[1.04]"
                    >
                      {project.name}
                    </span>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between gap-4">
                    <h3 className="min-w-0 break-words text-body font-semibold text-ink">{project.name}</h3>
                    {project.date && <span className="tabular shrink-0 text-meta text-ink-3">{project.date}</span>}
                  </div>
                  {project.description && <p className="mt-0.5 text-body font-light text-ink-2">{project.description}</p>}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.role && <Tag>{project.role}</Tag>}
                    {project.technologies.slice(0, 6).map((tech, techIndex) => (
                      <Tag key={`${tech}-${techIndex}`}>{tech}</Tag>
                    ))}
                  </div>
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

      {profile.education.length > 0 && (
        <Row id="education-heading" label="Pendidikan">
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

      {(profile.certifications.length > 0 || profile.languages.length > 0) && (
        <Row id="other-heading" label="Lainnya">
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
        </Row>
      )}
    </div>
  );
}
