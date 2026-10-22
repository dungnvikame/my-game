"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

export interface WheelDatum {
  name: string;
  /** Fulfillment % (0-150, đã cap). */
  pct: number;
  /** Giờ thô 7 ngày — hiển thị cạnh %, tránh cảm giác sai từ % thuần. */
  hours: number;
}

// Bánh xe cân bằng 7 ngày: 1 series duy nhất (fulfillment %), kèm bảng giờ thô.
export function BalanceWheel({ data }: { data: WheelDatum[] }) {
  return (
    <div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="72%">
            <PolarGrid stroke="var(--chart-grid)" />
            <PolarAngleAxis
              dataKey="name"
              tick={{ fill: "var(--chart-text)", fontSize: 11 }}
            />
            <PolarRadiusAxis domain={[0, 150]} tick={false} axisLine={false} />
            <Radar
              dataKey="pct"
              stroke="var(--chart-accent)"
              fill="var(--chart-accent)"
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Bảng giờ thô + % — nguồn đọc chính trên mobile, radar là tổng quan */}
      <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
        {data.map((row) => (
          <li key={row.name} className="flex items-baseline justify-between gap-2">
            <span className="truncate text-neutral-500">{row.name}</span>
            <span className="shrink-0 tabular-nums">
              {row.hours.toFixed(1)}h
              <span className="ml-1.5 text-xs text-neutral-400">
                {Math.round(row.pct)}%
              </span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-neutral-400">
        % = giờ thực tế so với mức &ldquo;đủ&rdquo; suy từ trọng số (100% là đủ, trần 150%).
      </p>
    </div>
  );
}
