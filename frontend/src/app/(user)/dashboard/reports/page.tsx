"use client";

import { useEffect, useState } from "react";
import { getAuthorAnalyticsSummary, getAuthorTimeline, type AnalyticsSummaryItem, type AuthorDayPoint } from "@/services/analyticsService";

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

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [summary, series] = await Promise.all([
          getAuthorAnalyticsSummary(30),
          getAuthorTimeline(30),
        ]);
        setItems(summary);
        setTimeline(series);
      } catch (err: any) {
        setError(err?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const merged: AnalyticsSummaryItem[] = [
    "view",
    "like",
    "bookmark",
    "comment",
    "share",
  ].map((t) => ({ type: t, count: items.find((i) => i.type === t)?.count || 0 }));

  const totalViews = merged.find((m) => m.type === "view")?.count || 0;
  const totalLikes = merged.find((m) => m.type === "like")?.count || 0;
  const totalBookmarks = merged.find((m) => m.type === "bookmark")?.count || 0;
  const barMax = Math.max(totalViews, totalLikes, totalBookmarks) || 1;

  const bars: { key: string; label: string; value: number }[] = [
    { key: "view", label: LABELS.view, value: totalViews },
    { key: "like", label: LABELS.like, value: totalLikes },
    { key: "bookmark", label: LABELS.bookmark, value: totalBookmarks },
  ];

//   const totalViews = merged.find((m) => m.type === "view")?.count || 0;
//   const totalLikes = merged.find((m) => m.type === "like")?.count || 0;
  const likeRate = totalViews > 0 ? Math.round((totalLikes / totalViews) * 100) : 0;

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-zinc-900">Reports & Analytics</h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-600">
            High-level overview of how your content and assignments are performing over the last 30 days.
          </p>
        </div>
      </header>

      {loading && <p className="text-sm text-zinc-600">Loading analytics…</p>}
      {error && !loading && <p className="text-sm text-rose-600 mb-3">{error}</p>}

      {!loading && !error && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {merged.map((item) => (
              <article
                key={item.type}
                className="rounded-2xl border border-zinc-200 bg-white/90 p-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900">{LABELS[item.type] || item.type}</h2>
                  <p className="mt-1 text-[11px] text-zinc-600">{DESCRIPTIONS[item.type] || ""}</p>
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <p className="text-3xl font-semibold text-zinc-900">{item.count}</p>
                  <span className="text-[11px] text-zinc-500">last 30 days</span>
                </div>
              </article>
            ))}
          </div>

          <section className="mt-8 rounded-2xl border border-zinc-200 bg-white/90 p-4 shadow-sm text-xs">
            <header className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">Engagement breakdown</h2>
                <p className="mt-1 text-[11px] text-zinc-600">
                  Views, likes, and bookmarks across all of your published blogs.
                </p>
              </div>
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
                        <div
                          className="h-full rounded-full bg-linear-to-r from-blue-500 via-indigo-500 to-violet-500"
                          style={{ width }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="mt-8 rounded-2xl border border-zinc-200 bg-white/90 p-4 shadow-sm text-xs">
            <header className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">Views → likes conversion</h2>
                <p className="mt-1 text-[11px] text-zinc-600">
                  Based on interactions on your published blogs in the last 30 days.
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold text-zinc-900">{likeRate}%</p>
                <p className="text-[10px] text-zinc-500">like rate</p>
              </div>
            </header>

            {totalViews === 0 ? (
              <p className="text-[11px] text-zinc-500">No views recorded yet for your blogs.</p>
            ) : (
              <div className="space-y-3">
                <div>
                  <div className="mb-1 flex items-center justify-between text-[11px] text-zinc-600">
                    <span>Total views</span>
                    <span className="tabular-nums text-zinc-800">{totalViews}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                    <div className="h-full w-full rounded-full bg-linear-to-r from-blue-500 via-indigo-500 to-violet-500" />
                  </div>
                </div>

                <div>
                  <div className="mb-1 flex items-center justify-between text-[11px] text-zinc-600">
                    <span>Total likes</span>
                    <span className="tabular-nums text-zinc-800">{totalLikes}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-emerald-500 to-lime-500"
                      style={{ width: `${Math.max(4, Math.min(100, Math.round((totalLikes / totalViews) * 100))) || 4}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          <section className="mt-8 rounded-2xl border border-zinc-200 bg-white/90 p-4 shadow-sm text-xs">
            <header className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">Views & likes over time</h2>
                <p className="mt-1 text-[11px] text-zinc-600">
                  Daily activity on your published blogs for the last 30 days.
                </p>
              </div>
            </header>

            {timeline.length === 0 ? (
              <p className="text-[11px] text-zinc-500">No timeline data recorded yet.</p>
            ) : (
              <div className="w-full overflow-x-auto">
                <svg viewBox="0 0 100 40" className="w-full h-32">
                  {(() => {
                    const points = timeline;
                    const maxY = Math.max(...points.map((p) => Math.max(p.views, p.likes)), 1);
                    const stepX = points.length > 1 ? 100 / (points.length - 1) : 0;

                    const toX = (i: number) => (points.length === 1 ? 50 : i * stepX);
                    const toY = (v: number) => 35 - (v / maxY) * 30;

                    const viewsPath = points
                      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(p.views)}`)
                      .join(' ');
                    const likesPath = points
                      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i)} ${toY(p.likes)}`)
                      .join(' ');

                    return (
                      <>
                        <line x1="0" y1="35" x2="100" y2="35" stroke="#e5e7eb" strokeWidth="0.5" />
                        <path d={viewsPath} fill="none" stroke="#6366f1" strokeWidth="1.5" />
                        <path d={likesPath} fill="none" stroke="#22c55e" strokeWidth="1.5" />
                      </>
                    );
                  })()}
                </svg>
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}
