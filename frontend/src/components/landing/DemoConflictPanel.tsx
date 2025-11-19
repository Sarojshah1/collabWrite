"use client";

import { motion } from "framer-motion";
import { trackEvent } from "@/utils/tracking";

export default function DemoConflictPanel() {
  return (
    <section id="demo" className="py-16 bg-white" aria-label="Conflict panel live demo">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700">
            <span
              className="inline-block size-1.5 rounded-full"
              style={{ backgroundColor: "var(--color-secondary)" }}
            />
            Live demo
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-[var(--font-display)] font-bold tracking-tight text-black">
            See how CollabWrite handles conflicts
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-700 max-w-2xl mx-auto">
            Version A vs Version B vs AI merged version — with rationales you can skim in seconds.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-zinc-200 bg-white shadow-md overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-zinc-200 flex items-center justify-between text-xs text-zinc-600">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-red-400" />
              <span className="size-2.5 rounded-full bg-amber-400" />
              <span className="size-2.5 rounded-full bg-emerald-400" />
              <span className="ml-2">Group Assignment — Conflict Panel</span>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              AI merge ready
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr,1fr,1.1fr] p-4 text-xs sm:text-sm text-zinc-800">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-zinc-900 text-xs">Version A — Alex</h3>
              </div>
              <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 leading-relaxed">
                "Teamwork is important because it helps share tasks fairly and finish assignments on time. Everyone
                should try their best so the group grade is high."
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-zinc-900 text-xs">Version B — Maya</h3>
              </div>
              <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 leading-relaxed">
                "Effective collaboration distributes responsibilities, reduces last-minute stress, and makes it easier for
                instructors to evaluate each student&apos;s contribution."
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-zinc-900 text-xs">AI merged version</h3>
                <button
                  type="button"
                  onClick={() => trackEvent("demo_interaction", { action: "accept_merge" })}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-medium text-white shadow-sm"
                >
                  Accept Merge
                </button>
              </div>
              <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 leading-relaxed">
                "Effective teamwork distributes responsibilities fairly, reduces last-minute stress, and helps student
                groups submit stronger assignments on time. It also makes it easier for instructors to see how each
                member contributed to the final work."
              </p>
              <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-3 text-[11px] text-zinc-700 space-y-1">
                <p className="font-medium text-zinc-900">Why this merge?</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Merged "fairly" and "effective" language from both versions.</li>
                  <li>Kept academic tone closer to Version B.</li>
                  <li>Preserved concrete student outcomes from Version A.</li>
                </ul>
              </div>
              <div className="flex flex-wrap gap-2 text-[10px] text-zinc-600">
                <button
                  type="button"
                  onClick={() => trackEvent("demo_interaction", { action: "view_history" })}
                  className="inline-flex items-center gap-1 rounded-full border border-zinc-200 px-2 py-1"
                >
                  View history
                </button>
                <button
                  type="button"
                  onClick={() => trackEvent("demo_interaction", { action: "edit_merge" })}
                  className="inline-flex items-center gap-1 rounded-full border border-zinc-200 px-2 py-1"
                >
                  Edit merge
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <p className="mt-4 text-center text-xs text-zinc-600">
          Want to try it with your own text? Use assignment mode in the app to run a real merge.
        </p>
      </div>
    </section>
  );
}
