import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { todayYMD } from "@/lib/balance/today";
import { AppNav } from "@/components/app-nav";
import { ReviewBanner } from "@/components/review/review-banner";
import { CheckinForm } from "./checkin-form";

export const instant = false; // đọc cookies/session mỗi request, không prerender


export default async function CheckinPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;
  const supabase = await createClient();
  const date = todayYMD();

  const { data: checkin } = await supabase
    .from("daily_checkins")
    .select("id, mood, checkin_hours ( area_key, hours )")
    .eq("date", date)
    .maybeSingle();

  const initialHours: Record<string, number> = {};
  for (const row of checkin?.checkin_hours ?? []) {
    initialHours[row.area_key] = Number(row.hours);
  }

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-md px-4 py-6">
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-bold">Hôm nay của bạn</h1>
          <span className="text-sm text-neutral-400">{date}</span>
        </div>
        <p className="mt-1 text-sm text-neutral-500">
          Kéo nhanh số giờ cho mảng có hoạt động — bỏ qua mảng không có.
        </p>

        <Suspense fallback={null}>
          <ReviewBanner />
        </Suspense>

          {saved && (
          <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Đã lưu check-in hôm nay. Sửa lại bên dưới nếu cần.
          </p>
        )}

        <CheckinForm
          date={date}
          initialMood={checkin?.mood ?? 3}
          initialHours={initialHours}
        />
      </main>
    </>
  );
}
