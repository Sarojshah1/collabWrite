"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBlog, type Blog } from "@/services/blogService";
import { recordView, recordLike, recordComment } from "@/services/analyticsService";

export default function ReadBlogPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string);
  const router = useRouter();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likeBusy, setLikeBusy] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<{ id: number; text: string; ts: number }[]>([]);
  const viewRecordedRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) return;
      try {
        setLoading(true);
        const b = await getBlog(id);
        if (mounted) setBlog(b as any);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load blog");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Record a view once per mount for this blog
  useEffect(() => {
    if (!blog?._id) return;
    if (viewRecordedRef.current) return;
    viewRecordedRef.current = true;
    (async () => {
      try {
        await recordView(blog._id as string);
      } catch {
        // ignore analytics errors on client
      }
    })();
  }, [blog?._id]);

  const readingTime = (() => {
    if (!blog?.contentHTML) return null;
    const text = blog.contentHTML.replace(/<[^>]+>/g, " ");
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    if (!words) return null;
    const minutes = Math.max(1, Math.round(words / 220));
    return `${minutes} min read`;
  })();

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-0 sm:py-10">
        <div className="mb-5 flex items-center justify-between gap-3 text-xs text-zinc-500">
        <button
          className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white/80 px-3 py-1 font-medium hover:bg-zinc-50"
          onClick={() => router.back()}
        >
          <span aria-hidden>←</span>
          <span>Back</span>
        </button>
        {blog?.updatedAt && !loading && !error && (
          <span className="hidden sm:inline">
            Updated {new Date(blog.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          </span>
        )}
        </div>

        {loading && (
          <div className="mt-10 text-sm text-zinc-600">Loading article…</div>
        )}

        {error && !loading && (
          <div className="mt-10 rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            {error}
          </div>
        )}

        {!loading && !error && blog && (
          <article>
            <header className="border-b border-zinc-200 pb-5">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5">Blog</span>
                {readingTime && (
                  <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 normal-case">
                    {readingTime}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-semibold leading-tight text-zinc-900 sm:text-[2.3rem]">
                {blog.title}
              </h1>
              {typeof blog.author === "object" && blog.author && (
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-700">
                  <span className="inline-flex h-9 w-9 overflow-hidden rounded-full bg-zinc-100 ring-1 ring-inset ring-zinc-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={blog.author.avatar || "/logo.svg"}
                      alt={blog.author.name}
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <div className="flex flex-col text-xs sm:text-[13px]">
                    <span className="font-medium text-zinc-900">{blog.author.name}</span>
                    <span className="text-zinc-500">
                      {blog.updatedAt
                        ? new Date(blog.updatedAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : blog.createdAt
                        ? new Date(blog.createdAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : null}
                      {readingTime && <span> · {readingTime}</span>}
                    </span>
                  </div>
                </div>
              )}
            </header>

            <div
              className="prose prose-zinc prose-lg mt-7 max-w-none text-[15px] text-black leading-relaxed sm:text-base"
              dangerouslySetInnerHTML={{ __html: blog.contentHTML || "" }}
            />

            {/* Reader interactions */}
            <section className="mt-10 border-t border-zinc-200 pt-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-600">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={likeBusy}
                    onClick={async () => {
                      if (!blog?._id) return;
                      try {
                        setLikeBusy(true);
                        await recordLike(blog._id);
                      } finally {
                        setLikeBusy(false);
                      }
                    }}
                    className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium hover:bg-zinc-50 disabled:opacity-60"
                  >
                    {likeBusy ? "Liking…" : "Like"}
                  </button>
                  <span className="hidden sm:inline text-[11px] text-zinc-500">
                    Likes and comments help power your Reports & Analytics.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium hover:bg-zinc-50"
                >
                  Back to top
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <p className="font-medium text-zinc-800">Comments</p>
                <div className="max-h-40 overflow-y-auto space-y-1.5">
                  {comments.length === 0 && (
                    <p className="text-[11px] text-zinc-500">No comments yet. Be the first to leave feedback.</p>
                  )}
                  {comments.map((c) => (
                    <div key={c.id} className="rounded-md border border-zinc-200 bg-white px-2 py-1">
                      <p className="text-[11px] text-zinc-800 whitespace-pre-wrap">{c.text}</p>
                      <p className="mt-0.5 text-[10px] text-zinc-400">{new Date(c.ts).toLocaleTimeString()}</p>
                    </div>
                  ))}
                </div>
                <form
                  className="mt-1 flex items-center gap-2"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const txt = commentText.trim();
                    if (!txt || !blog?._id) return;
                    const entry = { id: Date.now(), text: txt, ts: Date.now() };
                    setComments((prev) => [entry, ...prev]);
                    setCommentText("");
                    try {
                      await recordComment(blog._id, txt);
                    } catch {}
                  }}
                >
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment about this article…"
                    className="flex-1 rounded-md border border-zinc-300 bg-white px-2 py-1 text-[11px] text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="inline-flex items-center rounded-md bg-zinc-900 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-black disabled:opacity-60"
                  >
                    Post
                  </button>
                </form>
              </div>

              <footer className="flex flex-wrap items-center justify-between gap-4 pt-3 text-xs text-zinc-600">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] font-medium text-zinc-700">
                    Finished reading
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href="/dashboard"
                    className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-[11px] font-medium hover:bg-zinc-50"
                  >
                    Go to dashboard
                  </a>
                  <a
                    href="/dashboard/write"
                    className="rounded-full bg-zinc-900 px-3 py-1 text-[11px] font-medium text-white hover:bg-zinc-800"
                  >
                    Open editor
                  </a>
                </div>
              </footer>
            </section>
          </article>
        )}
      </main>
    </div>
  );
}
