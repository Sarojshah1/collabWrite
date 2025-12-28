"use client";

import { useEffect, useMemo, useState } from "react";
import { getAuthorAnalyticsSummary, getAuthorTimeline, type AnalyticsSummaryItem, type AuthorDayPoint } from "@/services/analyticsService";
import Sidebar from "@/components/common/Sidebar";

const LABELS: Record<string, string> = {
  view: "Total Views",
  like: "Total Likes",
  bookmark: "Bookmarks",
  comment: "Comments",
  share: "Shares",
};

const DESCRIPTIONS: Record<string, string> = {
  view: "Number of times your documents were viewed.",
  like: "Appreciation from readers across all documents.",
  bookmark: "Documents saved for later by readers.",
  comment: "Engagement through comments on assignments and blogs.",
  share: "Documents that were shared with others.",
};

export default function ReportsPage() {
  const [items, setItems] = useState<AnalyticsSummaryItem[]>([]);
  const [timeline, setTimeline] = useState<AuthorDayPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState<number>(30);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [summary, series] = await Promise.all([getAuthorAnalyticsSummary(days), getAuthorTimeline(days)]);
        if (!mounted) return;
        setItems(summary);
        setTimeline(series);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message || "Failed to load analytics");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [days, reloadKey]);

  useEffect(() => {
    const onFocus = () => setReloadKey((k) => k + 1);
    const onVisibility = () => {
      if (document.visibilityState === "visible") setReloadKey((k) => k + 1);
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const merged: AnalyticsSummaryItem[] = useMemo(
    () => ["view", "like", "comment", "bookmark"].map((t) => ({ type: t, count: items.find((i) => i.type === t)?.count || 0 })),
    [items]
  );

  const totals = useMemo(() => {
    const totalViews = merged.find((m) => m.type === "view")?.count || 0;
    const totalLikes = merged.find((m) => m.type === "like")?.count || 0;
    const totalComments = merged.find((m) => m.type === "comment")?.count || 0;
    const totalBookmarks = merged.find((m) => m.type === "bookmark")?.count || 0;
    return { totalViews, totalLikes, totalComments, totalBookmarks };
  }, [merged]);

  const barMax = Math.max(totals.totalViews, totals.totalLikes, totals.totalComments, totals.totalBookmarks) || 1;

  const bars: { key: string; label: string; value: number }[] = [
    { key: "view", label: LABELS.view, value: totals.totalViews },
    { key: "like", label: LABELS.like, value: totals.totalLikes },
    { key: "comment", label: LABELS.comment, value: totals.totalComments },
    { key: "bookmark", label: LABELS.bookmark, value: totals.totalBookmarks },
  ];

  const likeRate = totals.totalViews > 0 ? Math.round((totals.totalLikes / totals.totalViews) * 100) : 0;

  const daysLabel = days === 7 ? "Last 7 days" : days === 90 ? "Last 90 days" : "Last 30 days";

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="hidden lg:block fixed inset-y-0 left-0 w-64 border-r border-zinc-200 bg-white">
        <div className="h-full overflow-y-auto px-4 py-5">
          <Sidebar />
        </div>
      </div>

      <div className="">
        <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[12px] text-zinc-500">
                  <span className="font-medium text-zinc-700">Home</span>
                  <span className="px-2">›</span>
                  <span className="text-zinc-700">Creators</span>
                  <span className="px-2">›</span>
                  <span className="truncate">Reports</span>
                </div>
                <h1 className="mt-1 truncate text-[20px] font-semibold text-zinc-900">Reports & Analytics</h1>
                <p className="mt-1 text-[12px] text-zinc-600">
                  High-level overview of how your content and assignments are performing over the last {days} days.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="h-9 rounded-full border border-zinc-200 bg-white px-3 pr-8 text-[13px] font-medium text-zinc-700 shadow-sm outline-none hover:bg-zinc-50"
                  >
                    <option value={7}>Last 7 days</option>
                    <option value={30}>Last 30 days</option>
                    <option value={90}>Last 90 days</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setReloadKey((k) => k + 1)}
                  className="h-9 rounded-full border border-zinc-200 bg-white px-4 text-[13px] font-medium text-zinc-700 shadow-sm hover:bg-zinc-50"
                >
                  Refresh
                </button>
                <span className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-[12px] font-semibold text-zinc-700">N</span>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
          {loading ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">Loading analytics…</div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">{error}</div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { type: "view", count: totals.totalViews },
                  { type: "like", count: totals.totalLikes },
                  { type: "comment", count: totals.totalComments },
                  { type: "bookmark", count: totals.totalBookmarks },
                ].map((item) => (
                  <article key={item.type} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <div>
                      <h2 className="text-sm font-semibold text-zinc-900">{LABELS[item.type] || item.type}</h2>
                      <p className="mt-1 text-[11px] text-zinc-600">{DESCRIPTIONS[item.type] || ""}</p>
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <p className="text-3xl font-semibold text-zinc-900">{item.count}</p>
                      <span className="text-[11px] text-zinc-500">{daysLabel}</span>
                    </div>
                  </article>
                ))}
              </div>

              <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <header className="mb-4">
                  <h2 className="text-sm font-semibold text-zinc-900">Engagement Breakdown</h2>
                  <p className="mt-1 text-[11px] text-zinc-600">Views and engagement events for your published blogs.</p>
                </header>

                {bars.every((b) => b.value === 0) ? (
                  <p className="text-[11px] text-zinc-500">No engagement data recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {bars.map((b) => {
                      const width = `${Math.max(6, Math.round((b.value / barMax) * 100))}%`;
                      return (
                        <div key={b.key} className="space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-zinc-600">
                            <span>{b.label}</span>
                            <span className="tabular-nums text-zinc-800">{b.value}</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                            <div className="h-full rounded-full bg-zinc-800/70" style={{ width }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <header className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-sm font-semibold text-zinc-900">Views & Likes Conversion</h2>
                      <p className="mt-1 text-[11px] text-zinc-600">Based on interactions over {days} days.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-zinc-900">{likeRate}%</p>
                      <p className="text-[10px] text-zinc-500">like rate</p>
                    </div>
                  </header>

                  {totals.totalViews === 0 ? (
                    <p className="text-[11px] text-zinc-500">No views recorded yet for your blogs.</p>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <div className="mb-1 flex items-center justify-between text-[11px] text-zinc-600">
                          <span>Total Views</span>
                          <span className="tabular-nums text-zinc-800">{totals.totalViews}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                          <div className="h-full w-full rounded-full bg-zinc-800/70" />
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 flex items-center justify-between text-[11px] text-zinc-600">
                          <span>Total Likes</span>
                          <span className="tabular-nums text-zinc-800">{totals.totalLikes}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-zinc-800"
                            style={{
                              width: `${Math.max(
                                4,
                                Math.min(100, Math.round((totals.totalLikes / Math.max(1, totals.totalViews)) * 100))
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 flex items-center justify-between text-[11px] text-zinc-600">
                          <span>Bookmarks</span>
                          <span className="tabular-nums text-zinc-800">{totals.totalBookmarks}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-zinc-800/60"
                            style={{ width: `${Math.max(4, Math.round((totals.totalBookmarks / barMax) * 100))}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <header className="mb-4">
                    <h2 className="text-sm font-semibold text-zinc-900">Views & Likes over time</h2>
                    <p className="mt-1 text-[11px] text-zinc-600">Track your performance trends over {days} days.</p>
                  </header>

                  {timeline.length === 0 ? (
                    <p className="text-[11px] text-zinc-500">No timeline data recorded yet.</p>
                  ) : (
                    <div className="w-full overflow-x-auto">
                      <svg viewBox="0 0 100 44" className="w-full h-36">
                        {(() => {
                          const points = timeline;
                          const maxY = Math.max(...points.map((p) => Math.max(p.views, p.likes)), 1);
                          const stepX = points.length > 1 ? 100 / (points.length - 1) : 0;

                          const toX = (i: number) => (points.length === 1 ? 50 : i * stepX);
                          const toY = (v: number) => 36 - (v / maxY) * 28;

                          const viewsPath = points
                            .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(p.views)}`)
                            .join(" ");
                          const likesPath = points
                            .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(p.likes)}`)
                            .join(" ");

                          return (
                            <>
                              <line x1="0" y1="36" x2="100" y2="36" stroke="#e5e7eb" strokeWidth="0.6" />
                              <path d={viewsPath} fill="none" stroke="#111827" strokeWidth="1.6" />
                              <path d={likesPath} fill="none" stroke="#6b7280" strokeWidth="1.6" />
                              <circle cx="6" cy="40" r="1.5" fill="#111827" />
                              <text x="9" y="41" fontSize="3" fill="#6b7280">Total Views</text>
                              <circle cx="28" cy="40" r="1.5" fill="#6b7280" />
                              <text x="31" y="41" fontSize="3" fill="#6b7280">Total Likes</text>
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                  )}
                </section>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
