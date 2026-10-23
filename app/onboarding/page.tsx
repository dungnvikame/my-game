import { createClient } from "@/lib/supabase/server";
import type { AreaKey } from "@/lib/areas";
import { OnboardingWizard } from "./wizard";

export const instant = false; // đọc cookies/session mỗi request, không prerender

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("area_weights")
    .select("area_key, weight");

  const initialWeights: Partial<Record<AreaKey, number>> = {};
  for (const row of existing ?? []) {
    initialWeights[row.area_key as AreaKey] = row.weight;
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <OnboardingWizard initialWeights={initialWeights} />
    </main>
  );
}
