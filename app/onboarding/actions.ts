"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LIFE_AREAS } from "@/lib/areas";

export async function saveWeights(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const rows = LIFE_AREAS.map((area) => {
    const raw = Number(formData.get(`weight_${area.key}`));
    const weight = Number.isInteger(raw) && raw >= 1 && raw <= 5 ? raw : 3;
    return { user_id: user.id, area_key: area.key, weight };
  });

  const { error: weightsError } = await supabase
    .from("area_weights")
    .upsert(rows, { onConflict: "user_id,area_key" });
  if (weightsError) throw new Error(`Không lưu được trọng số: ${weightsError.message}`);

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      { id: user.id, onboarded_at: new Date().toISOString() },
      { onConflict: "id" }
    );
  if (profileError) throw new Error(`Không cập nhật được profile: ${profileError.message}`);

  redirect("/checkin");
}
