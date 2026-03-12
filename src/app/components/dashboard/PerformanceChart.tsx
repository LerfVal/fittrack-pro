"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import CustomTooltip from "./CustomTooltip";
import { VolumeDataPoint, ProgressDataPoint } from "@/app/types";

interface PerformanceChartProps {
  weeklyVolume: VolumeDataPoint[];
  benchProgress: ProgressDataPoint[];
}

export default function PerformanceChart({
  weeklyVolume,
  benchProgress,
}: PerformanceChartProps) {
  const [activeChart, setActiveChart] = useState<"volume" | "progress">(
    "volume",
  );

  return (
    <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-white">Performance</h2>
        <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
          {(["volume", "progress"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveChart(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${
                activeChart === tab
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab === "volume" ? "Weekly Volume" : "Bench PR"}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        {activeChart === "volume" ? (
          <BarChart data={weeklyVolume} barSize={28}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272a"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fill: "#71717a", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
            />
            <Bar dataKey="volume" fill="#f97316" radius={[6, 6, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart data={benchProgress}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272a"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide domain={["dataMin - 10", "dataMax + 10"]} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#f97316"
              strokeWidth={2.5}
              dot={{ fill: "#f97316", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#fb923c" }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
