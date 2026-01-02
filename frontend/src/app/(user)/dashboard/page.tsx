"use client";

import { useEffect, useMemo, useState } from "react";
import { listBlogs, type Blog, toggleBookmark } from "@/services/blogService";
import { userService } from "@/services/userService";
import BlogCard from "@/components/common/BlogCard";

export default function DashboardPage() {
  const [blogs, setBlogs] = useState<Blog[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "published" | "draft" | "saved"
  >("published");
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [authorFilter, setAuthorFilter] = useState<"all" | "me">("all");
  const [tagFilter, setTagFilter] = useState<"all" | string>("all");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);

        let currentUser = user;
        if (!currentUser) {
          try {
            const u = await userService.me();
            if (mounted) {
              setUser(u);
              currentUser = u;
            }
          } catch (e) {}
        }

        const params: any = { sort: "newest" };
        if (statusFilter === "saved") {
          params.saved = "true";
        } else if (statusFilter !== "all") {
          params.status = statusFilter;
        }

        const data = await listBlogs(params);
        if (mounted) setBlogs(data);
      } catch (e: unknown) {
        if (mounted) setError((e as Error)?.message || "Failed to load blogs");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [statusFilter]);

  const trimmedSearch = search.trim();

  const filteredBlogs = useMemo(() => {
    if (!blogs || !trimmedSearch) return blogs;
    const q = trimmedSearch.toLowerCase();
    return blogs.filter((b) => {
      const title = b.title?.toLowerCase?.() || "";
      const authorName =
        typeof b.author === "object" &&
        b.author &&
        "name" in b.author &&
        typeof b.author.name === "string"
          ? b.author.name.toLowerCase()
          : "";
      return title.includes(q) || authorName.includes(q);
    });
  }, [blogs, trimmedSearch]);

  const suggestionBlogs = useMemo(() => {
    if (!filteredBlogs || !trimmedSearch) return [] as Blog[];
    return filteredBlogs.slice(0, 5);
  }, [filteredBlogs, trimmedSearch]);

  const showSuggestions =
    searchFocused && !!trimmedSearch && suggestionBlogs.length > 0;

  const publishedCount = useMemo(() => {
    if (!blogs) return 0;
    return blogs.filter((b) => b.status === "published").length;
  }, [blogs]);

  const draftCount = useMemo(() => {
    if (!blogs) return 0;
    return blogs.filter((b) => b.status === "draft").length;
  }, [blogs]);

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-8">
      <header className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900">
              Your Writing Dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-600">
              Track performance, reopen drafts, and enhance collaboration.
            </p>
          </div>

          <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[360px]">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => {
                  setTimeout(() => setSearchFocused(false), 120);
                }}
                placeholder="Search ..."
                className="w-full rounded-full border border-zinc-200 bg-white px-4 py-2.5 pr-10 text-sm text-zinc-800 shadow-sm outline-none transition focus:border-zinc-300"
              />
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-zinc-400">
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
                <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white py-1 text-sm shadow-lg">
                  <p className="px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                    Suggestions
                  </p>
                  <ul className="max-h-64 divide-y divide-zinc-100 overflow-auto">
                    {suggestionBlogs.map((b) => (
                      <li key={b._id}>
                        <a
                          href={`/blog/${b._id}`}
                          className="flex items-center justify-between gap-3 px-4 py-2 hover:bg-zinc-50"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-zinc-900">
                              {b.title}
                            </p>
                            {typeof b.author === "object" &&
                              b.author &&
                              "name" in b.author && (
                                <p className="truncate text-[11px] text-zinc-500">
                                  {(b.author as { name: string }).name}
                                </p>
                              )}
                          </div>
                          <p className="shrink-0 text-[11px] text-zinc-400">
                            {(b.updatedAt || b.createdAt) &&
                              new Date(
                                b.updatedAt || b.createdAt
                              ).toLocaleDateString()}
                          </p>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50"
            >
              <span className="text-zinc-500">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                </svg>
              </span>
              Filter
            </button>

            <a
              href="/dashboard/write"
              className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-200/70"
            >
              New Article
            </a>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStatusFilter("published")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ring-1 ring-inset ring-zinc-200 ${
              statusFilter === "published"
                ? "bg-zinc-100 text-zinc-900"
                : "bg-white text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-zinc-900 text-white text-[10px]">
              
            </span>
            {publishedCount} Published
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("draft")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ring-1 ring-inset ring-zinc-200 ${
              statusFilter === "draft"
                ? "bg-zinc-100 text-zinc-900"
                : "bg-white text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            {draftCount} Under Review
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ring-1 ring-inset ring-zinc-200 ${
              statusFilter === "all"
                ? "bg-zinc-100 text-zinc-900"
                : "bg-white text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            {blogs?.length ?? 0} Open Comments
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter("saved")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ring-1 ring-inset ring-zinc-200 ${
              statusFilter === "saved"
                ? "bg-zinc-100 text-zinc-900"
                : "bg-white text-zinc-700 hover:bg-zinc-50"
            }`}
          >
            Saved
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "published" | "draft")
            }
            className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 shadow-sm"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value as "all" | "me")}
            className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 shadow-sm"
          >
            <option value="all">All Authors</option>
            <option value="me">Me</option>
          </select>

          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 shadow-sm"
          >
            <option value="all">All Tags</option>
          </select>

          <button
            type="button"
            className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 shadow-sm hover:bg-zinc-50"
            aria-label="More filters"
            title="More filters"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 4h18" />
              <path d="M7 12h10" />
              <path d="M10 20h4" />
            </svg>
          </button>
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
          <p className="text-base font-medium text-zinc-900">
            You don&apos;t have any published blogs yet.
          </p>
          <p className="text-sm text-zinc-600">
            Start a new document, write with AI assistance, and publish when
            you&apos;re ready.
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
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
          <div className="space-y-4">
            {filteredBlogs.map((b) => (
              <BlogCard
                key={b._id}
                title={b.title}
                excerpt={
                  b.contentHTML
                    ? b.contentHTML.replace(/<[^>]+>/g, " ").slice(0, 120) +
                      "..."
                    : undefined
                }
                authorName={
                  typeof b.author === "object" && b.author && "name" in b.author
                    ? b.author.name
                    : "Unknown"
                }
                authorAvatar={
                  typeof b.author === "object" &&
                  b.author &&
                  "avatar" in b.author
                    ? b.author.avatar || undefined
                    : undefined
                }
                publishedAt={b.createdAt || undefined}
                updatedAt={b.updatedAt || undefined}
                status={b.status === "published" ? "Published" : "Needs Review"}
                progress={b.status === "published" ? 70 : 45}
                collaborators={
                  typeof b.author === "object" && b.author && "name" in b.author
                    ? [
                        {
                          name: b.author.name,
                          avatar:
                            (b.author as { avatar?: string }).avatar ||
                            undefined,
                        },
                        { name: "Editor", avatar: undefined },
                        { name: "Reviewer", avatar: undefined },
                      ]
                    : []
                }
                likesCount={0}
                commentsCount={0}
                href={`/blog/${b._id}`}
                id={b._id}
                isBookmarked={
                  !!(user && b.bookmarks && b.bookmarks.includes(user.id))
                }
                onToggleBookmark={async (id) => {
                  try {
                    const { bookmarked } = await toggleBookmark(id);
                    setBlogs((prev) =>
                      prev
                        ? prev.map((blog) => {
                            if (blog._id === id) {
                              const bookmarks = blog.bookmarks || [];
                              if (bookmarked) {
                                return {
                                  ...blog,
                                  bookmarks: [...bookmarks, user?.id || ""],
                                };
                              } else {
                                return {
                                  ...blog,
                                  bookmarks: bookmarks.filter(
                                    (uid) => uid !== user?.id
                                  ),
                                };
                              }
                            }
                            return blog;
                          })
                        : null
                    );
                    // If filtering by saved and we unbookmark, maybe remove it?
                    // But that changes list abruptly. Let's keep it for now.
                  } catch (e) {
                    alert("Failed to bookmark");
                  }
                }}
              />
            ))}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-6 space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-zinc-900">
                  Dashboard Insights
                </h2>
                <div className="mt-3 divide-y divide-zinc-100">
                  <div className="flex gap-3 py-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-zinc-700">
                      
                    </span>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        2 posts need review
                      </p>
                      <p className="text-xs text-zinc-500">
                        Left unanswered for 7+ days
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 py-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-zinc-700">
                      
                    </span>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        1 draft hasn't been updated
                      </p>
                      <p className="text-xs text-zinc-500">
                        Last edited 3 weeks ago
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 py-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-zinc-700">
                      
                    </span>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        Short titles perform better
                      </p>
                      <p className="text-xs text-zinc-500">
                        Consider revising &quot;Testing Second&quot;
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-zinc-900">Actions</h2>
                <div className="mt-3 space-y-2">
                  <a
                    href="/dashboard/write"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                  >
                    <span className="text-zinc-500">+</span>
                    Start a new draft
                  </a>
                  <a
                    href="/dashboard/assignments"
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                  >
                    <span className="text-zinc-500">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                      </svg>
                    </span>
                    View assignments
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
