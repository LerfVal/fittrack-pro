"use client";

import { useState, useEffect } from "react"; // useEffect for data fetching on mount
import { useRouter } from "next/navigation";
import Sidebar from "@/app/components/dashboard/Sidebar";
import StatCards from "@/app/components/dashboard/StatCards";
import PerformanceChart from "@/app/components/dashboard/PerformanceChart";
import PRCard from "@/app/components/dashboard/PRCard";
import RecentWorkouts from "@/app/components/dashboard/RecentWorkouts";
import { useAuth } from "@/app/context/AuthContext";
import { navItems } from "@/app/lib/data"; // Still use static nav items

// --- TYPES ---
// These match the shape of data returned by our API endpoints

interface StatSummary {
  totalWorkouts: number;
  totalVolume: number;
  streak: number;
  avgDuration: number;
}

interface Workout {
  id: number;
  title: string;
  completed_at: string;
  total_sets: number;
}

interface ProgressPoint {
  date: string;
  max_weight: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, token } = useAuth(); // Get user and JWT token from auth context

  const [activeNav, setActiveNav] = useState("Dashboard");

  // --- DATA STATE ---
  // Each piece of API data has its own state variable
  const [statSummary, setStatSummary] = useState<StatSummary | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [benchProgress, setBenchProgress] = useState<ProgressPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true); // True while any data is loading

  // --- GREETING & DATE ---
  const firstName = user?.name?.split(" ")[0] || "there";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  // --- FETCH ALL DASHBOARD DATA ---
  // We use Promise.all to fetch all three endpoints simultaneously instead of
  // waiting for each one to finish before starting the next.
  // This is faster — all three requests happen in parallel.
  useEffect(() => {
    const fetchDashboardData = async () => {
      // Don't fetch if we don't have a token yet
      if (!token) return;

      setIsLoading(true);

      try {
        // Fire all three requests at the same time
        const [summaryRes, workoutsRes, progressRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stats/summary`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/workouts`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          // exercise_id 1 = Bench Press (our first seeded exercise)
          // TODO: make this dynamic so user can pick which exercise to track
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/stats/progress/1`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Parse all responses as JSON
        const [summaryData, workoutsData, progressData] = await Promise.all([
          summaryRes.json(),
          workoutsRes.json(),
          progressRes.json(),
        ]);

        // Update state with the real data
        setStatSummary(summaryData);
        setRecentWorkouts(workoutsData.slice(0, 4)); // Show only 4 most recent
        setBenchProgress(progressData);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setIsLoading(false); // Always hide loading state when done
      }
    };

    fetchDashboardData();
  }, [token]); // Re-fetch if token changes

  // --- MAP API DATA TO STAT CARDS FORMAT ---
  // StatCards expects an array of { label, value, sub, up } objects.
  // We build this from the real API data, falling back to "—" while loading.
  const stats = [
    {
      label: "Workouts This Month",
      value: statSummary ? String(statSummary.totalWorkouts) : "—",
      sub: "this month",
      up: true,
    },
    {
      label: "Total Volume",
      value: statSummary
        ? statSummary.totalVolume >= 1000
          ? `${(statSummary.totalVolume / 1000).toFixed(1)}K` // Format as e.g. "12.4K"
          : String(statSummary.totalVolume)
        : "—",
      sub: "lbs lifted this month",
      up: true,
    },
    {
      label: "Current Streak",
      value: statSummary ? String(statSummary.streak) : "—",
      sub: "days in a row",
      up: statSummary ? statSummary.streak > 0 : false,
    },
    {
      label: "Avg Duration",
      value: statSummary ? String(statSummary.avgDuration) : "—",
      sub: "minutes per session",
      up: false,
    },
  ];

  // --- MAP WORKOUTS TO RECENT WORKOUTS FORMAT ---
  // RecentWorkouts expects specific fields — map the API response to match
  const mappedWorkouts = recentWorkouts.map((w) => ({
    id: w.id,
    title: w.title,
    // Format the date — e.g. "Mar 12, 8:00 AM"
    date: new Date(w.completed_at).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    duration: `${Math.round(Number(w.total_sets) * 3)} min`, // Estimated duration
    exercises: Math.ceil(Number(w.total_sets) / 3), // Rough estimate of exercises
    volume: `${w.total_sets} sets`,
    tag: "Strength",
    tagColor: "bg-orange-500",
  }));

  // --- MAP PROGRESS DATA TO CHART FORMAT ---
  // PerformanceChart expects { date, weight } objects
  const chartProgress = benchProgress.map((p) => ({
    date: new Date(p.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    weight: parseFloat(p.max_weight),
  }));

  // --- WEEKLY VOLUME PLACEHOLDER ---
  // TODO: Replace with real weekly volume data from a dedicated API endpoint
  const weeklyVolume = [
    { day: "Mon", volume: 0 },
    { day: "Tue", volume: 0 },
    { day: "Wed", volume: 0 },
    { day: "Thu", volume: 0 },
    { day: "Fri", volume: 0 },
    { day: "Sat", volume: 0 },
    { day: "Sun", volume: 0 },
  ];

  return (
    <div
      style={{ fontFamily: "'DM Sans', 'Sora', sans-serif" }}
      className="min-h-screen bg-zinc-950 text-white flex"
    >
      <Sidebar
        navItems={navItems}
        activeNav={activeNav}
        onNavChange={setActiveNav}
      />

      <main className="flex-1 md:ml-60 px-4 md:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-zinc-500 text-sm mb-1">{today}</p>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {getGreeting()}, {firstName} 👋
            </h1>
          </div>
          <button
            onClick={() => router.push("/workouts/new")}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 transition-colors text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-orange-500/25"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Log Workout
          </button>
        </div>

        {/* Loading spinner — shown while API calls are in flight */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <svg
                className="w-8 h-8 animate-spin text-orange-500"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
              <p className="text-zinc-500 text-sm">Loading your data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Real stat cards from /api/stats/summary */}
            <StatCards stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
              {/* Chart with real bench press progress from /api/stats/progress/1 */}
              <PerformanceChart
                weeklyVolume={weeklyVolume}
                benchProgress={
                  chartProgress.length > 0
                    ? chartProgress
                    : [{ date: "No data yet", weight: 0 }]
                }
              />
              {/* PR card showing the max bench press weight */}
              <PRCard
                prs={[
                  {
                    exercise: "Bench Press",
                    weight:
                      chartProgress.length > 0
                        ? `${Math.max(...chartProgress.map((p) => p.weight))} lbs`
                        : "No data",
                    date:
                      chartProgress.length > 0
                        ? chartProgress[chartProgress.length - 1].date
                        : "—",
                  },
                ]}
              />
            </div>

            {/* Real recent workouts from /api/workouts */}
            <RecentWorkouts workouts={mappedWorkouts} />
          </>
        )}
      </main>
    </div>
  );
}
