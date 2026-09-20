# Job Application Copilot

Web app buat bantu proses cari kerja luar negeri — dari cari lowongan sampai
siapin dokumen apply (CV tailored, cover letter, form answer draft). User
tetap yang submit lamaran secara manual (human-in-the-loop).

## Status

Baru fitur pertama: **Profile Extractor** — upload CV (PDF/DOCX/TXT) →
diekstrak jadi data terstruktur (kontak, summary, skills, experience,
education, projects, certifications, languages) pakai Gemini structured
output, dijalankan lewat pipeline LangGraph kecil (`parse → extract →
validate`).

Belum dikerjakan: job search (job board APIs + Gemini grounding),
validasi/enrichment lowongan, matching, generate CV tailored & cover letter,
tracker. Skema Supabase untuk simpan hasil ekstraksi sudah disiapkan tapi
belum di-wire ke auth/flow simpan-otomatis di app.

## Struktur

```
frontend/   Next.js (App Router, TypeScript, Tailwind v4)
backend/    FastAPI + LangGraph orchestrator, dipanggil Gemini API
```

## Menjalankan backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # isi GEMINI_API_KEY, dst.
uvicorn app.main:app --reload --port 8000
```

Endpoint utama: `POST /api/profile/extract` (multipart, field `file`).

## Menjalankan frontend

```bash
cd frontend
cp .env.local.example .env.local   # isi NEXT_PUBLIC_API_URL, Supabase keys
npm install
npm run dev
```

Buka `http://localhost:3000` — ada uploader CV, hasil ekstraksi tampil di
bawahnya untuk direview.

## Supabase

Migration ada di `backend/supabase/001_candidate_profiles.sql` — tabel
`candidate_profiles` (satu profil per user, RLS scoped ke `auth.uid()`).
Belum ada auth di frontend, jadi endpoint extract saat ini stateless (tidak
otomatis simpan ke DB) — itu langkah berikutnya setelah auth masuk.

## Desain

Minimalis/editorial: font serif (Fraunces) untuk heading + IBM Plex Sans
untuk body, self-hosted via `@fontsource` (tanpa request ke Google Fonts saat
runtime). Palet terbatas: paper/ink/satu warna aksen (rust/terracotta),
hairline border, tanpa gradient/shadow berlebihan.

## Next steps (saran urutan)

1. Auth (Supabase) + simpan hasil extract ke `candidate_profiles`.
2. Job search pipeline (LangGraph): job board APIs + Gemini grounding
   (umum & spesifik) sebagai node-node paralel, lalu merge.
3. Validasi lowongan (cek link, red flag) + enrichment (salary, visa tag,
   company snapshot, freshness).
4. Matching + skor kecocokan.
5. Generate CV tailored (template ATS-friendly) + cover letter + form
   answer draft.
6. Tracker status lamaran (manual update oleh user).
