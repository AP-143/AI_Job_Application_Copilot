// Landing copy in one place, so every claim can be checked against the code.

export const SOURCES = [
  { name: "RemoteOK", note: "Papan lowongan remote" },
  { name: "Himalayas", note: "Papan lowongan remote" },
  { name: "Adzuna", note: "Agregator lowongan" },
  { name: "Google via Gemini", note: "Pencarian web dengan Gemini" },
] as const;

export const FACTS = [
  { value: "4", label: "sumber dicari sekaligus" },
  { value: "30", label: "hari terakhir; lowongan lebih lama disembunyikan" },
  { value: "3", label: "format CV: PDF, DOCX, TXT" },
  { value: "0", label: "lamaran dikirim atas namamu" },
] as const;

export const FAQ = [
  {
    question: "Data CV-ku disimpan di mana?",
    answer:
      "File CV dibaca di memori server dan tidak disimpan. Teksnya diproses dengan Gemini dari Google untuk menyusun profil. Yang disimpan hanya profil hasilnya, di akunmu, dan setiap akun hanya bisa membaca datanya sendiri.",
  },
  {
    question: "Sumber lowongannya dari mana saja?",
    answer:
      "RemoteOK, Himalayas, Adzuna, dan pencarian web Google lewat Gemini. Semuanya dicari sekaligus setiap kali kamu menekan Cari. Adzuna hanya dipakai untuk negara yang didukungnya.",
  },
  {
    question: "Apakah aplikasi ini melamar otomatis?",
    answer:
      "Tidak. Kami tidak pernah mengirim lamaran atau email atas namamu. Setiap lowongan membuka halaman aslinya, dan kamu yang memutuskan.",
  },
  {
    question: "Seberapa baru lowongannya?",
    answer:
      "Hanya lowongan dari 30 hari terakhir yang ditampilkan, yang terbaru di depan. Lowongan yang lebih lama disembunyikan otomatis.",
  },
  {
    question: "Bisakah aku mengganti CV nanti?",
    answer: "Bisa. Pilih Ganti CV di halaman profil. Profil lama tetap dipakai sampai CV baru selesai dibaca.",
  },
] as const;
