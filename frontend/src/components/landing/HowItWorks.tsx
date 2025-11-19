"use client";

import { motion } from "framer-motion";

const steps = [
  {
    title: "Create assignment & add teammates",
    body: [
      "Share a single link with your group.",
      "Set deadlines and roles up front.",
    ],
  },
  {
    title: "Write together — CollabWrite detects conflicts",
    body: [
      "Everyone drafts in one doc.",
      "Conflicting edits are flagged automatically.",
    ],
  },
  {
    title: "Accept AI merge & export",
    body: [
      "Review AI rationale for each change.",
      "Export as PDF, DOCX, or shareable link.",
    ],
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 border-t border-zinc-100 bg-white" aria-label="How CollabWrite works">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700">
            <span
              className="inline-block size-1.5 rounded-full"
              style={{ backgroundColor: "var(--color-primary)" }}
            />
            How it works
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-[var(--font-display)] font-bold tracking-tight text-black">
            Three steps from chaos to one clean file
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-700 max-w-2xl mx-auto">
            Designed for student teams and teachers who just want a download-ready assignment.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, index) => (
            <motion.article
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-3"
            >
              <div className="text-xs font-medium text-zinc-500">Step {index + 1}</div>
              <h3 className="text-base font-semibold text-zinc-900">{step.title}</h3>
              <ul className="mt-1 space-y-1 text-sm text-zinc-700">
                {step.body.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              {index === 2 && (
                <p className="mt-3 text-xs text-zinc-600">
                  For teachers: download a contribution report for grading — no extra setup.
                </p>
              )}
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
