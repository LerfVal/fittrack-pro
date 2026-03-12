import { CustomTooltipProps } from "@/types";

export default function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm shadow-xl">
      <p className="text-zinc-400 text-xs mb-1">{label}</p>
      <p className="text-white font-semibold">
        {payload[0].value.toLocaleString()} lbs
      </p>
    </div>
  );
}
