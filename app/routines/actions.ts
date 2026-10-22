"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LIFE_AREAS } from "@/lib/areas";

const AREA_KEYS = new Set(LIFE_AREAS.map((area) => area.key as string));

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

/** Thêm một hoạt động vào "ngày tiêu chuẩn". */
export async function addRoutine(formData: FormData) {
  const { supabase, user } = await requireUser();

  const areaKey = String(formData.get("area_key") ?? "");
  if (!AREA_KEYS.has(areaKey)) throw new Error("Chọn một mảng trước khi thêm");

  const minutes = Number(formData.get("minutes"));
  if (!Number.isInteger(minutes) || minutes <= 0 || minutes > 1440)
    throw new Error("Thời lượng không hợp lệ");

  const label = String(formData.get("label") ?? "").trim().slice(0, 100);
  if (label === "") throw new Error("Đặt tên cho hoạt động (vd: Chạy bộ sáng)");

  const { error } = await supabase
    .from("routines")
    .insert({ user_id: user.id, area_key: areaKey, minutes, label });
  if (error) throw new Error(`Không thêm được: ${error.message}`);
  revalidatePath("/routines");
  revalidatePath("/checkin");
}

/** Bỏ một hoạt động khỏi ngày tiêu chuẩn — activity cũ đã tích vẫn giữ nguyên. */
export async function deleteRoutine(formData: FormData) {
  const { supabase } = await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error("Không hợp lệ");

  const { error } = await supabase.from("routines").delete().eq("id", id);
  if (error) throw new Error(`Không xóa được: ${error.message}`);
  revalidatePath("/routines");
  revalidatePath("/checkin");
}
