"use client";

import { FiZap, FiUserCheck, FiFileText } from "react-icons/fi";

export default function KeyBenefits() {
  const cards = [
    {
      icon: FiZap,
      title: "Resolve Conflicts Instantly",
      body: "Automatic, explainable merges — the AI shows why it chose changes.",
    },
    {
      icon: FiUserCheck,
      title: "Track Contributions",
      body: "See who wrote what — avoid freeloaders and simplify grading.",
    },
    {
      icon: FiFileText,
      title: "Polish and Export",
      body: "Tone equalization, citation formatting, and exports to PDF/DOCX.",
    },
  ];

  return (
    <section className="py-14" aria-label="Key benefits">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex flex-col gap-3"
              >
                <div className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 p-2 text-zinc-800">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-zinc-900">{card.title}</h3>
                <p className="text-sm text-zinc-700 leading-6">{card.body}</p>
                <a
                  href="#demo"
                  className="mt-2 text-xs font-medium text-blue-700 hover:text-blue-900"
                >
                  Try Merge
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
