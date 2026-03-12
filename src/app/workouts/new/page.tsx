"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // For redirecting after save
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext"; // For the JWT token

// --- TYPES ---
// Represents a single exercise from the database
interface Exercise {
  id: number;
  name: string;
  muscle_group: string;
  equipment: string;
}

// Represents a single set within the workout logger
interface SetEntry {
  id: string; // Temporary client-side ID (not the DB id) for React keys
  exercise_id: number;
  exercise_name: string;
  set_number: number;
  reps: number | ""; // Allow empty string so the input can be cleared
  weight_lbs: number | "";
}

export default function NewWorkoutPage() {
  const router = useRouter();
  const { token } = useAuth(); // JWT token for authenticated API requests

  // --- STATE ---
  const [title, setTitle] = useState(""); // Workout title e.g. "Push Day"
  const [notes, setNotes] = useState(""); // Optional notes
  const [sets, setSets] = useState<SetEntry[]>([]); // All sets added so far

  const [exercises, setExercises] = useState<Exercise[]>([]); // All exercises from DB
  const [searchQuery, setSearchQuery] = useState(""); // Exercise search input
  const [showSearch, setShowSearch] = useState(false); // Toggle search dropdown visibility

  const [isSaving, setIsSaving] = useState(false); // Loading state for save button
  const [error, setError] = useState(""); // Error message to display

  // --- FETCH EXERCISES ON MOUNT ---
  // Load all exercises from the backend when the page first loads.
  // We need these to power the search feature.
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await fetch(
          "${process.env.NEXT_PUBLIC_API_URL}/api/exercises",
          {
            headers: {
              Authorization: `Bearer ${token}`, // All protected routes need this header
            },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setExercises(data);
        }
      } catch (err) {
        console.error("Failed to fetch exercises:", err);
      }
    };

    // Only fetch if we have a token — avoids unnecessary requests on first render
    if (token) fetchExercises();
  }, [token]); // Re-run if token changes (e.g. after login)

  // --- FILTERED EXERCISES ---
  // Filter exercises based on the search query.
  // This runs on every render but is cheap for small lists.
  // For large lists you'd debounce this or move it to the API.
  const filteredExercises = exercises.filter(
    (ex) =>
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.muscle_group?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // --- ADD EXERCISE ---
  // Called when user clicks an exercise from the search results.
  // Adds a first set for that exercise automatically.
  const addExercise = (exercise: Exercise) => {
    // Count how many sets already exist for this exercise
    // so we assign the correct set number
    const existingSets = sets.filter((s) => s.exercise_id === exercise.id);

    const newSet: SetEntry = {
      id: `${exercise.id}-${Date.now()}`, // Unique client-side key
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      set_number: existingSets.length + 1, // e.g. 1, 2, 3...
      reps: "",
      weight_lbs: "",
    };

    setSets([...sets, newSet]); // Append the new set to the list
    setSearchQuery(""); // Clear search
    setShowSearch(false); // Hide dropdown
  };

  // --- ADD SET TO EXISTING EXERCISE ---
  // Called when user clicks "+ Add Set" under an existing exercise.
  const addSetToExercise = (exerciseId: number, exerciseName: string) => {
    const existingSets = sets.filter((s) => s.exercise_id === exerciseId);

    const newSet: SetEntry = {
      id: `${exerciseId}-${Date.now()}`,
      exercise_id: exerciseId,
      exercise_name: exerciseName,
      set_number: existingSets.length + 1,
      reps: "",
      weight_lbs: "",
    };

    setSets([...sets, newSet]);
  };

  // --- UPDATE SET ---
  // Updates a specific field (reps or weight_lbs) on a specific set.
  // We identify the set by its temporary client-side id.
  const updateSet = (
    id: string,
    field: "reps" | "weight_lbs",
    value: string,
  ) => {
    setSets(
      sets.map((s) =>
        s.id === id
          ? { ...s, [field]: value === "" ? "" : parseFloat(value) }
          : s,
      ),
    );
  };

  // --- REMOVE SET ---
  // Removes a set and renumbers remaining sets for that exercise
  const removeSet = (id: string) => {
    const filtered = sets.filter((s) => s.id !== id);

    // Renumber sets for each exercise so they stay sequential (1, 2, 3...)
    const renumbered = filtered.map((s) => {
      const setsForExercise = filtered.filter(
        (f) => f.exercise_id === s.exercise_id,
      );
      return { ...s, set_number: setsForExercise.indexOf(s) + 1 };
    });

    setSets(renumbered);
  };

  // --- GROUP SETS BY EXERCISE ---
  // Instead of rendering a flat list of sets, we group them by exercise
  // so the UI shows exercise name as a header with its sets below.
  // reduce() builds an object like: { exerciseId: [set1, set2, ...] }
  const groupedSets = sets.reduce(
    (groups, set) => {
      const key = set.exercise_id;
      if (!groups[key]) groups[key] = [];
      groups[key].push(set);
      return groups;
    },
    {} as Record<number, SetEntry[]>,
  );

  // --- SAVE WORKOUT ---
  // Sends the completed workout to the backend API
  const handleSave = async () => {
    setError("");

    // Validation
    if (!title.trim()) {
      setError("Please give your workout a title.");
      return;
    }
    if (sets.length === 0) {
      setError("Please add at least one exercise and set.");
      return;
    }

    // Check all sets have reps and weight filled in
    const incompleteSets = sets.filter(
      (s) => s.reps === "" || s.weight_lbs === "",
    );
    if (incompleteSets.length > 0) {
      setError("Please fill in reps and weight for all sets.");
      return;
    }

    setIsSaving(true);

    try {
      const res = await fetch(
        "${process.env.NEXT_PUBLIC_API_URL}/api/workouts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Protected route — needs JWT
          },
          body: JSON.stringify({
            title: title.trim(),
            notes: notes.trim() || null,
            // Map sets to the format the API expects
            sets: sets.map((s) => ({
              exercise_id: s.exercise_id,
              set_number: s.set_number,
              reps: s.reps,
              weight_lbs: s.weight_lbs,
            })),
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to save workout.");
        return;
      }

      // Success — redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError("Could not connect to the server.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      className="min-h-screen bg-zinc-950 text-white"
    >
      {/* ── HEADER BAR ── */}
      <div className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur border-b border-zinc-800 px-4 md:px-8 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {/* Back button */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </Link>

          {/* Page title */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-orange-500 flex items-center justify-center">
              <svg
                className="w-3.5 h-3.5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z" />
              </svg>
            </div>
            <span className="font-semibold text-white">Log Workout</span>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-lg shadow-orange-500/20"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
        {/* Error banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* ── WORKOUT TITLE ── */}
        <div className="mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Workout title (e.g. Push Day)"
            // Large, prominent input — this is the first thing the user fills in
            className="w-full bg-transparent text-2xl font-bold text-white placeholder-zinc-700 border-none outline-none focus:outline-none"
          />
        </div>

        {/* ── NOTES ── */}
        <div className="mb-8">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)..."
            rows={2}
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 placeholder-zinc-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors resize-none"
          />
        </div>

        {/* ── SETS LIST — grouped by exercise ── */}
        {Object.entries(groupedSets).map(([exerciseId, exerciseSets]) => (
          <div
            key={exerciseId}
            className="mb-6 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden"
          >
            {/* Exercise header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <div>
                <p className="font-semibold text-white">
                  {exerciseSets[0].exercise_name}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {/* Find the muscle group from the exercises list */}
                  {
                    exercises.find((e) => e.id === parseInt(exerciseId))
                      ?.muscle_group
                  }
                </p>
              </div>
            </div>

            {/* Column headers for the sets table */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs text-zinc-500 font-medium uppercase tracking-wider">
              <div className="col-span-2">Set</div>
              <div className="col-span-4">Weight (lbs)</div>
              <div className="col-span-4">Reps</div>
              <div className="col-span-2"></div> {/* Delete button column */}
            </div>

            {/* Individual set rows */}
            {exerciseSets.map((set) => (
              <div
                key={set.id}
                className="grid grid-cols-12 gap-2 px-4 py-2 items-center"
              >
                {/* Set number badge */}
                <div className="col-span-2">
                  <span className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-400 text-xs font-bold flex items-center justify-center">
                    {set.set_number}
                  </span>
                </div>

                {/* Weight input */}
                <div className="col-span-4">
                  <input
                    type="number"
                    value={set.weight_lbs}
                    onChange={(e) =>
                      updateSet(set.id, "weight_lbs", e.target.value)
                    }
                    placeholder="0"
                    min="0"
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                {/* Reps input */}
                <div className="col-span-4">
                  <input
                    type="number"
                    value={set.reps}
                    onChange={(e) => updateSet(set.id, "reps", e.target.value)}
                    placeholder="0"
                    min="0"
                    className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                {/* Delete set button */}
                <div className="col-span-2 flex justify-end">
                  <button
                    onClick={() => removeSet(set.id)}
                    className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 flex items-center justify-center transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {/* Add another set for this exercise */}
            <div className="px-4 py-3 border-t border-zinc-800">
              <button
                onClick={() =>
                  addSetToExercise(
                    parseInt(exerciseId),
                    exerciseSets[0].exercise_name,
                  )
                }
                className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors flex items-center gap-1"
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
                Add set
              </button>
            </div>
          </div>
        ))}

        {/* ── ADD EXERCISE SEARCH ── */}
        <div className="relative">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-zinc-700 hover:border-orange-500/50 text-zinc-500 hover:text-orange-400 rounded-2xl py-4 transition-all"
          >
            <svg
              className="w-5 h-5"
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
            <span className="font-medium">Add Exercise</span>
          </button>

          {/* Search dropdown — only shown when showSearch is true */}
          {showSearch && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden shadow-2xl z-20">
              {/* Search input */}
              <div className="p-3 border-b border-zinc-800">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search exercises..."
                  autoFocus // Focus the input automatically when dropdown opens
                  className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Exercise results list */}
              <div className="max-h-60 overflow-y-auto">
                {" "}
                {/* Scrollable if many results */}
                {filteredExercises.length === 0 ? (
                  <p className="text-zinc-500 text-sm text-center py-6">
                    No exercises found
                  </p>
                ) : (
                  filteredExercises.map((exercise) => (
                    <button
                      key={exercise.id}
                      onClick={() => addExercise(exercise)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-800 transition-colors text-left"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">
                          {exercise.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {exercise.muscle_group} · {exercise.equipment}
                        </p>
                      </div>
                      {/* Show a + icon on hover */}
                      <svg
                        className="w-4 h-4 text-zinc-600"
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
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom padding so content isn't hidden behind mobile nav */}
        <div className="h-24" />
      </div>
    </div>
  );
}
