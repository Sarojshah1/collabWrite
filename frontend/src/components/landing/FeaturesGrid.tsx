"use client";

import { FiAlertTriangle, FiClock, FiUserCheck, FiCalendar, FiBookOpen, FiType, FiDownload, FiBarChart2 } from "react-icons/fi";

const FEATURES = [
  {
    title: "Real-time conflict detection & merge",
    body: "Spot overlapping edits instantly so groups don\'t overwrite each other\'s work.",
    icon: FiAlertTriangle,
  },
  {
    title: "Explainable merge rationale",
    body: "AI shows short reasons for every accepted change so teammates can trust the result.",
    icon: FiBookOpen,
  },
  {
    title: "Contribution analytics",
    body: "See words written and edits per teammate to keep work fair and grading simpler.",
    icon: FiUserCheck,
  },
  {
    title: "Assignment Mode with deadlines & roles",
    body: "Lock in due dates, assign sections, and keep everyone aligned on responsibilities.",
    icon: FiCalendar,
  },
  {
    title: "Citation auto-formatting",
    body: "Format references in APA, MLA, or IEEE without hunting through style guides.",
    icon: FiBookOpen,
  },
  {
    title: "Tone equalizer",
    body: "Smooth out different writing styles into a single, consistent author voice.",
    icon: FiType,
  },
  {
    title: "Export: PDF / DOCX / Google Docs sync",
    body: "Turn in exactly what your instructor asked for — no messy copy-paste.",
    icon: FiDownload,
  },
  {
    title: "Teacher view",
    body: "Export a contribution report so instructors can see who did what in seconds.",
    icon: FiBarChart2,
  },
];

export default function FeaturesGrid() {
  return (
    <section id="features" className="py-16 bg-white" aria-label="Detailed features">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700">
            <span
              className="inline-block size-1.5 rounded-full"
              style={{ backgroundColor: "var(--color-secondary)" }}
            />
            Features
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-[var(--font-display)] font-bold tracking-tight text-black">
            Everything you need for clean, fair group work
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-700 max-w-2xl mx-auto">
            CollabWrite focuses on the boring parts — tracking edits, merging conflicts, formatting — so your team can
            focus on the ideas.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <article
                key={f.title}
                className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="mt-1 inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 p-2 text-zinc-800">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-zinc-900">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-zinc-700 leading-6">{f.body}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
