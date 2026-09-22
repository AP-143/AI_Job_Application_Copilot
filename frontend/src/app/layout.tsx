import type { Metadata } from "next";
import { Host_Grotesk } from "next/font/google";
import "./globals.css";

const host = Host_Grotesk({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-host",
});

export const metadata: Metadata = {
  title: "Application Desk",
  description:
    "Ubah CV jadi profil rapi, lalu cari lowongan global yang masih segar. Keputusan melamar tetap di tangan kamu.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`h-full ${host.variable}`}>
      <body className="flex min-h-full flex-col font-sans text-body">{children}</body>
    </html>
  );
}
