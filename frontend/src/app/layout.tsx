import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";

const instrument = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  display: "swap",
  variable: "--font-instrument",
});

// Variable weights: the app UI still uses semibold/bold labels, not only 400/500.
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Application Desk",
  description:
    "Ubah CV jadi profil rapi, lalu cari lowongan global yang masih segar. Keputusan melamar tetap di tangan kamu.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`h-full ${instrument.variable} ${inter.variable}`}>
      <body className="flex min-h-full flex-col font-sans text-body">{children}</body>
    </html>
  );
}
