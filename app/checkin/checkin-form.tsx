"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { LIFE_AREAS, MOOD_LABELS } from "@/lib/areas";
import { TapChip } from "@/components/tap-chip";
import { saveCheckin } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    // bottom-20: nổi trên bottom nav (h-14 + safe area)
    <button
      type="submit"
      disabled={pending}
      className="sticky bottom-20 mt-2 h-12 cursor-pointer rounded-xl bg-primary font-semibold text-primary-fg shadow-lg transition-[background-color,transform] duration-150 hover:bg-primary-strong active:scale-[0.98] disabled:opacity-50"
    >
      {pending ? "Đang lưu…" : "Lưu check-in"}
    </button>
  );
}

export function CheckinForm({
  date,
  initialMood,
  initialHours,
}: {
  date: string;
  initialMood: number;
  initialHours: Record<string, number>;
}) {
  const [mood, setMood] = useState(initialMood);
  const [hours, setHours] = useState<Record<string, number>>(() => {
    const base: Record<string, number> = {};
    for (const area of LIFE_AREAS) base[area.key] = initialHours[area.key] ?? 0;
    return base;
  });

  const total = Object.values(hours).reduce((sum, h) => sum + h, 0);

  return (
    <form action={saveCheckin} className="mt-5 flex flex-col gap-4">
      <input type="hidden" name="date" value={date} />
      <input type="hidden" name="mood" value={mood} />

      <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
        <span className="text-sm font-semibold">Tâm trạng hôm nay</span>
        <div className="mt-2.5 grid grid-cols-5 gap-1.5">
          {MOOD_LABELS.map((label, i) => {
            const level = i + 1;
            return (
              <TapChip
                key={level}
                selected={mood === level}
                onClick={() => setMood(level)}
                className="px-1 text-xs"
              >
                {label}
              </TapChip>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm">
        {LIFE_AREAS.map((area) => {
          const value = hours[area.key];
          return (
            <div key={area.key}>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium">{area.name}</span>
                <span
                  className={`text-sm font-semibold tabular-nums ${
                    value > 0 ? "text-primary-ink" : "text-faint"
                  }`}
                >
                  {value.toFixed(1)}h
                </span>
              </div>
              <input type="hidden" name={`hours_${area.key}`} value={value} />
              <input
                type="range"
                min={0}
                max={12}
                step={0.5}
                value={value}
                aria-label={`Số giờ cho ${area.name}`}
                onChange={(e) =>
                  setHours((prev) => ({ ...prev, [area.key]: Number(e.target.value) }))
                }
                className="mt-1 w-full cursor-pointer"
              />
            </div>
          );
        })}
        <p className="border-t border-border pt-3 text-right text-sm text-muted">
          Tổng:{" "}
          <span className="font-semibold tabular-nums text-foreground">
            {total.toFixed(1)}h
          </span>
        </p>
      </div>

      <SubmitButton />
    </form>
  );
}
