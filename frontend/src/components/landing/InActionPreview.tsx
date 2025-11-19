"use client";

import { motion } from "framer-motion";

export default function InActionPreview() {
  return (
    <section className="relative py-20">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-white" />
        <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-3xl opacity-40"
             style={{
               background:
                 "radial-gradient(closest-side, color-mix(in oklab, var(--color-primary) 30%, transparent), transparent 70%), radial-gradient(closest-side, color-mix(in oklab, var(--color-secondary) 22%, transparent), transparent 70%)",
             }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-2 sm:px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700 shadow-sm">
            <span className="inline-block size-1.5 rounded-full" style={{ backgroundColor: "var(--color-primary)" }} />
            In action
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-[var(--font-display)] font-bold tracking-tight text-black">
            Writing, AI, and teamwork—together
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-700">
            A single surface where edits, suggestions, and comments flow in real time.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <motion.div
            className="relative lg:col-span-2"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="rounded-3xl p-[1px]"
              style={{
                background:
                  "linear-gradient(135deg, color-mix(in oklab, var(--color-primary) 45%, transparent), color-mix(in oklab, var(--color-secondary) 45%, transparent))",
              }}
              whileHover={{ rotateX: 2, rotateY: -2 }}
              transition={{ type: "spring", stiffness: 120, damping: 14 }}
            >
              <div className="rounded-3xl border border-zinc-200 bg-white shadow-md overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-200">
                  <span className="size-2.5 rounded-full bg-red-400" />
                  <span className="size-2.5 rounded-full bg-amber-400" />
                  <span className="size-2.5 rounded-full bg-emerald-400" />
                  <span className="ml-3 text-xs text-zinc-600">editor.tsx</span>
                </div>
                <div className="relative grid grid-cols-[56px,1fr]">
                <div className="relative mt-5 font-mono text-[13px] leading-6 text-zinc-800">
                      <motion.span
                        className="inline-block whitespace-nowrap overflow-hidden align-middle"
                        style={{ borderRight: "1px solid var(--color-primary)" }}
                        animate={{ width: ["0ch", "12ch", "26ch", "34ch"] }}
                        transition={{ duration: 3.2, times: [0, 0.35, 0.7, 1], repeat: Infinity, repeatDelay: 1.2 }}
                      >
                        Collaborative writing makes teams faster
                      </motion.span>
                      <motion.span
                        className="absolute left-0 top-0 h-6 rounded"
                        style={{ backgroundColor: "color-mix(in oklab, var(--color-secondary) 20%, transparent)" as any }}
                        animate={{ width: ["0%", "45%", "0%"], opacity: [0, 1, 0] }}
                        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
                      />
                      <motion.span
                        className="inline-block w-0.5 h-5 ml-1 align-middle"
                        style={{ backgroundColor: "var(--color-primary)" }}
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    </div>
                  <div className="relative p-5">
                    <div className="space-y-3 h-60">
                      <motion.div className="h-4 rounded w-11/12 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200"
                        animate={{ backgroundPosition: ["0% 0%","100% 0%","0% 0%"] }}
                        transition={{ duration: 2.2, repeat: Infinity }}
                        style={{ backgroundSize: "200% 100%" }}
                      />
                      <motion.div className="h-4 rounded w-9/12 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200"
                        animate={{ backgroundPosition: ["0% 0%","100% 0%","0% 0%"] }}
                        transition={{ duration: 2.2, repeat: Infinity, delay: 0.15 }}
                        style={{ backgroundSize: "200% 100%" }}
                      />
                      <motion.div className="h-4 rounded w-8/12 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200"
                        animate={{ backgroundPosition: ["0% 0%","100% 0%","0% 0%"] }}
                        transition={{ duration: 2.2, repeat: Infinity, delay: 0.3 }}
                        style={{ backgroundSize: "200% 100%" }}
                      />
                      <motion.div className="h-4 rounded w-6/12 bg-gradient-to-r from-zinc-200 via-zinc-100 to-zinc-200"
                        animate={{ backgroundPosition: ["0% 0%","100% 0%","0% 0%"] }}
                        transition={{ duration: 2.2, repeat: Infinity, delay: 0.45 }}
                        style={{ backgroundSize: "200% 100%" }}
                      />
                    </div>
                    <motion.div
                      className="absolute bottom-4 left-4 text-xs text-white px-2 py-1 rounded-md shadow"
                      style={{ backgroundColor: "var(--color-primary)" }}
                      animate={{ opacity: [0,1,1,0], y: [8,0,0,8] }}
                      transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 2 }}
                    >
                      AI expanded intro
                    </motion.div>

                    

                    <motion.div
                      className="absolute top-4 right-4 text-xs text-white px-2 py-1 rounded-md shadow"
                      style={{ backgroundColor: "#10B981" }}
                      animate={{ opacity: [0,0,1,1,0], y: [-6,-6,0,0,-6] }}
                      transition={{ duration: 3.5, repeat: Infinity, repeatDelay: 6, ease: "easeInOut" }}
                    >
                      Suggestion accepted
                    </motion.div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 border-t border-zinc-200 text-[11px] text-zinc-600">
                  <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 px-2 py-1">AI Assist</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 px-2 py-1">Autosave</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 px-2 py-1">Shortcuts</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="rounded-3xl border border-zinc-200 bg-white shadow-md overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-zinc-200 flex items-center gap-2">
                <span className="inline-block size-2 rounded-full" style={{ backgroundColor: 'var(--color-secondary)' }} />
                <h3 className="font-semibold text-zinc-900 text-sm">Live presence</h3>
              </div>
              <div className="relative h-40">
                <motion.div
                  className="absolute"
                  animate={{ x: [16, 120, 120, 40], y: [16, 36, 36, 72] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", times: [0, 0.45, 0.6, 1] }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-0.5 h-4 rounded-sm" style={{ backgroundColor: 'var(--color-secondary)' }} />
                    <span className="px-1 py-0.5 rounded-md text-[10px] text-white" style={{ backgroundColor: 'var(--color-secondary)' }}>Saroj</span>
                  </div>
                </motion.div>
                <motion.div
                  className="absolute"
                  animate={{ x: [160, 90, 90, 220], y: [60, 24, 24, 100] }}
                  transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", times: [0, 0.45, 0.6, 1], delay: 0.7 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-0.5 h-4 rounded-sm" style={{ backgroundColor: 'var(--color-primary)' }} />
                    <span className="px-1 py-0.5 rounded-md text-[10px] text-white" style={{ backgroundColor: 'var(--color-primary)' }}>Author</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="rounded-3xl border border-zinc-200 bg-white shadow-md overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-zinc-200 flex items-center gap-2">
                <span className="inline-block size-2 rounded-full" style={{ backgroundColor: 'var(--color-success)' }} />
                <h3 className="font-semibold text-zinc-900 text-sm">Impact</h3>
              </div>
              <div className="grid grid-cols-3 divide-x divide-zinc-200 text-center text-sm">
                <div className="py-4">
                  <div className="font-[var(--font-display)] text-xl text-zinc-900">2x</div>
                  <div className="text-zinc-600 text-[11px]">Faster drafts</div>
                </div>
                <div className="py-4">
                  <div className="font-[var(--font-display)] text-xl text-zinc-900">-35%</div>
                  <div className="text-zinc-600 text-[11px]">Review time</div>
                </div>
                <div className="py-4">
                  <div className="font-[var(--font-display)] text-xl text-zinc-900">+98%</div>
                  <div className="text-zinc-600 text-[11px]">Editor uptime</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
