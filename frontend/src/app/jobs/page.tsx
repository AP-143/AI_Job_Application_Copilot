import type { CSSProperties } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import JobSearchPanel from "@/components/JobSearchPanel";
import type { JobListingRow, JobSearchPreferencesRow } from "@/lib/types";

export default async function JobsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: preferences }, { data: listings }, { data: profile }] =
    await Promise.all([
      supabase
        .from("job_search_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle<JobSearchPreferencesRow>(),
      supabase
        .from("job_listings")
        .select("*")
        .eq("user_id", user.id)
        .order("fetched_at", { ascending: false }),
      supabase
        .from("candidate_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

  return (
    <main className="wash min-h-[100svh]">
      <AppHeader active="jobs" userEmail={user.email ?? ""} />

      <header className="page flex flex-col items-center pt-14 pb-12 text-center sm:pt-24 sm:pb-16">
        <div className="animate-rise mb-8 inline-flex flex-wrap items-center justify-center gap-1.5 rounded-full border border-line p-1.5">
          {["RemoteOK", "Himalayas", "Adzuna", "Gemini"].map((source) => (
            <span key={source} className="inline-flex min-h-7 items-center rounded-full bg-sunken px-3 text-tag font-bold uppercase text-ink">
              {source}
            </span>
          ))}
        </div>
        <h1 className="max-w-[16ch] text-[clamp(2.25rem,5.2vw,4.25rem)] leading-[1.07] font-light tracking-[-0.03em] text-ink">
          <span className="reveal-line">
            <span>Lowongan yang</span>
          </span>
          <span className="reveal-line" style={{ "--i": 1 } as CSSProperties}>
            <span>
              <strong className="font-bold">masih segar.</strong>
            </span>
          </span>
        </h1>
        <p className="animate-rise mt-6 max-w-[34rem] text-lead font-light text-ink-2" style={{ animationDelay: "300ms" }}>
          Tulis peran dan lokasi yang kamu incar. Kami cari di beberapa sumber sekaligus dan hanya menampilkan yang
          diposting dalam 30 hari terakhir.
        </p>
      </header>

      <JobSearchPanel
        userId={user.id}
        hasProfile={Boolean(profile)}
        initialPreferences={preferences}
        initialListings={(listings as JobListingRow[]) ?? []}
      />
    </main>
  );
}
