import ProfileCard from "@/components/profile/ProfileCard";

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      {/* Top gradient header */}
      <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-violet-500 via-indigo-500 to-sky-500 px-5 py-4 sm:px-6 sm:py-5 text-sm text-violet-50 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide/relaxed text-violet-100/80">Profile</p>
            <h1 className="text-lg sm:text-xl font-semibold text-white">Your creator hub</h1>
            <p className="mt-1 text-xs sm:text-[13px] text-violet-100/90 max-w-xl">
              See how your writing is performing and keep your public profile up to date.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-violet-200/70 bg-white/5 px-4 py-1.5 text-[13px] font-medium text-violet-50 shadow-sm hover:bg-white/10"
            >
              Edit profile
            </button>
            <a
              href="/dashboard/write"
              className="inline-flex items-center justify-center rounded-full bg-white px-4 py-1.5 text-[13px] font-semibold text-violet-700 shadow-sm hover:bg-violet-50"
            >
              New post
            </a>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[{
          label: "Published posts",
          value: 24,
        }, {
          label: "Total views",
          value: 70,
        }, {
          label: "Total likes",
          value: 0,
        }].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-zinc-200 bg-white/90 px-4 py-3 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">{s.label}</p>
              <p className="mt-1 text-xl font-semibold text-zinc-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ProfileCard
            name="Alex Johnson"
            username="alexwrites"
            bio="Writer. Builder of collaborative tools. Sharing stories about productivity, design, and the craft of writing."
            avatarUrl="/logo.svg"
            coverUrl="/globe.svg"
            stats={{ posts: 24, followers: 1_204, following: 182 }}
            skills={["writing", "nextjs", "ui/ux", "collaboration"]}
            location="Kathmandu, Nepal"
            website="https://collabwrite.app"
          />

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900">Recent posts</h2>
              <a href="/dashboard/blogs" className="text-xs font-medium text-zinc-600 hover:text-zinc-900">
                View all
              </a>
            </div>
            <ul className="divide-y divide-zinc-200">
              {[{
                title: "How I plan long-form articles",
                date: "Oct 21",
              }, {
                title: "Designing a docs-like editor UI",
                date: "Oct 11",
              }, {
                title: "Real-time collaboration tips",
                date: "Sep 29",
              }].map((p) => (
                <li key={p.title} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900">{p.title}</p>
                    <p className="text-xs text-zinc-500">{p.date}</p>
                  </div>
                  <a href="#" className="text-xs font-medium text-violet-600 hover:text-violet-800">
                    Open
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-zinc-900">About</h2>
            <p className="text-sm leading-6 text-zinc-700">
              I love building tools that help people write together. When I’m not writing, I’m experimenting with
              design systems, motion, and real-time collaboration features.
            </p>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-zinc-900">Social</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="inline-flex items-center gap-2 text-zinc-700 hover:text-violet-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                  twitter.com/alexwrites
                </a>
              </li>
              <li>
                <a href="#" className="inline-flex items-center gap-2 text-zinc-700 hover:text-violet-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                  github.com/alexwrites
                </a>
              </li>
              <li>
                <a href="#" className="inline-flex items-center gap-2 text-zinc-700 hover:text-violet-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  linkedin.com/in/alexwrites
                </a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
