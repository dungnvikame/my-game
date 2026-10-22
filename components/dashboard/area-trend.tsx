"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { LIFE_AREAS, type AreaKey } from "@/lib/areas";

export interface TrendWeek {
  isoWeek: string; // "2026-W43"
  /** null = tuần không có check-in nào → vẽ gap thay vì 0 giả. */
  hoursByArea: Partial<Record<AreaKey, number>> | null;
  avgMood: number | null;
}

const axisTick = { fill: "var(--chart-text)", fontSize: 11 };

// Trend theo tuần cho mảng được chọn + mood trung bình.
// Hai chart nhỏ xếp dọc (1 trục/chart) thay vì dual-axis giờ/mood.
export function AreaTrend({ weeks }: { weeks: TrendWeek[] }) {
  const [area, setArea] = useState<AreaKey>("work");

  const data = weeks.map((week) => ({
    week: week.isoWeek.slice(5), // "W43"
    hours: week.hoursByArea ? (week.hoursByArea[area] ?? 0) : null,
    mood: week.avgMood === null ? null : Number(week.avgMood.toFixed(1)),
  }));

  return (
    <div>
      {/* Chọn mảng bằng tap — giữ pattern chip của onboarding */}
      <div className="flex flex-wrap gap-1.5">
        {LIFE_AREAS.map((item) => (
          <button
            key={item.key}
            type="button"
            aria-pressed={area === item.key}
            onClick={() => setArea(item.key)}
            className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
              area === item.key
                ? "bg-neutral-900 text-white"
                : "bg-neutral-100 text-neutral-600 active:bg-neutral-200"
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      <p className="mt-4 text-xs font-medium text-neutral-400">Giờ / tuần</p>
      <div className="mt-1 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
            <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="week" tick={axisTick} tickLine={false} axisLine={false} />
            <YAxis tick={axisTick} tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(value) => [`${value}h`, "Giờ"]}
              labelFormatter={(label) => `Tuần ${label}`}
            />
            <Line
              dataKey="hours"
              stroke="var(--chart-accent)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--chart-accent)" }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-3 text-xs font-medium text-neutral-400">Mood trung bình (1-5)</p>
      <div className="mt-1 h-24">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
            <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
            <XAxis dataKey="week" tick={axisTick} tickLine={false} axisLine={false} />
            <YAxis domain={[1, 5]} ticks={[1, 3, 5]} tick={axisTick} tickLine={false} axisLine={false} />
            <Tooltip
              formatter={(value) => [value, "Mood"]}
              labelFormatter={(label) => `Tuần ${label}`}
            />
            <Line
              dataKey="mood"
              stroke="var(--chart-mood)"
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--chart-mood)" }}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
