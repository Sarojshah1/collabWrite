"use client";

import { motion } from "framer-motion";

export default function MockEditor() {
  return (
    <motion.div
      className="mt-8 md:mt-0 mx-auto md:mx-0 w-full max-w-[720px] rounded-2xl border border-black/5 bg-white p-3 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2">
        <span className="size-2.5 rounded-full bg-red-400" />
        <span className="size-2.5 rounded-full bg-amber-400" />
        <span className="size-2.5 rounded-full bg-emerald-400" />
      </div>

      <div className="mt-3 rounded-lg border border-zinc-200 bg-white text-[11px] sm:text-xs text-zinc-800 overflow-hidden">
        {/* Conflict detected banner */}
        <motion.div
          className="flex items-center justify-between gap-3 px-4 py-2 border-b border-zinc-200 bg-amber-50"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: [0, 1, 1, 0], y: [-6, 0, 0, -6] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", times: [0, 0.2, 0.6, 1] }}
        >
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center rounded-full bg-amber-500/10 p-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
            </span>
            <div>
              <p className="font-medium text-amber-900">Conflict detected</p>
              <p className="text-[11px] text-amber-800">2 overlapping edits in introduction paragraph.</p>
            </div>
          </div>
          <span className="rounded-full bg-white px-2 py-1 text-[10px] font-medium text-amber-800 border border-amber-200">
            Auto-merge ready
          </span>
        </motion.div>

        {/* Columns: Version A / Version B / AI Merged */}
        <div className="grid gap-3 px-3 py-2.5 md:grid-cols-3">
          {/* Version A */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-zinc-900">Version A — Alex</p>
              <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-600">
                Draft
              </span>
            </div>
            <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 leading-snug">
              "Teamwork is important because it helps share tasks fairly and finish assignments on time. Everyone
              should try their best so the group grade is high."
            </p>
          </div>

          {/* Version B */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-zinc-900">Version B — Maya</p>
              <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-600">
                Draft
              </span>
            </div>
            <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 leading-snug">
              "Effective collaboration distributes responsibilities, reduces last-minute stress, and makes it easier
              for instructors to evaluate each student&apos;s contribution."
            </p>
          </div>

          {/* AI merged version */}
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0.4 }}
            animate={{ opacity: [0.4, 1, 1, 0.6] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", times: [0, 0.3, 0.7, 1] }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-zinc-900">AI merged version</p>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-medium text-white shadow-sm"
              >
                Accept Merge
              </button>
            </div>
            <p className="rounded-lg border border-zinc-200 bg-blue-50/60 p-2 leading-snug">
              "Effective teamwork distributes responsibilities fairly, reduces last-minute stress, and makes grading
              each teammate&apos;s contribution easier."
            </p>
            <motion.div
              className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-2 text-[11px] text-zinc-700 space-y-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 1, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", times: [0, 0.3, 0.5, 1] }}
            >
              <p className="font-medium text-zinc-900">Why this merge?</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Merged "fairly" and "effective" language from both versions.</li>
                <li>Kept academic tone closer to Version B.</li>
                <li>Preserved concrete student outcomes from Version A.</li>
              </ul>
            </motion.div>
          </motion.div>
        </div>

        {/* Live collaboration strip (old collaborating feel) */}
        <div className="mt-2 border-t border-zinc-100 bg-zinc-50/60 px-3 py-2.5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-medium text-zinc-800">Live document</p>
            <div className="flex -space-x-1.5">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-medium text-white">
                A
              </span>
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-medium text-white ring-2 ring-zinc-50">
                M
              </span>
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-medium text-white ring-2 ring-zinc-50">
                AI
              </span>
            </div>
          </div>
          <div className="relative h-14 rounded-md border border-dashed border-zinc-200 bg-white overflow-hidden">
            <div className="px-3 pt-2 pr-8 text-[11px] leading-snug text-zinc-700">
              Alex and Maya are editing the same paragraph while AI keeps everything in sync.
            </div>
            {/* Moving cursors */}
            <motion.div
              className="absolute"
              animate={{ x: [24, 140, 80], y: [30, 10, 26] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", times: [0, 0.5, 1] }}
            >
              <div className="flex items-center gap-1">
                <div className="h-4 w-0.5 rounded-sm" style={{ backgroundColor: "var(--color-secondary)" }} />
                <span className="rounded-md bg-amber-500 px-1.5 py-0.5 text-[9px] text-white">Maya</span>
              </div>
            </motion.div>
            <motion.div
              className="absolute"
              animate={{ x: [180, 90, 210], y: [8, 26, 20] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 1] }}
            >
              <div className="flex items-center gap-1">
                <div className="h-4 w-0.5 rounded-sm" style={{ backgroundColor: "var(--color-primary)" }} />
                <span className="rounded-md bg-blue-600 px-1.5 py-0.5 text-[9px] text-white">Alex</span>
              </div>
            </motion.div>
            {/* Typing indicator */}
            <motion.div
              className="absolute bottom-1.5 left-2 inline-flex items-center gap-1 rounded-full bg-zinc-900/90 px-2 py-1 text-[9px] text-zinc-100"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="h-1 w-1 rounded-full bg-zinc-100" />
              <span className="h-1 w-1 rounded-full bg-zinc-100" />
              <span className="h-1 w-1 rounded-full bg-zinc-100" />
              <span className="ml-1">Teammates are typing…</span>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
