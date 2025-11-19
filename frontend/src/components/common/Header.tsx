"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trackEvent } from "@/utils/tracking";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollClass = scrolled ? "h-16" : "h-20";

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-sm">
      <div className={`mx-auto  px-4 sm:px-6 flex items-center gap-4 transition-[height] duration-200 ${scrollClass}`}>
        {/* Brand (wordmark style) */}
        <a href="/" className="flex items-center gap-2 shrink-0" aria-label="CollabWrite home">
          <span
            className="text-xl tracking-tight text-zinc-900"
            style={{ fontFamily: "var(--font-display)" }}
          >
            CollabWrite
          </span>
        </a>

        {/* Center nav */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-2 text-[15px] text-zinc-800">
          <a href="#features" className="px-3 py-1.5 rounded-full hover:bg-zinc-100 transition-colors">
            Features
          </a>
          <a href="#assignment-mode" className="px-3 py-1.5 rounded-full hover:bg-zinc-100 transition-colors">
            Assignment Mode
          </a>
          <a href="#how-it-works" className="px-3 py-1.5 rounded-full hover:bg-zinc-100 transition-colors">
            How it works
          </a>
          <a href="#pricing" className="px-3 py-1.5 rounded-full hover:bg-zinc-100 transition-colors">
            Pricing
          </a>
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-2">
          <a
            href="/login"
            className="px-3 py-2 text-[14px] text-zinc-800 hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 rounded-full"
          >
            Login
          </a>
          <a
            href="/write"
            onClick={() => trackEvent("cta_start_assignment_click")}
            className="px-4 py-2 text-[14px] rounded-full font-medium text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ backgroundColor: "var(--color-primary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1E40AF")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-primary)")}
          >
            Start Assignment
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex items-center justify-center size-9 rounded-full border border-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {open ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
          </svg>
        </button>
      </div>

      {/* Mobile full-screen menu */}
      {open && (
        <div className="md:hidden fixed inset-0 z-20 bg-white/98 backdrop-blur-sm border-t border-zinc-200">
          <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <span
                className="text-lg tracking-tight text-zinc-900"
                style={{ fontFamily: "var(--font-display)" }}
              >
                CollabWrite
              </span>
              <button
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center size-9 rounded-full border border-zinc-300"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 flex flex-col gap-3 text-[17px] text-zinc-900">
              <a href="#features" onClick={() => setOpen(false)} className="py-2">
                Features
              </a>
              <a href="#assignment-mode" onClick={() => setOpen(false)} className="py-2">
                Assignment Mode
              </a>
              <a href="#how-it-works" onClick={() => setOpen(false)} className="py-2">
                How it works
              </a>
              <a href="#pricing" onClick={() => setOpen(false)} className="py-2">
                Pricing
              </a>
              <a href="#faq" onClick={() => setOpen(false)} className="py-2">
                FAQ
              </a>
            </nav>

            <div className="mt-4 flex flex-col gap-3">
              <a
                href="/login"
                onClick={() => setOpen(false)}
                className="w-full text-center px-4 py-2 rounded-full border border-zinc-300 text-[15px]"
              >
                Login
              </a>
              <a
                href="/write"
                onClick={() => {
                  trackEvent("cta_start_assignment_click");
                  setOpen(false);
                }}
                className="w-full text-center px-4 py-2 rounded-full text-[15px] font-medium text-white shadow-sm"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                Start Assignment — Free
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
