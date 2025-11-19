"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { trackEvent } from "@/utils/tracking";
import MockEditor from "./MockEditor";

export default function Hero() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full blur-3xl opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(closest-side, var(--color-secondary), transparent 70%), radial-gradient(closest-side, var(--color-primary), transparent 70%)",
        }}
        initial={{ scale: 0.9, y: -20, opacity: 0.25 }}
        animate={{ scale: 1.05, y: 0, opacity: 0.45 }}
        transition={{ duration: 4, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      />

      <div className="relative mx-auto w-full px-6 max-w-7xl">
        <div className="grid md:grid-cols-2 items-center gap-12">
          {/* Left: copy + CTAs */}
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700 shadow-sm">
              <span
                className="inline-block size-1.5 rounded-full"
                style={{ backgroundColor: "var(--color-success)" }}
              />
              Built for group assignments
            </div>
            <motion.h1
              className="font-[var(--font-display)] text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight text-black mt-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <span className="block">Fix group assignments</span>
              <span className="block">without the drama.</span>
            </motion.h1>
            <p className="mt-4 text-base sm:text-lg text-zinc-800 max-w-xl md:max-w-lg mx-auto md:mx-0">
              CollabWrite automatically detects edit conflicts, merges teammates&apos; work, and produces one polished
              submission — powered by AI.
            </p>
            <motion.div
              className="mt-8 flex flex-col sm:flex-row md:justify-start items-center justify-center gap-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <a
                href="/write"
                onClick={() => trackEvent("cta_start_assignment_click")}
                className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "white",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1E40AF")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-primary)")}
              >
                Start Assignment — Free for Students
              </a>
              <button
                type="button"
                onClick={() => {
                  setDemoOpen(true);
                  trackEvent("cta_see_live_demo_click");
                }}
                className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium border border-zinc-300 bg-white text-zinc-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                See Live Demo
              </button>
            </motion.div>
            <p className="mt-3 text-xs sm:text-sm text-zinc-600">
              No credit card • Export to PDF / DOCX • Citation-ready
            </p>
          </div>

          {/* Right: animated conflict panel mock */}
          <MockEditor />
        </div>
      </div>

      {/* Simple demo modal shell (placeholder for video/sandbox) */}
      {demoOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-label="CollabWrite live demo"
        >
          <div className="max-w-3xl w-full rounded-2xl bg-white shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200">
              <h2 className="text-sm font-semibold text-zinc-900">Conflict Panel walkthrough</h2>
              <button
                type="button"
                onClick={() => setDemoOpen(false)}
                className="inline-flex items-center justify-center size-8 rounded-full border border-zinc-200 text-zinc-700"
                aria-label="Close demo"
              >
                <svg
                  width="16"
                  height="16"
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
            <div className="aspect-video bg-zinc-950 flex items-center justify-center text-zinc-200 text-sm">
              {/* Replace this with an actual video or interactive sandbox iframe later */}
              <span>Embed 30–45s walkthrough video or sandbox here.</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
