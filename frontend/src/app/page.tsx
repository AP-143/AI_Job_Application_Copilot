import { createClient } from "@/lib/supabase/server";
import Dashboard from "@/components/Dashboard";
import Landing from "@/components/landing/Landing";
import type { CandidateProfileRow } from "@/lib/types";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <Landing />;
  }

  const { data: profileRow } = await supabase
    .from("candidate_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<CandidateProfileRow>();

  return (
    <Dashboard
      userId={user.id}
      userEmail={user.email ?? ""}
      initialProfile={profileRow}
    />
  );
}
