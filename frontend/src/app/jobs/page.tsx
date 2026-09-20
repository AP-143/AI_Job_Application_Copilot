import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

  const [{ data: preferences }, { data: listings }] = await Promise.all([
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
  ]);

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-2xl px-6 py-20">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">
            Job Application Copilot
          </p>
          <a
            href="/"
            className="text-xs text-ink-soft underline underline-offset-4 hover:text-ink"
          >
            Profil
          </a>
        </div>

        <h1 className="mt-3 font-display text-4xl leading-tight text-ink">
          Cari lowongan.
        </h1>

        <div className="mt-10">
          <JobSearchPanel
            userId={user.id}
            initialPreferences={preferences}
            initialListings={(listings as JobListingRow[]) ?? []}
          />
        </div>
      </div>
    </main>
  );
}
