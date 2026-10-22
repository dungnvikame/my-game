import Link from "next/link";
import { ArrowLeft, X } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { LIFE_AREAS, type AreaKey } from "@/lib/areas";
import { formatMinutes } from "@/lib/balance/format";
import { AppNav } from "@/components/app-nav";
import { RoutineForm } from "./routine-form";
import { deleteRoutine } from "./actions";

export const instant = false; // đọc cookies/session mỗi request, không prerender

export default async function RoutinesPage() {
  const supabase = await createClient();
  const { data: routines } = await supabase
    .from("routines")
    .select("id, area_key, label, minutes")
    .order("created_at");

  const nameByKey = new Map(LIFE_AREAS.map((area) => [area.key, area.name]));

  return (
    <>
      <AppNav />
      <main className="mx-auto max-w-md px-4 pb-24 pt-6">
        <Link
          href="/checkin"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground"
        >
          <ArrowLeft size={16} aria-hidden /> Về Hôm nay
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Ngày tiêu chuẩn</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          Những việc bạn làm gần như mỗi ngày. Khi check-in chỉ cần tích ✓ việc đã
          làm — nhanh hơn nhiều so với ghi tay từng cái.
        </p>

        <div className="mt-5 flex flex-col gap-4">
          <RoutineForm />

          {(routines ?? []).length > 0 && (
            <section className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
              <h2 className="text-sm font-semibold">
                Ngày tiêu chuẩn của bạn ({routines!.length})
              </h2>
              <ul className="mt-2 flex flex-col">
                {routines!.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-3 border-b border-border py-2.5 last:border-b-0"
                  >
                    <span className="w-24 shrink-0 text-xs font-medium text-primary-ink">
                      {nameByKey.get(r.area_key as AreaKey) ?? r.area_key}
                    </span>
                    <span className="flex-1 text-sm">{r.label}</span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      {formatMinutes(r.minutes)}
                    </span>
                    <form action={deleteRoutine} className="shrink-0">
                      <input type="hidden" name="id" value={r.id} />
                      <button
                        type="submit"
                        aria-label={`Bỏ ${r.label} khỏi ngày tiêu chuẩn`}
                        className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-faint transition-colors duration-150 hover:bg-surface-2 hover:text-danger"
                      >
                        <X size={16} aria-hidden />
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
