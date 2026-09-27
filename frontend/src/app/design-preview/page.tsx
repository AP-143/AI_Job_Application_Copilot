import { notFound } from "next/navigation";
import Landing from "@/components/landing/Landing";
import AppHeader from "@/components/AppHeader";
import Dashboard from "@/components/Dashboard";
import JobSearchPanel from "@/components/JobSearchPanel";
import type { CandidateProfileRow, JobListingRow } from "@/lib/types";

// Dev-only harness for checking UI states with mock data. Returns 404 in production.

const now = Date.now();
const daysAgo = (d: number) => new Date(now - d * 86400000).toISOString();

const LONG = "Principal Staff Distributed Systems & Machine Learning Infrastructure Reliability Engineer (Payments, Fraud, Risk)";

const listings: JobListingRow[] = [
  {
    id: "1", user_id: "u", hidden: false, fetched_at: daysAgo(0), posted_at: daysAgo(0),
    source: "himalayas", source_url: "https://example.com/1", title: LONG,
    company: "Internationale Handelsgesellschaft für Zahlungsverkehr und Risikomanagement GmbH",
    location: "Singapura, Kuala Lumpur, Jakarta, Bangkok, Ho Chi Minh City", remote: true,
    salary_text: "SGD 180,000 – 260,000 / tahun + equity",
    description: "JumpCloudÂ® is hiring. We’re looking for an engineer who ".repeat(12),
  },
  {
    id: "2", user_id: "u", hidden: false, fetched_at: daysAgo(1), posted_at: null,
    source: "gemini_specific", source_url: "https://example.com/2", title: "Backend Engineer, Platform",
    company: "Stripe", location: null, remote: false, salary_text: null, description: null,
  },
  {
    id: "3", user_id: "u", hidden: false, fetched_at: daysAgo(2), posted_at: daysAgo(1),
    source: "adzuna", source_url: "https://example.com/3", title: "Pricing &amp; Packaging Lead",
    company: "Delinea", location: "Remote", remote: true, salary_text: "$300,000 - $340,000",
    description: "Short description.",
  },
];

const many: JobListingRow[] = Array.from({ length: 40 }, (_, i) => ({
  ...listings[i % listings.length],
  id: `m${i}`,
  source_url: `https://example.com/m${i}`,
  fetched_at: daysAgo(i % 20),
  posted_at: daysAgo(i % 20),
}));

const profile: CandidateProfileRow = {
  id: "p", user_id: "u", created_at: daysAgo(3), updated_at: daysAgo(0),
  source_filename: "CV_Final_Revisi_Terbaru_Benar_Benar_Final_2026_versi_bahasa_inggris_dan_indonesia.pdf",
  raw_text_length: 12000,
  warnings: [
    { field: "contact.phone", message: "Nomor telepon tidak ditemukan di CV." },
    { field: "experience[0].end_date", message: "Tanggal selesai tidak jelas." },
    { field: "education", message: "Tidak ada informasi pendidikan." },
  ],
  profile: {
    contact: {
      full_name: "MUHAMMAD ALEXANDER KRISTIANTO WIRYAWAN-SOEDJATMIKO",
      email: "muhammad.alexander.kristianto.wiryawan@contoh-perusahaan-panjang.co.id",
      phone: null, location: "Yogyakarta", linkedin_url: "https://linkedin.com/in/x",
      portfolio_url: null, other_links: ["https://github.com/x"],
    },
    summary: "Engineer dengan fokus pada sistem terdistribusi. ".repeat(6),
    skills: Array.from({ length: 28 }, (_, i) => ({ name: i % 5 === 0 ? "Large Language Model evaluation and benchmarking" : `Skill ${i + 1}` })),
    experience: [
      {
        company: "Perusahaan Teknologi Nusantara", title: LONG, location: "Jakarta", start_date: "01/2024",
        end_date: null, is_current: true, bullets: ["Membangun pipeline data real-time untuk 5 layanan.", "Menurunkan latensi p99 sebesar 40%."],
        skills_used: ["Go", "Kafka", "PostgreSQL"],
      },
    ],
    education: [],
    projects: [],
    certifications: [],
    languages: ["Indonesia", "Inggris"],
  },
};

export default async function DesignPreview({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { state = "jobs-empty" } = await searchParams;

  if (state === "landing") return <Landing />;
  if (state === "profile-empty") return <Dashboard userId="u" userEmail="preview@contoh.id" initialProfile={null} />;
  if (state === "profile-overflow") return <Dashboard userId="u" userEmail="preview@contoh.id" initialProfile={profile} />;

  const jobs = {
    "jobs-empty": { hasProfile: true, initialListings: [] },
    "jobs-noprofile": { hasProfile: false, initialListings: [] },
    "jobs-overflow": { hasProfile: true, initialListings: listings },
    "jobs-many": { hasProfile: true, initialListings: many },
  }[state];
  if (!jobs) notFound();

  return (
    <main className="min-h-[100svh]">
      <AppHeader active="jobs" userEmail="preview@contoh.id" />
      <JobSearchPanel userId="u" initialPreferences={null} {...jobs} />
    </main>
  );
}
