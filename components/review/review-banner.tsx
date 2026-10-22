import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  currentWeekKey,
  previousWeekKey,
  shouldRemindReview,
} from "@/lib/balance/review-week";
import { todayDate } from "@/lib/balance/today";

// Banner nhắc weekly review (CN, hoặc T2-T4 khi tuần trước chưa review).
// Server component: tự truy vấn, render null khi không cần nhắc.
export async function ReviewBanner() {
  const today = todayDate();
  const candidates = [currentWeekKey(today), previousWeekKey(today)];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("weekly_reviews")
    .select("iso_week")
    .in("iso_week", candidates);

  // Lỗi (vd migration chưa chạy) → im lặng, không chặn trang chính
  if (error) return null;

  const reviewed = new Set((data ?? []).map((row) => row.iso_week));
  if (!shouldRemindReview(today, reviewed)) return null;

  return (
    <Link
      href="/review"
      className="mt-4 block rounded-xl bg-primary-soft px-4 py-3 text-sm font-medium text-primary-ink transition-transform duration-150 active:scale-[0.99]"
    >
      Đến giờ weekly review — 5 phút nhìn lại tuần của bạn →
    </Link>
  );
}
