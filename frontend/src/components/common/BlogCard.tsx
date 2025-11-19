"use client";
import Link from "next/link";

// A reusable blog/article card for the feed (Medium-like)
// Replace props with your actual data later when wiring API

export type BlogCardProps = {
  title: string;
  excerpt: string;
  authorName: string;
  authorAvatar?: string;
  readTime?: string;
  tags?: string[];
  publishedAt?: string | Date; // ISO string or Date
  category?: string;
  coverImage?: string; // optional thumbnail on the right
  likesCount?: number;
  commentsCount?: number;
  href?: string; // link to blog detail
};

function formatDate(input?: string | Date) {
  if (!input) return undefined;
  try {
    const d = typeof input === "string" ? new Date(input) : input;
    if (Number.isNaN(d.getTime())) return undefined;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return undefined;
  }
}

export default function BlogCard({
  title,
  excerpt,
  authorName,
  authorAvatar = "/logo.svg",
  readTime = "3 min read",
  tags = ["writing", "productivity"],
  publishedAt,
  category,
  coverImage,
  likesCount = 0,
  commentsCount = 0,
  href,
}: BlogCardProps) {
  const dateLabel = formatDate(publishedAt);
  const hasThumb = Boolean(coverImage);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      {/* Full-card clickable overlay if href supplied */}
      {href && (
        <Link href={href} className="absolute inset-0 z-0" aria-label={title} />
      )}
      <div className={hasThumb ? "grid grid-cols-[1fr_104px] gap-5" : "grid grid-cols-1"}>
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span className="inline-flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-zinc-100 ring-1 ring-inset ring-zinc-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={authorAvatar} alt={authorName} className="h-full w-full object-cover" />
            </span>
            <span className="font-medium text-zinc-700">{authorName}</span>
            {dateLabel && (
              <>
                <span>·</span>
                <time aria-label="Published date">{dateLabel}</time>
              </>
            )}
            <span>·</span>
            <span>{readTime}</span>
            {category && (
              <span className="ml-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-700 ring-1 ring-inset ring-zinc-200">
                {category}
              </span>
            )}
          </div>

          <h3 className="mt-3 line-clamp-2 text-lg font-semibold text-zinc-900 group-hover:underline">
            {title}
          </h3>
          <p className="mt-2 text-sm text-zinc-600 line-clamp-2">{excerpt}</p>

          <div className="mt-4 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-600">
              {tags?.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-zinc-100 px-2 py-0.5 ring-1 ring-inset ring-zinc-200"
                >
                  #{t}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-500">
              <span className="inline-flex items-center gap-1" aria-label="Likes">
                <span>❤</span>
                <span>{likesCount}</span>
              </span>
              <span className="inline-flex items-center gap-1" aria-label="Comments">
                <span>💬</span>
                <span>{commentsCount}</span>
              </span>
            </div>
          </div>
        </div>

        {hasThumb && (
          <div className="relative z-10 h-24 w-26 overflow-hidden rounded-md bg-zinc-100 ring-1 ring-inset ring-zinc-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverImage} alt="cover" className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105" />
          </div>
        )}
      </div>
    </article>
  );
}
