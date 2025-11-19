"use client";

export default function TrustSection() {
  return (
    <section className="py-14 bg-white" aria-label="Trust and social proof">
      <div className="mx-auto max-w-6xl px-6 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <p className="text-sm text-zinc-700 italic border-l-2 border-zinc-300 pl-4">
            "We stopped fighting about versions and actually finished on time. CollabWrite made it obvious who changed
            what and when."
          </p>
          <p className="mt-3 text-xs font-medium text-zinc-800">
            3rd-year Engineering Student
          </p>
        </div>
        <div className="space-y-3 text-right md:text-left">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Used by student groups at</p>
          <div className="flex flex-wrap gap-3 text-xs text-zinc-600">
            <span className="inline-flex items-center rounded-full border border-zinc-200 px-3 py-1 bg-white">
              Campus AI Society
            </span>
            <span className="inline-flex items-center rounded-full border border-zinc-200 px-3 py-1 bg-white">
              Product Club
            </span>
            <span className="inline-flex items-center rounded-full border border-zinc-200 px-3 py-1 bg-white">
              CS Capstone Teams
            </span>
          </div>
          <div className="text-xs text-zinc-600">
            <span className="font-semibold text-zinc-900">3.5 hours</span> average time saved per project (placeholder).
          </div>
        </div>
      </div>
    </section>
  );
}
