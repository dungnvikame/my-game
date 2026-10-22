"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LIFE_AREAS } from "@/lib/areas";
import { currentWeekKey, previousWeekKey } from "@/lib/balance/review-week";
import { todayDate } from "@/lib/balance/today";

export async function saveReview(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const isoWeek = String(formData.get("iso_week") ?? "");
  // Chỉ nhận tuần ISO hợp lệ (W01-W53)
  if (!/^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/.test(isoWeek))
    throw new Error("Tuần không hợp lệ");

  // Enforce cửa sổ review ở server: tuần hiện tại, hoặc tuần trước trong 3 ngày đầu tuần
  const today = todayDate();
  const allowed = new Set([currentWeekKey(today)]);
  const dayOfWeek = today.getDay();
  if (dayOfWeek >= 1 && dayOfWeek <= 3) allowed.add(previousWeekKey(today));
  if (!allowed.has(isoWeek))
    throw new Error("Ngoài cửa sổ review (tuần hiện tại, hoặc làm bù T2-T4)");

  const areaScores: Record<string, number> = {};
  for (const area of LIFE_AREAS) {
    const raw = Number(formData.get(`score_${area.key}`));
    areaScores[area.key] =
      Number.isInteger(raw) && raw >= 1 && raw <= 10 ? raw : 5;
  }

  // Ghi chú là dữ liệu nhạy cảm — không log ra console.
  const noteRaw = String(formData.get("note") ?? "").trim();
  const note = noteRaw === "" ? null : noteRaw.slice(0, 2000);

  const { error } = await supabase.from("weekly_reviews").upsert(
    {
      user_id: user.id,
      iso_week: isoWeek,
      area_scores: areaScores,
      note,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,iso_week" }
  );
  if (error) throw new Error(`Không lưu được review: ${error.message}`);

  revalidatePath("/review");
  redirect(`/review?saved=${isoWeek}`);
}
