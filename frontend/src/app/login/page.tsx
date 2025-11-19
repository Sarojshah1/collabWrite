"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { useAuth } from "@/hooks/useAuth";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailError = email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Enter a valid email" : "";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (emailError) return;
    try {
      setLoading(true);
      await login({ email, password });
      // Optionally persist remember-me preference (future cookie strategy)
      if (remember && typeof window !== "undefined") {
        localStorage.setItem("cw_remember", "1");
      }
      // Set UX cookie flag for middleware-based redirects
      if (typeof document !== "undefined") {
        document.cookie = "cw_auth=1; path=/; max-age=2592000"; // 30 days
      }
      router.replace("/dashboard");
    } catch (e: any) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <section className="w-full max-w-sm">
          <div className="mb-8">
            <div className="flex justify-center">
              <div className="flex items-center gap-2 text-xl font-semibold text-zinc-900">
                
                <span>CollabWrite</span>
              </div>
            </div>
            <h1 className="mt-6 text-center text-2xl font-semibold tracking-tight text-zinc-900">
              Welcome back
            </h1>
            <p className="mt-2 text-center text-sm text-zinc-600">
              Sign in to continue working with your team.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-6 shadow-sm sm:px-7 sm:py-7">
            {error && (
              <div
                className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                role="alert"
              >
                {error}
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-800">Email</label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-1 w-full rounded-md border px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 ${emailError ? "border-red-400" : "border-zinc-300"}`}
                placeholder="you@example.com"
                aria-invalid={!!emailError}
                aria-describedby={emailError ? "email-error" : undefined}
              />
              {emailError && (
                <p id="email-error" className="mt-1 text-xs text-red-600">
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="flex items-center justify-between text-sm font-medium text-zinc-800"
              >
                <span>Password</span>
                <a href="#" className="text-xs font-normal text-zinc-600 hover:underline">
                  Forgot password?
                </a>
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 pr-10 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-2 my-auto rounded px-2 text-sm text-zinc-600 hover:text-zinc-900"
                  title={showPassword ? "Hide" : "Show"}
                >
                  {showPassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 select-none text-sm text-zinc-700">
                <input
                  type="checkbox"
                  className="size-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !!emailError}
              className="mt-1 inline-flex w-full items-center justify-center rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in…" : "Login"}
            </button>

            <p className="text-center text-sm text-zinc-600">
              Don&apos;t have an account?{" "}
              <a href="/signup" className="font-medium text-zinc-900 hover:underline">
                Sign up
              </a>
            </p>
          </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
