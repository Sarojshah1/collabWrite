"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import type { Assignment } from "@/services/assignmentService";

type Props = {
  assignments: Assignment[] | null;
  loading: boolean;
  error: string | null;
};

export default function WorkingAssignmentsCard({ assignments, loading, error }: Props) {
  const workingAssignments = useMemo(() => {
    if (!assignments || assignments.length === 0) return [] as Assignment[];
    const sorted = [...assignments].sort((a, b) => {
      const aTime = new Date(a.updatedAt || a.createdAt).getTime();
      const bTime = new Date(b.updatedAt || b.createdAt).getTime();
      return bTime - aTime;
    });
    return sorted.slice(0, 3);
  }, [assignments]);

  const hasAssignments = workingAssignments.length > 0;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white/80 p-4 shadow-sm shadow-zinc-100">
      {/* subtle background accent */}
      <div className="pointer-events-none absolute inset-y-0 right-[-40%] w-2/3 bg-linear-to-l from-amber-50 via-transparent to-transparent" />

      <div className="relative flex items-start justify-between gap-3 pb-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-zinc-900">Working on</h2>
          <p className="mt-1 text-[11px] text-zinc-500">
            {hasAssignments
              ? `Your ${workingAssignments.length} most recent assignments`
              : "Stay on top of what you\'re writing next"}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 text-[11px]">
          {loading && (
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-1 text-zinc-600">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400" />
              Loading
            </span>
          )}
          {!loading && !error && hasAssignments && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          )}
        </div>
      </div>

      {error && (
        <p className="relative mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </p>
      )}

      {!loading && !error && !hasAssignments && (
        <div className="relative mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/70 px-4 py-6 text-center">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
            <span className="text-lg text-amber-500">+</span>
          </div>
          <p className="text-sm font-medium text-zinc-800">No active assignments yet</p>
          <p className="mt-1 text-xs text-zinc-500">
            Create a new assignment to have it pinned here for quick access.
          </p>
        </div>
      )}

      {!loading && !error && hasAssignments && (
        <ul className="relative mt-3 space-y-2 text-sm">
          {workingAssignments.map((a) => {
            const blogLink =
              typeof a.blog === "object" && a.blog
                ? `/dashboard/write?blogId=${a.blog._id}`
                : "/dashboard/write";

            return (
              <li key={a._id}>
                <Link
                  href={blogLink}
                  className="group flex items-stretch justify-between gap-3 rounded-xl border border-zinc-200 bg-linear-to-r from-zinc-50 via-white to-zinc-50 px-3 py-2.5 text-left transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-900 group-hover:text-amber-700">
                      {a.title}
                    </p>
                    {typeof a.blog === "object" && a.blog && (
                      <p className="mt-0.5 truncate text-xs text-zinc-500">{a.blog.title}</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end justify-center text-right">
                    {a.dueDate && (
                      <p className="text-[11px] font-medium text-zinc-700">
                        Due {new Date(a.dueDate).toLocaleDateString()}
                      </p>
                    )}
                    <p className="mt-0.5 text-[10px] text-zinc-500">
                      Updated {new Date(a.updatedAt || a.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

