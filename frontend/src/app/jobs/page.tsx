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
    <main className="min-h-[100svh]">
      <AppHeader active="jobs" userEmail={user.email ?? ""} />
      <JobSearchPanel
        userId={user.id}
        hasProfile={Boolean(profile)}
        initialPreferences={preferences}
        initialListings={(listings as JobListingRow[]) ?? []}
      />
    </main>
  );
}
