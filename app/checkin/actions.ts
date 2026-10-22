"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LIFE_AREAS } from "@/lib/areas";

export async function saveCheckin(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const date = String(formData.get("date") ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Ngày không hợp lệ");

  const moodRaw = Number(formData.get("mood"));
  const mood = Number.isInteger(moodRaw) && moodRaw >= 1 && moodRaw <= 5 ? moodRaw : 3;

  const { data: checkin, error: checkinError } = await supabase
    .from("daily_checkins")
    .upsert({ user_id: user.id, date, mood }, { onConflict: "user_id,date" })
    .select("id")
    .single();
  if (checkinError || !checkin)
    throw new Error(`Không lưu được check-in: ${checkinError?.message}`);

  const hours = LIFE_AREAS.map((area) => {
    const raw = Number(formData.get(`hours_${area.key}`));
    const value = Number.isFinite(raw) && raw >= 0 && raw <= 24 ? raw : 0;
    return { checkin_id: checkin.id, area_key: area.key, hours: value };
  });

  const { error: hoursError } = await supabase
    .from("checkin_hours")
    .upsert(hours, { onConflict: "checkin_id,area_key" });
  if (hoursError) throw new Error(`Không lưu được số giờ: ${hoursError.message}`);

  revalidatePath("/checkin");
  redirect("/checkin?saved=1");
}
