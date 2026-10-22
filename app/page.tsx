import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const instant = false; // đọc cookies/session mỗi request, không prerender

// Điều hướng theo trạng thái: chưa login → /login (middleware lo),
// chưa onboard → /onboarding, còn lại → /checkin.
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded_at")
    .eq("id", user.id)
    .single();

  if (!profile?.onboarded_at) redirect("/onboarding");
  redirect("/checkin");
}
