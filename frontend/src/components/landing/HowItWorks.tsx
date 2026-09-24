import type { ReactNode } from "react";
import { ArrowDot, Icon, StatGrid, Tag, titleClass } from "@/components/ui";

function Example({ children }: { children: ReactNode }) {
  return (
    <div className="mt-6 rounded-sm border border-line p-4">
      <div className="mb-4 flex justify-end">
        <Tag tone="outline">Contoh</Tag>
      </div>
      {children}
    </div>
  );
}

const STEPS: Array<{ title: string; body: string; example: ReactNode }> = [
  {
    title: "Unggah CV",
    body: "PDF, DOCX, atau TXT. Kami baca pengalaman, keahlian, dan proyekmu.",
    example: (
      <>
        <p className="flex items-center gap-3 text-meta text-ink">
          <Icon name="file" className="h-5 w-5 text-ink-2" />
          <span className="min-w-0 truncate">cv-contoh.pdf</span>
        </p>
        <p className="mt-3 text-meta text-ink-2">
          Membaca CV kamu… <span className="tabular">12 dtk</span>
        </p>
      </>
    ),
  },
  {
    title: "Periksa profil",
    body: "Profil tersusun per bagian. Bagian yang kurang jelas ditandai supaya kamu cek.",
    example: (
      <>
        <StatGrid
          compact
          columns="grid-cols-2"
          items={[
            { value: 3, label: "pengalaman" },
            { value: 18, label: "keahlian" },
          ]}
        />
        <p className="mt-3 flex gap-2 rounded-sm bg-danger-soft px-3 py-2 text-meta text-ink">
          <Icon name="alert" className="mt-px h-4 w-4 text-danger" />
          Pengalaman › #1 › tanggal selesai
        </p>
      </>
    ),
  },
  {
    title: "Cari lowongan",
    body: "Tentukan peran dan lokasi. Hasil dari 30 hari terakhir, yang terbaru di depan.",
    example: (
      <div className="group">
        <Tag>Kemarin</Tag>
        <p className="mt-3 text-body font-bold text-ink">Backend Engineer</p>
        <p className="text-meta font-light text-ink-2">Perusahaan Contoh</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="flex gap-1.5">
            <Tag>Remote</Tag>
            <Tag tone="outline">Himalayas</Tag>
          </span>
          <ArrowDot className="h-7 w-7" />
        </div>
      </div>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="cara-kerja" aria-labelledby="cara-kerja-heading" className="tone-dark surface-dark scroll-mt-[4.5rem]">
      <div className="page py-24 sm:py-32">
        <h2 id="cara-kerja-heading" className={`${titleClass} max-w-[20ch]`}>
          Tiga langkah, <strong>tanpa formulir panjang</strong>.
        </h2>
        <ol className="mt-16 grid gap-12 lg:grid-cols-3 lg:gap-8">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="relative lg:after:absolute lg:after:top-5 lg:after:right-4 lg:after:left-16 lg:after:h-px lg:after:bg-line lg:last:after:hidden"
            >
              <span className="tabular grid h-10 w-10 place-items-center rounded-full border border-line-strong text-body text-ink">
                {index + 1}
              </span>
              <h3 className="mt-6 text-heading font-bold text-ink">{step.title}</h3>
              <p className="mt-2 max-w-[28rem] text-body text-ink-2">{step.body}</p>
              <Example>{step.example}</Example>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
