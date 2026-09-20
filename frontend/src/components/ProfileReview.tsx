import type { ProfileExtractionResult } from "@/lib/types";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line py-8 first:border-t-0 first:pt-0">
      <h3 className="font-display text-sm uppercase tracking-[0.18em] text-ink-soft">
        {title}
      </h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function ProfileReview({
  result,
}: {
  result: ProfileExtractionResult;
}) {
  const { profile, warnings } = result;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-3xl text-ink">
          {profile.contact.full_name || "Profil kamu"}
        </h2>
        <span className="text-xs text-ink-soft">{result.source_filename}</span>
      </div>

      <p className="mt-1 text-sm text-ink-soft">
        {[profile.contact.email, profile.contact.phone, profile.contact.location]
          .filter(Boolean)
          .join(" · ")}
      </p>

      {warnings.length > 0 && (
        <div className="mt-6 border-l-2 border-accent bg-accent-soft px-4 py-3">
          <p className="text-sm font-medium text-accent">Perlu dicek ulang</p>
          <ul className="mt-1 space-y-0.5 text-sm text-ink-soft">
            {warnings.map((w) => (
              <li key={w.field}>{w.message}</li>
            ))}
          </ul>
        </div>
      )}

      {profile.summary && (
        <Section title="Ringkasan">
          <p className="text-ink">{profile.summary}</p>
        </Section>
      )}

      {profile.skills.length > 0 && (
        <Section title="Skills">
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill.name}
                className="border border-line px-2.5 py-1 text-sm text-ink"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </Section>
      )}

      {profile.experience.length > 0 && (
        <Section title="Pengalaman">
          <div className="space-y-6">
            {profile.experience.map((exp, i) => (
              <div key={i}>
                <div className="flex items-baseline justify-between gap-4">
                  <p className="font-medium text-ink">
                    {exp.title} · {exp.company}
                  </p>
                  <p className="whitespace-nowrap text-xs text-ink-soft">
                    {exp.start_date} – {exp.is_current ? "Sekarang" : exp.end_date}
                  </p>
                </div>
                {exp.location && (
                  <p className="text-xs text-ink-soft">{exp.location}</p>
                )}
                {exp.bullets.length > 0 && (
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-ink">
                    {exp.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {profile.education.length > 0 && (
        <Section title="Pendidikan">
          <div className="space-y-4">
            {profile.education.map((edu, i) => (
              <div key={i} className="flex items-baseline justify-between gap-4">
                <div>
                  <p className="font-medium text-ink">{edu.institution}</p>
                  <p className="text-sm text-ink-soft">
                    {[edu.degree, edu.field_of_study].filter(Boolean).join(", ")}
                  </p>
                </div>
                <p className="whitespace-nowrap text-xs text-ink-soft">
                  {edu.start_date} – {edu.end_date}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {profile.projects.length > 0 && (
        <Section title="Proyek">
          <div className="space-y-4">
            {profile.projects.map((p, i) => (
              <div key={i}>
                <p className="font-medium text-ink">{p.name}</p>
                {p.description && (
                  <p className="text-sm text-ink-soft">{p.description}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {(profile.certifications.length > 0 || profile.languages.length > 0) && (
        <Section title="Lainnya">
          <div className="space-y-2 text-sm text-ink">
            {profile.certifications.length > 0 && (
              <p>
                <span className="text-ink-soft">Sertifikasi: </span>
                {profile.certifications.join(", ")}
              </p>
            )}
            {profile.languages.length > 0 && (
              <p>
                <span className="text-ink-soft">Bahasa: </span>
                {profile.languages.join(", ")}
              </p>
            )}
          </div>
        </Section>
      )}
    </div>
  );
}
