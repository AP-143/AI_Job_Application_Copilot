# Job Application Copilot

Web app buat bantu proses cari kerja luar negeri — dari cari lowongan sampai
siapin dokumen apply (CV tailored, cover letter, form answer draft). User
tetap yang submit lamaran secara manual (human-in-the-loop).

## Status

**Profile Extractor** — upload CV (PDF/DOCX/TXT) → diekstrak jadi data
terstruktur (kontak, summary, skills, experience, education, projects,
certifications, languages) pakai Gemini structured output, dijalankan lewat
pipeline LangGraph kecil (`parse → extract → validate`).

**Auth + simpan profil** — login/daftar pakai email+password (Supabase
Auth). Tiap ekstraksi sukses otomatis ke-upsert ke `candidate_profiles`
(RLS scoped ke user). User yang sudah punya profil tersimpan langsung
lihat itu pas buka app lagi, dengan tombol "Upload CV baru" buat replace.

**Job search** — cari lowongan lintas sumber (RemoteOK, Himalayas, Adzuna,
Gemini grounded search) lewat pipeline LangGraph (fetch paralel → merge →
dedupe), dipanggil dari halaman `/jobs` dengan form preferensi (role,
lokasi, remote-only, dst). Listing lama auto-hide.

Belum dikerjakan: validasi/enrichment lowongan, matching, generate CV
tailored & cover letter, tracker.

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

Buka `http://localhost:3000` — kalau belum login, kelempar ke `/login`
(daftar/masuk pakai email+password). Setelah login: uploader CV, atau
profil tersimpan kalau sudah pernah upload.

## Supabase

Perlu project Supabase (buat, matiin "Confirm email" di Authentication →
Providers → Email biar signup langsung login, lalu jalanin
`backend/supabase/001_candidate_profiles.sql` di SQL Editor). Kalau opsi
"Automatically expose new tables" dimatiin pas bikin project, tambahin
juga (sudah termasuk di file migration):

```sql
grant select, insert, update, delete on public.candidate_profiles to authenticated;
```

Isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`
(publishable key) di `frontend/.env.local`.

## Desain

Minimalis/editorial: font serif (Fraunces) untuk heading + IBM Plex Sans
untuk body, self-hosted via `@fontsource` (tanpa request ke Google Fonts saat
runtime). Palet terbatas: paper/ink/satu warna aksen (rust/terracotta),
hairline border, tanpa gradient/shadow berlebihan.

## Next steps (saran urutan)

1. Validasi lowongan (cek link, red flag) + enrichment (salary, visa tag,
   company snapshot, freshness).
2. Matching + skor kecocokan.
3. Generate CV tailored (template ATS-friendly) + cover letter + form
   answer draft.
4. Tracker status lamaran (manual update oleh user).
