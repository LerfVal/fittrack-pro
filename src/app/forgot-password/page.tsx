"use client"; // Client Component — we use useState and form event handlers

import { useState } from "react";
import Link from "next/link";

// We use a union type to represent which "step" of the flow we're on.
// "email" = the input form, "sent" = the confirmation screen.
// This avoids a separate boolean like "isSubmitted" and is more scalable
// if you add more steps later (e.g. "reset" for the new password form).
type Step = "email" | "sent";

export default function ForgotPasswordPage() {
  // --- STATE ---
  const [email, setEmail] = useState(""); // Tracks the email input
  const [isLoading, setIsLoading] = useState(false); // Controls the loading spinner
  const [error, setError] = useState(""); // Stores any error messages
  const [step, setStep] = useState<Step>("email"); // Controls which screen to show

  // --- FORM SUBMISSION ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent browser page reload on submit
    setError(""); // Clear previous errors

    // Basic validation — make sure they actually typed an email
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true); // Show loading state on button

    // TODO: Replace with real API call when backend is ready
    // The backend will generate a reset token, store it, and send an email.
    // const res = await fetch("/api/auth/forgot-password", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ email }),
    // });
    // if (!res.ok) { setError("Something went wrong. Try again."); setIsLoading(false); return; }
    // setStep("sent"); // Only move to confirmation screen if the API call succeeded
    setTimeout(() => {
      setIsLoading(false);
      setStep("sent"); // Transition to the confirmation screen
    }, 1500);
  };

  return (
    <div
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      // Centered layout — no split panel here, just a clean centered card
      className="min-h-screen bg-zinc-950 flex items-center justify-center px-6 py-12"
    >
      <div className="w-full max-w-md">

        {/* Logo at the top — always visible regardless of which step we're on */}
        <div className="flex items-center gap-2 mb-12">
          <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">FitTrack</span>
        </div>

        {/* CONDITIONAL RENDERING based on step state:
            - step === "email"  → show the form to enter email
            - step === "sent"   → show the confirmation message
            This is a common UX pattern for multi-step flows */}
        {step === "email" ? (

          /* ── STEP 1: EMAIL INPUT FORM ── */
          <>
            {/* Key icon to visually communicate "reset password" */}
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">Forgot password?</h1>
            <p className="text-zinc-400 mb-8">
              No worries. Enter your email and we&apos;ll send you a reset link.
            </p>

            {/* Error banner — only renders if error state is non-empty */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Email address
                </label>
                <input
                  type="email" // Browser validates email format automatically
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} // Update email state on every keystroke
                  placeholder="john@example.com"
                  className="w-full bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                />
              </div>

              {/* Submit button — shows spinner when loading, disabled to prevent double submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-orange-500/20"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Sending...
                  </span>
                ) : (
                  "Send reset link"
                )}
              </button>
            </form>
          </>

        ) : (

          /* ── STEP 2: CONFIRMATION SCREEN ──
             Shown after the API call succeeds.
             We display the email they submitted so they know where to look. */
          <div className="text-center">

            {/* Green envelope icon — communicates success visually */}
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">Check your email</h1>
            <p className="text-zinc-400 mb-2">We sent a reset link to</p>

            {/* Show the email they entered — reassures the user the right address was used */}
            <p className="text-white font-semibold mb-8">{email}</p>

            {/* Fallback card — lets the user retry with a different email without a full page reload */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-left mb-8">
              <p className="text-zinc-400 text-sm leading-relaxed">
                Didn&apos;t receive it? Check your spam folder, or{" "}
                {/* This button resets the step back to "email" so they can try again.
                    No page navigation needed — just update state. */}
                <button
                  onClick={() => setStep("email")}
                  className="text-orange-400 hover:text-orange-300 transition-colors font-medium"
                >
                  try a different email address.
                </button>
              </p>
            </div>
          </div>
        )}

        {/* Back to login link — sits below both steps */}
        <div className="flex items-center justify-center mt-8">
          <Link
            href="/login"
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
          >
            {/* Left arrow icon */}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to sign in
          </Link>
        </div>

      </div>
    </div>
  );
}
