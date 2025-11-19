"use client";

import { motion } from "framer-motion";
import type { IconType } from "react-icons";
import { FiUsers, FiZap, FiBook, FiShield } from "react-icons/fi";

type Feature = { title: string; desc: string; icon: IconType };

const FEATURES: Feature[] = [
  {
    title: "Real-time Collaboration",
    desc: "Live cursors, presence, and instant sync so everyone edits confidently.",
    icon: FiUsers,
  },
  {
    title: "AI-Assisted Suggestions",
    desc: "Expand, rephrase, and clean up writing while keeping your voice.",
    icon: FiZap,
  },
  {
    title: "Templates for Every Team",
    desc: "Kickstart with ready-made templates for blogs, specs, and lesson plans.",
    icon: FiBook,
  },
  {
    title: "Secure & Versioned Drafts",
    desc: "Track changes, restore history, and protect your workspace.",
    icon: FiShield,
  },
];

const container = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function Features() {
  const ACCENTS = [
    "var(--color-primary)",
    "var(--color-secondary)",
    "var(--color-success)",
    "#6366f1", // fallback indigo
  ];

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    e.currentTarget.style.setProperty("--x", `${x}px`);
    e.currentTarget.style.setProperty("--y", `${y}px`);
  };

  // react-icons will render the icon per feature; no local SVG needed

  return (
    <section id="features" className="py-16">
      <div className="mx-auto max-w-6xl px-2 sm:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700">
            <span className="inline-block size-1.5 rounded-full" style={{ backgroundColor: "var(--color-secondary)" }} />
            What you get
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-[var(--font-display)] font-bold tracking-tight text-black">
            Powerful features for focused writing
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-700">
            Tools that help teams move faster—from first draft to publish.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} variants={item}>
              <div
                className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition-transform duration-300 hover:-translate-y-1"
                style={{
                  // @ts-ignore custom css var for accent
                  ["--accent" as any]: ACCENTS[i % ACCENTS.length],
                }}
                onMouseMove={handleMove}
              >
                {/* glow */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(600px circle at var(--x,50%) var(--y,20%), color-mix(in oklab, var(--accent) 14%, transparent), transparent 42%)",
                  }}
                />
                <div className="relative">
                  <div className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-lg text-zinc-800">
                    {(() => {
                      const IconComp = f.icon;
                      return <IconComp className="h-5 w-5" />;
                    })()}
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-zinc-900">{f.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-700">{f.desc}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-zinc-600">
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block size-2 rounded-full" style={{ backgroundColor: ACCENTS[i % ACCENTS.length] }} />
                      Built for teams
                    </span>
                    <a href="#" className="inline-flex items-center gap-1 hover:text-zinc-900">
                      Learn more
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
