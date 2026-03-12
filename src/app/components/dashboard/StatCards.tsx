import { Stat } from "@/app/types";

interface StatCardsProps {
  stats: Stat[];
}

export default function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors"
        >
          <p className="text-zinc-500 text-xs font-medium mb-3 uppercase tracking-wider">
            {s.label}
          </p>
          <p className="text-3xl font-bold text-white mb-1">{s.value}</p>
          <p
            className={`text-xs font-medium ${s.up ? "text-emerald-400" : "text-zinc-500"}`}
          >
            {s.up ? "↑ " : ""}
            {s.sub}
          </p>
        </div>
      ))}
    </div>
  );
}
