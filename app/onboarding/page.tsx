import { createClient } from "@/lib/supabase/server";
import { LIFE_AREAS, DEFAULT_WEIGHT, type AreaKey } from "@/lib/areas";

export const instant = false; // đọc cookies/session mỗi request, không prerender
import { saveWeights } from "./actions";
import { WeightRow } from "./weight-row";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("area_weights")
    .select("area_key, weight");

  const current = new Map<string, number>(
    (existing ?? []).map((row) => [row.area_key as AreaKey, row.weight as number])
  );

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="text-2xl font-bold tracking-tight">
        Giai đoạn này, điều gì quan trọng với bạn?
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Chấm mức ưu tiên 1–5 cho từng mảng. Đây là chuẩn để app đo độ cân bằng —
        sửa lại được bất cứ lúc nào.
      </p>

      <form action={saveWeights} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5 shadow-sm">
          {LIFE_AREAS.map((area) => (
            <WeightRow
              key={area.key}
              area={area}
              initial={current.get(area.key) ?? DEFAULT_WEIGHT}
            />
          ))}
        </div>
        <button
          type="submit"
          className="h-12 cursor-pointer rounded-xl bg-primary font-semibold text-primary-fg shadow-sm transition-[background-color,transform] duration-150 hover:bg-primary-strong active:scale-[0.98]"
        >
          Bắt đầu
        </button>
      </form>
    </main>
  );
}
