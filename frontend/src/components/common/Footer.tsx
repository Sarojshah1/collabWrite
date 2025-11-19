"use client";

import { useState } from "react";
import { FiTwitter, FiGithub, FiLinkedin, FiMail, FiArrowUp } from "react-icons/fi";

export default function Footer() {
  // Placeholder status for newsletter message; can be set to "success" or "error" after integrating the form
  const [status] = useState<"idle" | "success" | "error">("idle");

  const backToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative mt-16 bg-white dark:bg-zinc-950">
      {/* top accent */}
      <div
        aria-hidden
        className="h-[2px] w-full"
        style={{
          background:
            "linear-gradient(90deg, color-mix(in oklab, var(--color-primary) 60%, transparent), color-mix(in oklab, var(--color-secondary) 60%, transparent))",
        }}
      />

      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand + blurb */}
          <div className="md:col-span-1">
            <a href="/" className="flex items-center gap-3">
              <span className="font-semibold text-white" style={{ fontFamily: 'var(--font-display)' }}>CollabWrite</span>
            </a>
            <p className="mt-4 text-sm leading-6 text-zinc-600">
              A collaborative editor that helps teams write, review, and ship faster.
            </p>
            <div className="mt-5 flex items-center gap-3 text-zinc-500">
              <a aria-label="Twitter" href="#" className="hover:text-zinc-900"><FiTwitter className="h-5 w-5" /></a>
              <a aria-label="GitHub" href="#" className="hover:text-zinc-900"><FiGithub className="h-5 w-5" /></a>
              <a aria-label="LinkedIn" href="#" className="hover:text-zinc-900"><FiLinkedin className="h-5 w-5" /></a>
              <a aria-label="Email" href="#" className="hover:text-zinc-900"><FiMail className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Columns */}
          <div className="grid grid-cols-2 gap-10 md:col-span-2 md:grid-cols-3">
            <div>
              <h4 className="text-xs font-semibold tracking-wide text-zinc-900 dark:text-zinc-100">Product</h4>
              <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><a href="#features" className="hover:text-zinc-900">Features</a></li>
                <li><a href="#" className="hover:text-zinc-900">Templates</a></li>
                <li><a href="#" className="hover:text-zinc-900">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold tracking-wide text-zinc-900 dark:text-zinc-100">Company</h4>
              <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><a href="#" className="hover:text-zinc-900">About</a></li>
                <li><a href="#" className="hover:text-zinc-900">Careers</a></li>
                <li><a href="#" className="hover:text-zinc-900">Contact</a></li>
                <li><a href="#" className="hover:text-zinc-900">Press Kit</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold tracking-wide text-zinc-900 dark:text-zinc-100">Resources</h4>
              <ul className="mt-3 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><a href="#" className="hover:text-zinc-900">Docs</a></li>
                <li><a href="#" className="hover:text-zinc-900">Guides</a></li>
                <li><a href="#" className="hover:text-zinc-900">Support</a></li>
                <li><a href="#" className="hover:text-zinc-900">Community</a></li>
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div className="md:col-span-1">
            <h4 className="text-xs font-semibold tracking-wide text-zinc-900 dark:text-zinc-100">Stay in the loop</h4>
            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">Sign up for product updates and tips. No spam, ever.</p>
            <p className="mt-2 text-xs" aria-live="polite">
              {status === "success" && <span className="text-emerald-600">Thanks! You’re on the list.</span>}
              {status === "error" && <span className="text-red-600">Please enter a valid email.</span>}
            </p>
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-6 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400 sm:flex-row">
          <p> {new Date().getFullYear()} CollabWrite. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-zinc-900">Privacy</a>
            <a href="#" className="hover:text-zinc-900">Terms</a>
            <a href="#" className="hover:text-zinc-900">Status</a>
          </div>
        </div>
      </div>

      {/* back to top */}
      <button
        onClick={backToTop}
        aria-label="Back to top"
        className="fixed bottom-6 right-6 inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white p-3 text-zinc-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200"
      >
        <FiArrowUp className="h-4 w-4" />
      </button>
    </footer>
  );
}
