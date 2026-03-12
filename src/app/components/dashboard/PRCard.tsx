import { PR } from "@/app/types";

interface PRCardProps {
  prs: PR[];
}

export default function PRCard({ prs }: PRCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <h2 className="text-base font-semibold text-white mb-5">
        Personal Records
      </h2>
      <div className="flex flex-col gap-4">
        {prs.map((pr) => (
          <div key={pr.exercise} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">{pr.exercise}</p>
              <p className="text-xs text-zinc-500">{pr.date}</p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold px-2.5 py-1 rounded-lg">
              {pr.weight}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
