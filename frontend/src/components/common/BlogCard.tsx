"use client";

import Link from "next/link";
import { useState } from "react";

export type BlogCardProps = {
  title: string;
  excerpt?: string;
  authorName: string;
  authorAvatar?: string;
  tags?: string[];
  publishedAt?: string | Date;
  updatedAt?: string | Date;
  status?: "Published" | "Needs Review" | "Draft";
  progress?: number;
  collaborators?: Array<{ name: string; avatar?: string }>;
  likesCount?: number;
  commentsCount?: number;
  href?: string;
  id?: string;
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
};

// Fallback Constants
const FALLBACK_AVATAR =
  "https://ui-avatars.com/api/?name=User&background=random"; // Or a local path like "/default-avatar.png"

function formatDate(input?: string | Date) {
  if (!input) return undefined;
  try {
    const d = typeof input === "string" ? new Date(input) : input;
    if (Number.isNaN(d.getTime())) return undefined;
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return undefined;
  }
}

function formatRelative(input?: string | Date) {
  if (!input) return undefined;
  try {
    const d = typeof input === "string" ? new Date(input) : input;
    if (Number.isNaN(d.getTime())) return undefined;
    const diffMs = Date.now() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24)
      return `${diffHours} hr${diffHours === 1 ? "" : "s"} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 5)
      return `${diffWeeks} week${diffWeeks === 1 ? "" : "s"} ago`;
    return formatDate(d);
  } catch {
    return undefined;
  }
}

export default function BlogCard({
  title,
  excerpt,
  authorName,
  authorAvatar,
  tags = [],
  publishedAt,
  updatedAt,
  status = "Published",
  progress,
  collaborators = [],
  likesCount = 0,
  commentsCount = 0,
  href,
  id,
  isBookmarked,
  onToggleBookmark,
}: BlogCardProps) {
  const [avatarSrc, setAvatarSrc] = useState(authorAvatar || FALLBACK_AVATAR);
  const relativeLabel = formatRelative(publishedAt);
  const updatedLabel = formatRelative(updatedAt);
  const safeProgress =
    typeof progress === "number"
      ? Math.min(100, Math.max(0, progress))
      : undefined;

  const statusClass =
    status === "Published"
      ? "bg-zinc-100 text-zinc-700"
      : status === "Needs Review"
      ? "bg-zinc-100 text-zinc-700"
      : "bg-zinc-100 text-zinc-700";

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      {href && (
        <Link href={href} className="absolute inset-0 z-0" aria-label={title} />
      )}
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              <span className="inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-zinc-100 ring-1 ring-inset ring-zinc-200">
                <img
                  src={avatarSrc}
                  alt={authorName}
                  className="h-full w-full object-cover"
                  onError={() => setAvatarSrc(FALLBACK_AVATAR)}
                />
              </span>
              <span className="font-medium text-zinc-700">{authorName}</span>
              {relativeLabel && (
                <>
                  <span>·</span>
                  <time aria-label="Created date">{relativeLabel}</time>
                </>
              )}
            </div>
          </div>

          <span
            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium ring-1 ring-inset ring-zinc-200 ${statusClass}`}
          >
            {status}
          </span>
        </div>

        <div className="absolute right-4 top-4 z-20">
          {onToggleBookmark && id && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onToggleBookmark(id);
              }}
              className="rounded-full bg-white/80 p-2 text-zinc-400 hover:text-yellow-500 hover:bg-white transition"
              title={isBookmarked ? "Remove bookmark" : "Bookmark"}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={isBookmarked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={isBookmarked ? "text-yellow-500" : ""}
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </button>
          )}
        </div>

        <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-zinc-900 group-hover:underline">
          {title}
        </h3>

        {(updatedLabel || excerpt) && (
          <p className="mt-1 text-sm text-zinc-600">
            {updatedLabel ? (
              <span>
                Last edited by {authorName} · {updatedLabel}
              </span>
            ) : (
              <span className="line-clamp-2">{excerpt}</span>
            )}
          </p>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {tags?.slice(0, 2).map((t) => (
            <span
              key={t}
              className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] text-zinc-600 ring-1 ring-inset ring-zinc-200"
            >
              {t}
            </span>
          ))}
          {tags && tags.length > 2 && (
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] text-zinc-600 ring-1 ring-inset ring-zinc-200">
              +{tags.length - 2}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 ring-1 ring-inset ring-zinc-200">
            <div
              className="h-full rounded-full bg-zinc-700"
              style={{ width: `${safeProgress ?? 55}%` }}
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <div className="flex -space-x-2">
              {collaborators.slice(0, 3).map((c) => (
                <span
                  key={c.name}
                  className="inline-flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-white ring-2 ring-white"
                  title={c.name}
                >
                  <img
                    src={c.avatar || FALLBACK_AVATAR}
                    alt={c.name}
                    className="h-full w-full object-cover"
                  />
                </span>
              ))}
            </div>

            <span
              className="inline-flex items-center gap-1"
              aria-label="Comments"
            >
              <span className="font-medium text-zinc-700">{commentsCount}</span>
              <span className="text-zinc-400">comments</span>
            </span>
            <span className="inline-flex items-center gap-1" aria-label="Likes">
              <span className="font-medium text-zinc-700">{likesCount}</span>
              <span className="text-zinc-400">likes</span>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
