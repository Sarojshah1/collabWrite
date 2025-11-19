"use client";

const FAQ_ITEMS = [
  {
    q: "Is CollabWrite free for students?",
    a: "Yes. Students can use the core features for free with .edu or equivalent student verification. The free plan covers Assignment Mode, basic AI merges, and exports with reasonable limits.",
  },
  {
    q: "What LLM do you use?",
    a: "CollabWrite uses industry-leading, privacy-conscious LLM providers. Drafts are processed securely and not stored longer than needed to provide the service.",
  },
  {
    q: "Can teachers see edits and contributions?",
    a: "Yes. With a teacher role, instructors can access a contribution report that summarizes who wrote what and when.",
  },
  {
    q: "Does it check plagiarism?",
    a: "Plagiarism checking can be integrated through third-party tools like Turnitin or similar services, depending on your institution.",
  },
];

export default function FAQSection() {
  return (
    <section id="faq" className="py-16 bg-white" aria-label="Frequently asked questions">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-[var(--font-display)] font-bold tracking-tight text-black">
            FAQ for students and teachers
          </h2>
          <p className="mt-2 text-sm text-zinc-700">
            Short answers to the questions you\'ll get from teammates and instructors.
          </p>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => (
            <article
              key={item.q}
              className="rounded-2xl border border-zinc-200 bg-white/90 px-4 py-3 text-sm text-zinc-800 shadow-sm transition-colors hover:border-zinc-300 hover:bg-white"
            >
              <div className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-zinc-100 text-[11px] text-zinc-600">
                  ?
                </span>
                <div>
                  <h3 className="font-medium text-zinc-900">{item.q}</h3>
                  <p className="mt-1 text-xs sm:text-sm leading-6 text-zinc-700">{item.a}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
