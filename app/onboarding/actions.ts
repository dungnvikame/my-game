"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LIFE_AREAS, type AreaKey } from "@/lib/areas";
import { TEMPLATE_BY_ID } from "@/lib/onboarding/templates";

export interface OnboardingPayload {
  weights: Partial<Record<AreaKey, number>>;
  baseline: Partial<Record<AreaKey, number>>;
  routineTemplateIds: string[];
}

/** Hoàn tất onboarding: lưu trọng số + baseline + ngày tiêu chuẩn, rồi sang màn nhận định. */
export async function completeOnboarding(payload: OnboardingPayload) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Validate từng mảng — không tin dữ liệu client
  const weights: { user_id: string; area_key: AreaKey; weight: number }[] = [];
  const baseline: Partial<Record<AreaKey, number>> = {};
  for (const area of LIFE_AREAS) {
    const w = Number(payload.weights[area.key]);
    const s = Number(payload.baseline[area.key]);
    if (!Number.isInteger(w) || w < 1 || w > 5)
      throw new Error(`Trọng số ${area.name} không hợp lệ`);
    if (!Number.isInteger(s) || s < 1 || s > 10)
      throw new Error(`Mức hài lòng ${area.name} không hợp lệ`);
    weights.push({ user_id: user.id, area_key: area.key, weight: w });
    baseline[area.key] = s;
  }

  const { error: weightError } = await supabase
    .from("area_weights")
    .upsert(weights, { onConflict: "user_id,area_key" });
  if (weightError) throw new Error(`Không lưu được trọng số: ${weightError.message}`);

  const { error: profileError } = await supabase.from("profiles").upsert(
    { id: user.id, baseline, onboarded_at: new Date().toISOString() },
    { onConflict: "id" }
  );
  if (profileError) throw new Error(`Không lưu được hồ sơ: ${profileError.message}`);

  // Dựng ngày tiêu chuẩn từ template đã chọn — tra theo id, bỏ qua trùng label đã có
  const templates = [...new Set(payload.routineTemplateIds)]
    .map((id) => TEMPLATE_BY_ID.get(id))
    .filter((t) => t !== undefined);
  if (templates.length > 0) {
    const { data: existing } = await supabase.from("routines").select("label");
    const existingLabels = new Set((existing ?? []).map((r) => r.label));
    const rows = templates
      .filter((t) => !existingLabels.has(t.label))
      .map((t) => ({
        user_id: user.id,
        area_key: t.areaKey,
        label: t.label,
        minutes: t.minutes,
      }));
    if (rows.length > 0) {
      const { error } = await supabase.from("routines").insert(rows);
      if (error) throw new Error(`Không tạo được ngày tiêu chuẩn: ${error.message}`);
    }
  }

  redirect("/onboarding/summary");
}
