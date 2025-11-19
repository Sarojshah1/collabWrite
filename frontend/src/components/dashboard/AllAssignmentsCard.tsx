"use client";

import React from "react";
import Link from "next/link";
import type { Assignment } from "@/services/assignmentService";

type Props = {
  assignments: Assignment[] | null;
  loading: boolean;
  error: string | null;
};

export default function AllAssignmentsCard({ assignments, loading, error }: Props) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-amber-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-zinc-900">All assignments</h2>
        <span className="text-xs text-zinc-500">
          {assignments ? `${assignments.length} total` : loading ? "…" : "0"}
        </span>
      </div>
      {loading && <p className="mt-2 text-sm text-zinc-500">Loading assignments…</p>}
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
      {!loading && !error && assignments && assignments.length === 0 && (
        <p className="mt-2 text-sm text-zinc-500">
          You don&apos;t have any assignments yet. Use "Create assignment" to start one.
        </p>
      )}
      {!loading && !error && assignments && assignments.length > 0 && (
        <ul className="mt-3 space-y-2 text-sm">
          {assignments.map((a) => (
            <li key={a._id}>
              <Link
                href={typeof a.blog === "object" && a.blog ? `/dashboard/write?blogId=${a.blog._id}` : "/dashboard/write"}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 transition hover:border-zinc-300 hover:bg-zinc-100"
              >
                <div className="min-w-0 text-left">
                  <p className="truncate font-medium text-zinc-900">{a.title}</p>
                  {typeof a.blog === "object" && a.blog && (
                    <>
                      <p className="truncate text-xs text-zinc-500">{a.blog.title}</p>
                      <span
                        className="mt-0.5 inline-flex text-[11px] font-medium text-zinc-600 underline-offset-2 hover:underline"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          window.location.href = `/blog/${a.blog._id}`;
                        }}
                      >
                        Open blog
                      </span>
                    </>
                  )}
                </div>
                <div className="text-right">
                  {a.dueDate && (
                    <p className="text-[11px] text-zinc-600">
                      Due {new Date(a.dueDate).toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-[10px] text-zinc-500">
                    Created {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
