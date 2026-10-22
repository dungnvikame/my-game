"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Plus } from "lucide-react";
import { LIFE_AREAS, type AreaKey } from "@/lib/areas";
import { TapChip } from "@/components/tap-chip";
import { addActivity } from "./actions";

// Thời lượng tap-only — không gõ số, thêm 1 hoạt động < 10 giây
const DURATIONS = [
  { minutes: 15, label: "15p" },
  { minutes: 30, label: "30p" },
  { minutes: 45, label: "45p" },
  { minutes: 60, label: "1h" },
  { minutes: 90, label: "1h30" },
  { minutes: 120, label: "2h" },
  { minutes: 180, label: "3h" },
  { minutes: 240, label: "4h" },
] as const;

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="flex h-12 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-primary font-semibold text-primary-fg shadow-sm transition-[background-color,transform] duration-150 hover:bg-primary-strong active:scale-[0.98] disabled:opacity-50"
    >
      <Plus size={18} aria-hidden />
      {pending ? "Đang thêm…" : "Thêm hoạt động"}
    </button>
  );
}

export function ActivityForm({ date }: { date: string }) {
  const [area, setArea] = useState<AreaKey | null>(null);
  const [minutes, setMinutes] = useState(30);

  return (
    <form
      action={addActivity}
      className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 shadow-sm"
    >
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="area_key" value={area ?? ""} />
      <input type="hidden" name="minutes" value={minutes} />

      <span className="text-sm font-semibold">Vừa dành thời gian cho…</span>
      <div className="grid grid-cols-4 gap-1.5">
        {LIFE_AREAS.map((item) => (
          <TapChip
            key={item.key}
            selected={area === item.key}
            onClick={() => setArea(item.key)}
            className="px-1 text-xs"
          >
            {item.key === "meaning" ? "Ý nghĩa" : item.name}
          </TapChip>
        ))}
      </div>

      <span className="mt-1 text-sm font-semibold">Trong bao lâu?</span>
      <div className="grid grid-cols-4 gap-1.5">
        {DURATIONS.map((d) => (
          <TapChip
            key={d.minutes}
            selected={minutes === d.minutes}
            onClick={() => setMinutes(d.minutes)}
            className="text-xs"
          >
            {d.label}
          </TapChip>
        ))}
      </div>

      <input
        type="text"
        name="note"
        maxLength={200}
        placeholder="Bạn đã làm gì? (vd: chạy bộ 5km, đọc sách…)"
        className="h-12 w-full rounded-xl border border-border bg-surface px-4 text-base transition-colors duration-150 placeholder:text-faint focus:border-primary focus:outline-none"
      />

      <SubmitButton disabled={area === null} />
    </form>
  );
}
