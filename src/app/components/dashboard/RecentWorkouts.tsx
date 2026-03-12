import { Workout } from "@/app/types";

interface RecentWorkoutsProps {
  workouts: Workout[];
}

export default function RecentWorkouts({ workouts }: RecentWorkoutsProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-white">Recent Workouts</h2>
        <button className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors">
          View all →
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {workouts.map((w) => (
          <div
            key={w.id}
            className="flex items-center justify-between p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-zinc-700 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/10 transition-colors">
                <svg
                  className="w-5 h-5 text-zinc-400 group-hover:text-orange-400 transition-colors"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-white">{w.title}</p>
                  <span
                    className={`${w.tagColor} text-white text-xs px-2 py-0.5 rounded-full font-medium`}
                  >
                    {w.tag}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">{w.date}</p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-6 text-right">
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Duration</p>
                <p className="text-sm font-semibold text-white">{w.duration}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Exercises</p>
                <p className="text-sm font-semibold text-white">
                  {w.exercises}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">Volume</p>
                <p className="text-sm font-semibold text-white">{w.volume}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
