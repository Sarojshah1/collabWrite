"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { MergeConflict } from "@/services/mergeConflictService";
import { listConflictsForBlog, resolveConflictWithAI, acceptMergedConflict } from "@/services/mergeConflictService";

export default function MergeResolverPage() {
  const searchParams = useSearchParams();
  const blogId = searchParams.get("blogId");

  const [conflicts, setConflicts] = useState<MergeConflict[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!blogId) return;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await listConflictsForBlog(blogId);
        setConflicts(data);
      } catch (err: any) {
        setError(err?.message || "Failed to load conflicts");
      } finally {
        setLoading(false);
      }
    })();
  }, [blogId]);

  const handleResolveAI = async (id: string) => {
    try {
      setBusyId(id);
      const updated = await resolveConflictWithAI(id);
      setConflicts((prev) => prev.map((c) => (c._id === id ? updated : c)));
    } catch (err: any) {
      setError(err?.message || "Failed to resolve with AI");
    } finally {
      setBusyId(null);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      setBusyId(id);
      const updated = await acceptMergedConflict(id);
      setConflicts((prev) => prev.map((c) => (c._id === id ? updated : c)));
    } catch (err: any) {
      setError(err?.message || "Failed to accept merged version");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900">AI Merge Resolver</h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-600">
            Review conflicts between versions, ask AI to merge them, and accept the best version back into your doc.
          </p>
        </div>
        {blogId && (
          <div className="rounded-full bg-zinc-100 px-3 py-1 text-[11px] text-zinc-700">
            Blog: <span className="font-medium">{blogId}</span>
          </div>
        )}
      </header>

      {!blogId && (
        <p className="text-sm text-zinc-600">
          Pass a <code className="rounded bg-zinc-100 px-1">blogId</code> query parameter (e.g. <code>?blogId=&lt;id&gt;</code>) to see conflicts
          for a document.
        </p>
      )}

      {blogId && (
        <>
          {loading && <p className="text-sm text-zinc-600">Loading conflicts…</p>}
          {error && !loading && <p className="text-sm text-rose-600 mb-3">{error}</p>}
          {!loading && !error && conflicts.length === 0 && (
            <p className="text-sm text-zinc-600">No conflicts found for this document.</p>
          )}

          <div className="mt-4 space-y-4">
            {conflicts.map((conflict) => (
              <article
                key={conflict._id}
                className="rounded-2xl border border-zinc-200 bg-white/90 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs text-zinc-600">
                    <span className="font-medium text-zinc-900">Segment:</span> {conflict.segmentId}
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      conflict.status === "resolved"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : conflict.status === "awaiting_approval"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : conflict.status === "pending_ai"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                    }`}
                  >
                    {conflict.status}
                  </span>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-3 text-[11px] sm:text-xs text-zinc-800">
                  <div className="space-y-1.5">
                    <p className="font-medium text-zinc-900">Version A</p>
                    <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 leading-snug whitespace-pre-wrap">
                      {conflict.versionA.text}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="font-medium text-zinc-900">Version B</p>
                    <p className="rounded-lg border border-zinc-200 bg-zinc-50 p-2 leading-snug whitespace-pre-wrap">
                      {conflict.versionB.text}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-zinc-900">AI merged version</p>
                      <button
                        type="button"
                        onClick={() => handleResolveAI(conflict._id)}
                        disabled={busyId === conflict._id}
                        className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2 py-1 text-[10px] font-medium text-zinc-800 hover:bg-zinc-100 disabled:opacity-60"
                      >
                        {busyId === conflict._id ? "Resolving…" : "Run AI merge"}
                      </button>
                    </div>
                    {conflict.mergedText ? (
                      <p className="rounded-lg border border-zinc-200 bg-blue-50/60 p-2 leading-snug whitespace-pre-wrap">
                        {conflict.mergedText}
                      </p>
                    ) : (
                      <p className="text-[11px] text-zinc-500">No AI merge yet. Run AI merge to generate one.</p>
                    )}
                    {conflict.rationale && conflict.rationale.length > 0 && (
                      <div className="mt-2 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-2 text-[11px] text-zinc-700">
                        <p className="font-medium text-zinc-900 mb-1">Why this merge?</p>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {conflict.rationale.map((r) => (
                            <li key={r}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleAccept(conflict._id)}
                    disabled={busyId === conflict._id || !conflict.mergedText}
                    className="inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-[11px] font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                  >
                    Accept merged version
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
