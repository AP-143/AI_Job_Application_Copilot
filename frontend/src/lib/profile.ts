import type { CandidateProfile, ExtractionWarning } from "./types";

export type ProfileSectionId = "contact" | "summary" | "experience" | "skills" | "education" | "projects" | "other";

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

/** "experience[0].end_date" becomes "Pengalaman › #1 › tanggal selesai". */
export function fieldLabel(field: string): string {
  return field
    .split(/[.[\]]+/)
    .filter(Boolean)
    .map((part) => (/^\d+$/.test(part) ? `#${Number(part) + 1}` : FIELD_LABELS[part] ?? part.replaceAll("_", " ")))
    .join(" › ");
}

const SECTION_BY_FIELD: Record<string, ProfileSectionId> = {
  contact: "contact",
  summary: "summary",
  experience: "experience",
  skills: "skills",
  education: "education",
  projects: "projects",
};

/** The profile row a backend warning belongs to, from the first segment of its field path. */
export function sectionForWarning(field: string): ProfileSectionId {
  const head = field.split(/[.[\]]/)[0];
  return SECTION_BY_FIELD[head] ?? "other";
}

export function groupWarnings(
  warnings: ExtractionWarning[]
): Partial<Record<ProfileSectionId, ExtractionWarning[]>> {
  const groups: Partial<Record<ProfileSectionId, ExtractionWarning[]>> = {};
  for (const warning of warnings) {
    const id = sectionForWarning(warning.field);
    (groups[id] ??= []).push(warning);
  }
  return groups;
}

export function sectionAnchor(id: ProfileSectionId): string {
  return `section-${id}`;
}

export function profileStats(profile: CandidateProfile): Array<{ label: string; value: number }> {
  return [
    { label: "pengalaman", value: profile.experience.length },
    { label: "keahlian", value: profile.skills.length },
    { label: "proyek", value: profile.projects.length },
    { label: "pendidikan", value: profile.education.length },
  ];
}
