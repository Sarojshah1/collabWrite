"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  addComment,
  getBlog,
  listComments,
  toggleLike,
  type Blog,
  type BlogComment,
} from "@/services/blogService";
import Sidebar from "@/components/common/Sidebar";

function getUserIdFromToken(): string | null {
  try {
    if (typeof window === "undefined") return null;
    const token = localStorage.getItem("cw_token");
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payloadJson = atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(payloadJson);
    return typeof payload?.id === "string" ? payload.id : null;
  } catch {
    return null;
  }
}

export default function ReadBlogPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string);
  const router = useRouter();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likeBusy, setLikeBusy] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [commentBusy, setCommentBusy] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [articleSearch, setArticleSearch] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) return;
      try {
        setLoading(true);
        const b = await getBlog(id);
        const c = await listComments(id, 50);
        if (!mounted) return;
        if (mounted) setBlog(b);
        setComments(c);
        const rawLikes = b?.likes;
        const likesArr = Array.isArray(rawLikes) ? rawLikes.map(String) : [];
        setLikesCount(likesArr.length);
        const uid = getUserIdFromToken();
        setLiked(uid ? likesArr.includes(uid) : false);
      } catch (e: unknown) {
        if (mounted) setError((e as Error)?.message || "Failed to load blog");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const computedLiked = useMemo(() => liked, [liked]);

  const readingTime = (() => {
    if (!blog?.contentHTML) return null;
    const text = blog.contentHTML.replace(/<[^>]+>/g, " ");
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    if (!words) return null;
    const minutes = Math.max(1, Math.round(words / 220));
    return `${minutes} min read`;
  })();

  const safeAuthor =
    typeof blog?.author === "object" &&
    blog.author &&
    "name" in blog.author &&
    typeof blog.author.name === "string"
      ? blog.author.name
      : "Unknown";

  const publishedLabel = (() => {
    const d = blog?.createdAt ? new Date(blog.createdAt) : null;
    if (!d || Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  })();

  const derivedInsights = [
    "Short, specific titles tend to perform better.",
    "Use headings and short paragraphs to improve readability.",
    "Add examples early to help readers follow along.",
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="hidden lg:block fixed inset-y-0 left-0 w-64 border-r border-zinc-200 bg-white">
        <div className="h-full overflow-y-auto px-4 py-5">
          <Sidebar />
        </div>
      </div>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/80 backdrop-blur">
          <div className="mx-auto max-w-[1200px] px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <span className="hidden sm:inline">CollabWrite</span>
                <span className="hidden sm:inline">›</span>
                <span>Home</span>
                <span>›</span>
                <span>Articles</span>
                <span>›</span>
                <span className="max-w-[220px] truncate text-zinc-700">
                  {blog?.title || "Article"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative hidden sm:block w-[360px]">
                  <input
                    value={articleSearch}
                    onChange={(e) => setArticleSearch(e.target.value)}
                    placeholder="Search articles..."
                    className="h-9 w-full rounded-full border border-zinc-200 bg-white px-4 pr-10 text-sm text-zinc-800 shadow-sm outline-none"
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
                </div>
                <span className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-700">
                  N
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1200px] px-6 py-6">
          <div className="mb-4 flex items-center gap-2 text-xs text-zinc-500">
            <button
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 font-medium hover:bg-zinc-50"
              onClick={() => router.back()}
            >
              ← Back
            </button>
            <span className="hidden sm:inline">/</span>
            <span>Articles</span>
            <span className="hidden sm:inline">/</span>
            <span className="max-w-[320px] truncate text-zinc-700">
              {blog?.title || ""}
            </span>
          </div>

          {loading && (
            <div className="mt-10 text-sm text-zinc-600">
              Loading article...
            </div>
          )}

          {error && !loading && (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
              {error}
            </div>
          )}

          {!loading && !error && blog && (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
              <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h1
                      className="text-4xl font-semibold tracking-tight text-zinc-900"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {blog.title}
                    </h1>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-zinc-600">
                      <span className="inline-flex h-9 w-9 overflow-hidden rounded-full bg-zinc-100 ring-1 ring-inset ring-zinc-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            typeof blog.author === "object" &&
                            blog.author &&
                            "avatar" in blog.author
                              ? blog.author.avatar || "/logo.svg"
                              : "/logo.svg"
                          }
                          alt={safeAuthor}
                          className="h-full w-full object-cover"
                        />
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-medium text-zinc-900">
                          {safeAuthor.toLowerCase()}
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          {publishedLabel}
                          {readingTime ? `  •  ${readingTime}` : ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="prose prose-zinc mt-8 max-w-none text-black text-[15px] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: blog.contentHTML || "" }}
                />

                <section className="mt-10 border-t border-zinc-200 pt-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-black">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={likeBusy}
                        onClick={async () => {
                          if (!blog?._id) return;
                          try {
                            setLikeBusy(true);
                            const res = await toggleLike(blog._id);
                            setLiked(res.liked);
                            setLikesCount(res.likesCount);
                          } finally {
                            setLikeBusy(false);
                          }
                        }}
                        className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium hover:bg-zinc-50 disabled:opacity-60"
                      >
                        {likeBusy
                          ? "Saving..."
                          : computedLiked
                          ? "Liked"
                          : "Like"}{" "}
                        {likesCount > 0 ? `(${likesCount})` : ""}
                      </button>
                      <span className="hidden sm:inline text-[11px] text-zinc-500">
                        Likes and comments help power your Reports & Analytics.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                      }
                      className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium hover:bg-zinc-50"
                    >
                      Back to top
                    </button>
                  </div>

                  <div className="space-y-2 text-xs">
                    <p className="font-medium text-zinc-800">Comments</p>
                    <div className="max-h-40 overflow-y-auto space-y-1.5">
                      {comments.length === 0 && (
                        <p className="text-[11px] text-zinc-500">
                          No comments yet. Be the first to leave feedback.
                        </p>
                      )}
                      {comments.map((c) => (
                        <div
                          key={c.id}
                          className="rounded-md border border-zinc-200 bg-white px-2 py-1"
                        >
                          <p className="text-[11px] text-zinc-800 whitespace-pre-wrap">
                            {c.text}
                          </p>
                          <p className="mt-0.5 text-[10px] text-zinc-400">
                            {c.user?.name ? `${c.user.name}  •  ` : ""}
                            {c.createdAt
                              ? new Date(c.createdAt).toLocaleString()
                              : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                    <form
                      className="mt-1 flex items-center gap-2"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const txt = commentText.trim();
                        if (!txt || !blog?._id) return;
                        try {
                          setCommentBusy(true);
                          const created = await addComment(blog._id, txt);
                          setComments((prev) => [
                            {
                              id: created.id,
                              text: created.text,
                              createdAt: created.createdAt,
                              user: null,
                            },
                            ...prev,
                          ]);
                          setCommentText("");
                        } finally {
                          setCommentBusy(false);
                        }
                      }}
                    >
                      <input
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment about this article..."
                        className="flex-1 rounded-md border border-zinc-300 bg-white px-2 py-1 text-[11px] text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                      />
                      <button
                        type="submit"
                        disabled={!commentText.trim() || commentBusy}
                        className="inline-flex items-center rounded-md bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-black disabled:opacity-60"
                      >
                        {commentBusy ? "Posting..." : "Post"}
                      </button>
                    </form>
                  </div>
                </section>
              </article>

              <aside className="hidden lg:block">
                <div className="sticky top-24 space-y-4">
                  <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <h2 className="text-sm font-semibold text-zinc-900">
                      Key Insights
                    </h2>
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-xs text-zinc-700">
                      {derivedInsights.map((x, i) => (
                        <li key={`${x}-${i}`}>{x}</li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className="mt-4 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                    >
                      View all insights
                    </button>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <h2 className="text-sm font-semibold text-zinc-900">
                      Share this article
                    </h2>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                        aria-label="Share on X"
                      >
                        X
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                        aria-label="Share on Facebook"
                      >
                        f
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                        aria-label="Share on LinkedIn"
                      >
                        in
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              window.location.href
                            );
                          } catch {}
                        }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                        aria-label="Copy link"
                        title="Copy link"
                      >
                        ⧉
                      </button>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
