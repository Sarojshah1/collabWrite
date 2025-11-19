"use client";

import { useEffect, useMemo, useState } from "react";
import { listBlogs, type Blog } from "@/services/blogService";
import BlogCard from "@/components/common/BlogCard";

export default function DashboardPage() {
  const [blogs, setBlogs] = useState<Blog[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listBlogs({ status: "published", sort: "newest" });
        if (mounted) setBlogs(data);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load blogs");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const trimmedSearch = search.trim();

  const filteredBlogs = useMemo(() => {
    if (!blogs || !trimmedSearch) return blogs;
    const q = trimmedSearch.toLowerCase();
    return blogs.filter((b) => {
      const title = b.title?.toLowerCase?.() || "";
      const authorName =
        typeof b.author === "object" && b.author && "name" in b.author && typeof b.author.name === "string"
          ? b.author.name.toLowerCase()
          : "";
      return title.includes(q) || authorName.includes(q);
    });
  }, [blogs, trimmedSearch]);

  const suggestionBlogs = useMemo(() => {
    if (!filteredBlogs || !trimmedSearch) return [] as Blog[];
    return filteredBlogs.slice(0, 5);
  }, [filteredBlogs, trimmedSearch]);

  const showSuggestions = searchFocused && !!trimmedSearch && suggestionBlogs.length > 0;

  return (
    <section className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-6 flex flex-col gap-3 border-b border-zinc-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Home</p>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-900">Your published blogs</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Review everything you&apos;ve shipped and jump back into any post to improve it.
          </p>
        </div>
        <div className="flex flex-1 flex-col items-stretch gap-3 sm:flex-row sm:items-end sm:justify-end">
          <div className="relative w-full max-w-xs sm:max-w-sm">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => {
                // small delay so clicks on suggestions still register
                setTimeout(() => setSearchFocused(false), 120);
              }}
              placeholder="Search by title or author"
              className="w-full rounded-full border border-zinc-200 bg-zinc-50 px-3 py-2 pr-8 text-sm text-zinc-800 shadow-sm outline-none ring-0 transition focus:border-amber-400 focus:bg-white focus:shadow-md"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-400">
              <svg
                aria-hidden="true"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 3.5A5.5 5.5 0 1 1 3.5 9 5.5 5.5 0 0 1 9 3.5Zm0-1.5a7 7 0 1 0 4.38 12.46l2.83 2.83a1 1 0 0 0 1.42-1.42l-2.83-2.83A7 7 0 0 0 9 2Z"
                  fill="currentColor"
                />
              </svg>
            </span>

            {showSuggestions && (
              <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white/95 py-1 text-sm shadow-lg">
                <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                  Suggestions
                </p>
                <ul className="max-h-64 divide-y divide-zinc-100 overflow-auto">
                  {suggestionBlogs.map((b) => (
                    <li key={b._id}>
                      <a
                        href={`/blog/${b._id}`}
                        className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-zinc-50"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-zinc-900">{b.title}</p>
                          {typeof b.author === "object" && b.author && "name" in b.author && (
                            <p className="truncate text-[11px] text-zinc-500">
                              {(b.author as any).name as string}
                            </p>
                          )}
                        </div>
                        <p className="shrink-0 text-[11px] text-zinc-400">
                          {(b.updatedAt || b.createdAt) &&
                            new Date(b.updatedAt || b.createdAt).toLocaleDateString()}
                        </p>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3">
            {!loading && !error && (
              <div className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs text-zinc-700">
                <span className="font-semibold">{blogs?.length ?? 0}</span> published
              </div>
            )}
            <a
              href="/dashboard/write"
              className="inline-flex items-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800"
            >
              New blog
            </a>
          </div>
        </div>
      </header>

      {loading && (
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600 shadow-sm">
          Loading your published blogs…
        </div>
      )}

      {error && !loading && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!loading && !error && blogs && blogs.length === 0 && (
        <div className="mt-6 flex flex-col items-start justify-center gap-3 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-700">
          <p className="text-base font-medium text-zinc-900">You don&apos;t have any published blogs yet.</p>
          <p className="text-sm text-zinc-600">
            Start a new document, write with AI assistance, and publish when you&apos;re ready.
          </p>
          <a
            href="/dashboard/write"
            className="mt-1 inline-flex items-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-zinc-800"
          >
            Create your first blog
          </a>
        </div>
      )}

      {!loading && !error && filteredBlogs && filteredBlogs.length > 0 && (
        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
          <div className="space-y-4">
            {filteredBlogs.map((b) => (
              <BlogCard
                key={b._id}
                title={b.title}
                excerpt={b.contentHTML ? b.contentHTML.replace(/<[^>]+>/g, " ").slice(0, 180) + "…" : ""}
                authorName={typeof b.author === "object" && b.author && "name" in b.author ? b.author.name : "Unknown"}
                authorAvatar={typeof b.author === "object" && b.author && "avatar" in b.author ? b.author.avatar || undefined : undefined}
                publishedAt={b.updatedAt || b.createdAt || undefined}
                href={`/blog/${b._id}`}
              />
            ))}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-4 space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm shadow-sm">
                <h2 className="text-sm font-semibold text-zinc-900">Writing tips</h2>
                <ul className="mt-2 space-y-1.5 text-zinc-600">
                  <li>Keep titles specific and benefit-driven.</li>
                  <li>Use headings and bullets for long posts.</li>
                  <li>Revisit older posts to tighten intros.</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm shadow-sm">
                <h2 className="text-sm font-semibold text-zinc-900">Quick actions</h2>
                <ul className="mt-2 space-y-2">
                  <li>
                    <a href="/dashboard/write" className="text-xs font-medium text-zinc-700 hover:text-zinc-900">
                      + Start a new draft
                    </a>
                  </li>
                  <li>
                    <a href="/dashboard/assignments" className="text-xs font-medium text-zinc-700 hover:text-zinc-900">
                      View assignments
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
