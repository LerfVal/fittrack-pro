"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // For redirecting after signup
import { useAuth } from "../context/AuthContext"; // Global auth state

export default function SignupPage() {
  // Single object for all form fields — cleaner than 4 separate useState calls
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const { login } = useAuth(); // We call login() after signup to immediately log the user in

  // Shared change handler — e.target.name matches the key in form state
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // --- FORM SUBMISSION ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client side validation
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);

    try {
      // --- CALL THE BACKEND SIGNUP API ---
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // Only send name, email and password — confirmPassword is frontend-only validation
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            password: form.password,
          }),
        },
      );

      const data = await res.json();

      // Handle error responses from the server (e.g. email already exists)
      if (!res.ok) {
        setError(data.message || "Something went wrong.");
        return;
      }

      // On success — log the user in immediately and redirect to dashboard.
      // No need to make them log in again after signing up.
      login(data.token, data.user);
      router.push("/dashboard");
    } catch (err) {
      // Network error — backend is probably not running
      setError(
        "Could not connect to the server. Make sure the backend is running.",
      );
    } finally {
      setIsLoading(false); // Always reset loading state
    }
  };

  // Password strength indicator — returns style object based on password length
  const passwordStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6)
      return { label: "Weak", color: "bg-red-500", width: "w-1/4" };
    if (p.length < 8)
      return { label: "Fair", color: "bg-yellow-500", width: "w-2/4" };
    if (p.length < 12)
      return { label: "Good", color: "bg-blue-500", width: "w-3/4" };
    return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
  };

  const strength = passwordStrength();

  return (
    <div
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      className="min-h-screen bg-zinc-950 flex"
    >
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-zinc-900 flex-col justify-between p-12">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500 rounded-full opacity-10 blur-3xl translate-x-1/2 -translate-y-1/2" />

        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <svg
              className="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            FitTrack
          </span>
        </div>

        <div className="relative">
          <p className="text-4xl font-bold text-white leading-tight mb-8">
            Start tracking.
            <br />
            <span className="text-orange-400">Start winning.</span>
          </p>
          <div className="flex flex-col gap-5">
            {[
              {
                icon: "📈",
                title: "Progress charts",
                desc: "Visualize strength gains over time",
              },
              {
                icon: "🏆",
                title: "Personal records",
                desc: "Automatically tracked on every lift",
              },
              {
                icon: "📋",
                title: "Custom workouts",
                desc: "Build programs that fit your goals",
              },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-lg flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-zinc-500 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — SIGNUP FORM ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z" />
              </svg>
            </div>
            <span className="text-white font-bold text-lg">FitTrack</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">
            Create an account
          </h1>
          <p className="text-zinc-400 mb-8">
            Start tracking your training today.
          </p>

          {/* Error banner */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Name — name="name" must match the key in form state */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Full name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@example.com"
                className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
              />
            </div>

            {/* Password with strength indicator */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? (
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
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Strength bar — only shows when user has started typing */}
              {strength && (
                <div className="mt-2">
                  <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`}
                    />
                  </div>
                  <p
                    className={`text-xs mt-1 font-medium ${
                      strength.label === "Weak"
                        ? "text-red-400"
                        : strength.label === "Fair"
                          ? "text-yellow-400"
                          : strength.label === "Good"
                            ? "text-blue-400"
                            : "text-emerald-400"
                    }`}
                  >
                    {strength.label} password
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password — border turns red on mismatch */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Confirm password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full bg-zinc-900 border text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 transition-colors ${
                  form.confirmPassword && form.password !== form.confirmPassword
                    ? "border-red-500/50 focus:border-red-500 focus:ring-red-500"
                    : "border-zinc-800 focus:border-orange-500 focus:ring-orange-500"
                }`}
              />
              {form.confirmPassword &&
                form.password !== form.confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">
                    Passwords do not match
                  </p>
                )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-orange-500/20 mt-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="w-4 h-4 animate-spin"
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
                  Creating account...
                </span>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="text-center text-zinc-500 text-sm mt-8">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
