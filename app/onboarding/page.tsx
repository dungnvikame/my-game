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
      <h1 className="text-xl font-bold">Giai đoạn này, điều gì quan trọng với bạn?</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Chấm mức ưu tiên 1–5 cho từng mảng. Đây là chuẩn để app đo độ cân bằng —
        sửa lại được bất cứ lúc nào.
      </p>

      <form action={saveWeights} className="mt-6 flex flex-col gap-5">
        {LIFE_AREAS.map((area) => (
          <WeightRow
            key={area.key}
            area={area}
            initial={current.get(area.key) ?? DEFAULT_WEIGHT}
          />
        ))}
        <button
          type="submit"
          className="mt-2 rounded-lg bg-neutral-900 px-4 py-3 font-medium text-white"
        >
          Bắt đầu
        </button>
      </form>
    </main>
  );
}
