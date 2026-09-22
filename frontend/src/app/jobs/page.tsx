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
    <main className="min-h-[100svh] bg-paper text-ink">
      <AppHeader active="jobs" userEmail={user.email ?? ""} />
      <div className="relative mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-12 lg:px-10 lg:py-16">
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-4 hidden w-px bg-line sm:left-6 lg:block lg:left-10"
        />

        <header className="relative grid gap-8 border-b border-line pb-10 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-end lg:pb-14">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
              02 / Global application desk
            </p>
            <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[0.93] tracking-[-0.045em] text-ink sm:text-6xl lg:text-7xl">
              Meja pencarian global.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-ink-soft sm:text-lg">
              Susun brief yang spesifik, pantau pasar kerja, lalu pilih
              lowongan yang layak masuk ke dossier lamaran kamu.
            </p>
          </div>

          <div className="border-l-2 border-accent pl-4">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-soft">
              Search protocol
            </p>
            <p className="mt-2 text-sm leading-5 text-ink">
              Brief dahulu. Keputusan setelah fakta terkumpul.
            </p>
          </div>
        </header>

        <div className="relative pt-10 sm:pt-12">
          <JobSearchPanel
            userId={user.id}
            hasProfile={Boolean(profile)}
            initialPreferences={preferences}
            initialListings={(listings as JobListingRow[]) ?? []}
          />
        </div>
      </div>
    </main>
  );
}
