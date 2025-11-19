"use client";

import { motion } from "framer-motion";
import type { IconType } from "react-icons";
import { FiBriefcase, FiBookOpen, FiPenTool, FiUsers } from "react-icons/fi";

type UseCase = { title: string; desc: string; icon: IconType; accent: string };

const USE_CASES: UseCase[] = [
  { title: "Startups", desc: "Specs, PRDs, roadmaps, and release notes.", icon: FiBriefcase, accent: "var(--color-primary)" },
  { title: "Education", desc: "Lesson plans, coursework, and feedback loops.", icon: FiBookOpen, accent: "var(--color-secondary)" },
  { title: "Creators", desc: "Newsletters, blogs, scripts, and outlines.", icon: FiPenTool, accent: "#6366f1" },
  { title: "Teams", desc: "Meeting notes, strategies, team docs.", icon: FiUsers, accent: "var(--color-success)" },
];

const container = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const item = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function UseCases() {
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
  };

  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-2 sm:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700">
            <span className="inline-block size-1.5 rounded-full" style={{ backgroundColor: "var(--color-secondary)" }} />
            Where it shines
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-[var(--font-display)] font-bold tracking-tight text-black">
            Use cases that teams actually ship
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-700">
            Flexible enough for any workflow, simple enough for everyone.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {USE_CASES.map((c) => (
            <motion.div key={c.title} variants={item}>
              <div
                className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1"
                onMouseMove={onMove}
                style={{ ["--accent" as any]: c.accent }}
              >
                {/* glow */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(520px circle at var(--x,50%) var(--y,20%), color-mix(in oklab, var(--accent) 14%, transparent), transparent 42%)",
                  }}
                />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center gap-3">
                      <span className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 p-2 text-zinc-800">
                        {(() => { const I = c.icon; return <I className="h-5 w-5" />; })()}
                      </span>
                      <h3 className="text-base font-semibold text-zinc-900">{c.title}</h3>
                    </div>
                    <span className="inline-block size-2 rounded-full" style={{ backgroundColor: c.accent }} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-700">{c.desc}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-zinc-600">
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block size-2 rounded-full" style={{ backgroundColor: c.accent }} />
                      Popular
                    </span>
                    <a href="#" className="inline-flex items-center gap-1 hover:text-zinc-900">
                      Explore
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
