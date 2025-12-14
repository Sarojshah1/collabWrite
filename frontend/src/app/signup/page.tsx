"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { useAuth } from "@/hooks/useAuth";
import { FiUpload, FiEye, FiEyeOff } from "react-icons/fi";

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bioMax = 160;
  const bioRemaining = bioMax - bio.length;

  // Simple password strength calc
  const strength = getPasswordStrength(password);
  const emailError = email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Enter a valid email" : "";

  useEffect(() => {
    if (!avatarFile) return setAvatarPreview(null);
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  function onPickAvatar() {
    fileInputRef.current?.click();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setAvatarFile(f);
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) {
      setAvatarFile(f);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    if (emailError) return;
    try {
      setLoading(true);
      await register({ name: name.trim(), email: email.trim(), password, bio: bio.trim(), avatar: avatarFile });
      if (typeof document !== "undefined") {
        document.cookie = "cw_auth=1; path=/; max-age=2592000"; // 30 days
      }
      router.replace("/dashboard");
    } catch (e: any) {
      // Map backend validation details to inline field errors
      if (e?.status === 422 && Array.isArray(e?.details)) {
        const map: Record<string, string> = {};
        for (const d of e.details) {
          if (d?.field && d?.msg) map[d.field] = d.msg;
        }
        setFieldErrors(map);
        alert("Please fix the highlighted fields.");
      } else {
        alert(e?.message || "Signup failed");
      }
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
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-[0.5rem] border border-zinc-200 text-xs">CW</span>
                <span>CollabWrite</span>
              </div>
            </div>
            <h1 className="mt-6 text-center text-2xl font-semibold tracking-tight text-zinc-900">
              Create your account
            </h1>
            <p className="mt-2 text-center text-sm text-zinc-600">
              Start collaborating in minutes.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-6 shadow-sm sm:px-7 sm:py-7">
            <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-800">Full Name</label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`mt-1 w-full rounded-md border px-3 py-2 text-sm text-black placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 ${fieldErrors.name ? 'border-red-400' : 'border-zinc-300'}`}
                placeholder="Jane Doe"
                aria-invalid={!!fieldErrors.name}
                aria-describedby={fieldErrors.name ? 'name-error' : undefined}
              />
              {fieldErrors.name && <p id="name-error" className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-800">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-1 w-full rounded-md border px-3 py-2 text-sm text-black placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 ${emailError || fieldErrors.email ? "border-red-400" : "border-zinc-300"}`}
                placeholder="you@example.com"
                aria-invalid={!!(emailError || fieldErrors.email)}
                aria-describedby={emailError || fieldErrors.email ? "email-error" : undefined}
              />
              {(emailError || fieldErrors.email) && <p id="email-error" className="mt-1 text-xs text-red-600">{fieldErrors.email || emailError}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-800">Password</label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 pr-10 text-sm text-black placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 ${fieldErrors.password ? 'border-red-400' : 'border-zinc-300'}`}
                  placeholder="At least 6 characters"
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
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
              {fieldErrors.password && <p id="password-error" className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading || !!emailError}
              className="mt-1 inline-flex w-full items-center justify-center rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-black disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>

            <p className="text-center text-sm text-zinc-600">
              Already have an account?{" "}
              <a href="/login" className="font-medium text-zinc-900 hover:underline">
                Sign in
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

function getPasswordStrength(pw: string) {
  let score = 0;
  if (!pw) return { score, label: "Weak" } as const;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;
  if (score >= 4) return { score: 4, label: "Strong" } as const;
  if (score === 3) return { score, label: "Good" } as const;
  if (score === 2) return { score, label: "Fair" } as const;
  return { score: Math.max(score, 1), label: "Weak" } as const;
}
