"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LIFE_AREAS } from "@/lib/areas";
import { currentWeekKey } from "@/lib/balance/review-week";
import { todayDate } from "@/lib/balance/today";

const RULE_KEYS = new Set(["r1_shortfall", "r2_mismatch", "r3_overload"]);
const AREA_KEYS = new Set(LIFE_AREAS.map((area) => area.key as string));

/** Ghi phản hồi Nhận/Bỏ qua cho một gợi ý của tuần hiện tại. */
export async function reactToSuggestion(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const areaKey = String(formData.get("area_key") ?? "");
  const ruleKey = String(formData.get("rule_key") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!AREA_KEYS.has(areaKey) || !RULE_KEYS.has(ruleKey))
    throw new Error("Gợi ý không hợp lệ");
  if (status !== "accepted" && status !== "dismissed")
    throw new Error("Trạng thái không hợp lệ");

  // Tuần luôn tính ở server — không tin client
  const isoWeek = currentWeekKey(todayDate());

  const { error } = await supabase.from("suggestions").upsert(
    { user_id: user.id, iso_week: isoWeek, area_key: areaKey, rule_key: ruleKey, status },
    { onConflict: "user_id,iso_week,area_key,rule_key" }
  );
  if (error) throw new Error(`Không lưu được phản hồi: ${error.message}`);

  revalidatePath("/dashboard");
}
