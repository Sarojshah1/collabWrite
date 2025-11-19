import ProfileCard from "@/components/profile/ProfileCard";

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Your Profile</h1>
          <p className="mt-1 text-sm text-zinc-600">Manage your public info and see your stats.</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="#"
            className="inline-flex items-center justify-center rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-800 hover:bg-zinc-100"
          >
            Edit profile
          </a>
          <a
            href="/dashboard/write"
            className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            New post
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
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
 
          <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-800">Recent posts</h2>
              <a href="/dashboard/blogs" className="text-sm text-zinc-600 hover:text-zinc-900">View all</a>
            </div>
            <ul className="divide-y divide-zinc-200">
              {[
                { title: "How I plan long-form articles", date: "Oct 21" },
                { title: "Designing a docs-like editor UI", date: "Oct 11" },
                { title: "Real-time collaboration tips", date: "Sep 29" },
              ].map((p) => (
                <li key={p.title} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-zinc-800">{p.title}</p>
                    <p className="text-xs text-zinc-500">{p.date}</p>
                  </div>
                  <a href="#" className="text-sm text-zinc-600 hover:text-zinc-900">Open</a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="mb-2 text-sm font-semibold text-zinc-800">About</h2>
            <p className="text-sm leading-6 text-zinc-700">
              I love building tools that help people write together. When I’m not writing, I’m experimenting with
              design systems and motion.
            </p>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-5">
            <h2 className="mb-3 text-sm font-semibold text-zinc-800">Social</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-zinc-700 hover:underline">twitter.com/alexwrites</a>
              </li>
              <li>
                <a href="#" className="text-zinc-700 hover:underline">github.com/alexwrites</a>
              </li>
              <li>
                <a href="#" className="text-zinc-700 hover:underline">linkedin.com/in/alexwrites</a>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
