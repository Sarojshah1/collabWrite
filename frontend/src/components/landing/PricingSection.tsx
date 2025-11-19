"use client";

import { trackEvent } from "@/utils/tracking";

function PricingCard({
  label,
  price,
  description,
  features,
  highlight,
  cta,
  href,
}: {
  label: string;
  price: string;
  description: string;
  features: string[];
  highlight?: boolean;
  cta: string;
  href: string;
}) {
  return (
    <article
      className={`flex flex-col rounded-2xl border bg-white/90 p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-md ${
        highlight
          ? "border-blue-500 ring-2 ring-blue-200/60"
          : "border-zinc-200"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-zinc-900">{label}</h3>
        {highlight && (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
            Free for students
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-zinc-600">{description}</p>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-2xl font-[var(--font-display)] text-zinc-900">{price}</span>
        {highlight ? (
          <span className="text-[11px] text-zinc-600">per student, forever</span>
        ) : (
          <span className="text-[11px] text-zinc-600">contact for campus pricing</span>
        )}
      </div>
      <ul className="mt-3 space-y-1.5 text-xs text-zinc-700">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <span className="mt-1 inline-block size-1.5 rounded-full bg-emerald-500" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <a
        href={href}
        onClick={() => trackEvent("cta_start_assignment_click", { plan: label })}
        className={`mt-5 inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
          highlight
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "border border-zinc-200 bg-zinc-50 text-zinc-900 hover:bg-zinc-100"
        }`}
      >
        {cta}
      </a>
    </article>
  );
}

export default function PricingSection() {
  return (
    <section id="pricing" className="py-16 bg-gradient-to-b from-white via-white to-zinc-50" aria-label="Pricing">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-700">
            <span
              className="inline-block size-1.5 rounded-full"
              style={{ backgroundColor: "var(--color-primary)" }}
            />
            Simple student-first pricing
          </span>
          <h2 className="mt-4 text-2xl sm:text-3xl md:text-4xl font-[var(--font-display)] font-bold tracking-tight text-black">
            Start free, upgrade when your class needs it
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-700 max-w-2xl mx-auto">
            Students get core features free with verification. Faculty and classrooms can unlock advanced dashboards
            when you\'re ready.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 items-stretch">
          <PricingCard
            label="Student Free Plan"
            price="$0"
            description="Ideal for individual students and small project groups."
            features={[
              "Free with .edu or student verification",
              "Assignment Mode with basic merge",
              "Up to 3 active projects and 5 teammates",
              "Citation formatting and exports (PDF/DOCX) with reasonable limits",
            ]}
            highlight
            cta="Start for free"
            href="/signup"
          />

          <PricingCard
            label="Pro / Classroom"
            price="Talk to us"
            description="For instructors, labs, and programs running multiple group projects."
            features={[
              "Unlimited projects and larger teams",
              "Teacher dashboard with bulk grading exports",
              "Priority merge using faster LLM models",
              "Institutional licensing and shared templates",
            ]}
            cta="Request classroom access"
            href="/contact"
          />
        </div>
      </div>
    </section>
  );
}
