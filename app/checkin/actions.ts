"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LIFE_AREAS } from "@/lib/areas";
import { todayYMD } from "@/lib/balance/today";
import { isValidCheckinDate } from "@/lib/balance/checkin-window";

const AREA_KEYS = new Set(LIFE_AREAS.map((area) => area.key as string));

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

/** Lưu tâm trạng của một ngày — gọi ngay khi tap, không cần nút lưu. */
export async function setMood(date: string, mood: number) {
  const { supabase, user } = await requireUser();
  if (!isValidCheckinDate(date, todayYMD())) throw new Error("Ngày không hợp lệ");
  if (!Number.isInteger(mood) || mood < 1 || mood > 5)
    throw new Error("Tâm trạng không hợp lệ");

  const { error } = await supabase
    .from("daily_checkins")
    .upsert({ user_id: user.id, date, mood }, { onConflict: "user_id,date" });
  if (error) throw new Error(`Không lưu được tâm trạng: ${error.message}`);
  revalidatePath("/checkin");
}

/** Thêm một hoạt động — bằng chứng đã dành thời gian cho mảng nào đó. */
export async function addActivity(formData: FormData) {
  const { supabase, user } = await requireUser();

  const date = String(formData.get("date") ?? "");
  if (!isValidCheckinDate(date, todayYMD())) throw new Error("Ngày không hợp lệ");

  const areaKey = String(formData.get("area_key") ?? "");
  if (!AREA_KEYS.has(areaKey)) throw new Error("Chọn một mảng trước khi thêm");

  const minutes = Number(formData.get("minutes"));
  if (!Number.isInteger(minutes) || minutes <= 0 || minutes > 1440)
    throw new Error("Thời lượng không hợp lệ");

  const noteRaw = String(formData.get("note") ?? "").trim();
  const note = noteRaw === "" ? null : noteRaw.slice(0, 200);

  const { error } = await supabase
    .from("activities")
    .insert({ user_id: user.id, date, area_key: areaKey, minutes, note });
  if (error) throw new Error(`Không thêm được hoạt động: ${error.message}`);
  revalidatePath("/checkin");
}

/** Xóa một hoạt động vừa ghi (nhầm tay) — RLS đảm bảo chỉ xóa của chính mình. */
export async function deleteActivity(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error("Hoạt động không hợp lệ");

  const { error } = await supabase.from("activities").delete().eq("id", id);
  if (error) throw new Error(`Không xóa được: ${error.message}`);
  revalidatePath("/checkin");
}
