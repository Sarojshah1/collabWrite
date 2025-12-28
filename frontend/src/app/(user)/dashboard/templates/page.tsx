"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getTemplate, instantiateTemplate, listTemplates, type TemplateListItem } from "@/services/templateService";

type CategoryKey = "All" | "Blogging" | "Social Media" | "Business" | "Education" | "Other";

type SortKey = "popular" | "newest" | "name";

function mapTemplateToCategory(t: TemplateListItem): CategoryKey {
  switch (t.type) {
    case "blog":
    case "listicle":
      return "Blogging";
    case "tutorial":
      return "Education";
    case "book_chapter":
    case "book_index":
      return "Business";
    default:
      return "Other";
  }
}

function sortTemplates(list: TemplateListItem[], sort: SortKey) {
  const copy = [...list];
  if (sort === "name") return copy.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  if (sort === "newest") {
    return copy.sort((a, b) => {
      const ad = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const bd = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return bd - ad;
    });
  }
  return copy.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
}

export default function TemplatesPage() {
  const router = useRouter();

  const [templates, setTemplates] = useState<TemplateListItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryKey>("All");
  const [sort, setSort] = useState<SortKey>("popular");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>("");
  const [previewHtml, setPreviewHtml] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const items = await listTemplates();
        if (mounted) setTemplates(items);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load templates");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const list = templates || [];
    const q = search.trim().toLowerCase();
    const byCategory = category === "All" ? list : list.filter((t) => mapTemplateToCategory(t) === category);
    const bySearch = !q
      ? byCategory
      : byCategory.filter((t) => {
          const name = (t.name || "").toLowerCase();
          const desc = (t.description || "").toLowerCase();
          return name.includes(q) || desc.includes(q);
        });
    return sortTemplates(bySearch, sort);
  }, [templates, search, category, sort]);

  const grouped = useMemo(() => {
    const groups: Record<CategoryKey, TemplateListItem[]> = {
      All: [],
      Blogging: [],
      "Social Media": [],
      Business: [],
      Education: [],
      Other: [],
    };
    for (const t of filtered) {
      groups[mapTemplateToCategory(t)].push(t);
    }
    return groups;
  }, [filtered]);

  async function onPreview(slug: string) {
    try {
      setPreviewOpen(true);
      setPreviewBusy(true);
      setPreviewError(null);
      const tpl = await getTemplate(slug);
      setPreviewTitle(tpl.name);
      const md = tpl.body || "";
      const html = md
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .split("\n")
        .map((line) => (line.trim() ? `<p>${line}</p>` : ""))
        .join("\n");
      setPreviewHtml(html);
    } catch (e: any) {
      setPreviewError(e?.message || "Failed to load preview");
    } finally {
      setPreviewBusy(false);
    }
  }

  async function onUse(t: TemplateListItem) {
    try {
      const blog = await instantiateTemplate({
        slug: t.slug,
        title: t.name,
        status: "draft",
        category: mapTemplateToCategory(t),
        tags: Array.isArray(t.tags) ? t.tags : [],
      });
      router.push(`/dashboard/write?blogId=${blog._id}`);
    } catch (e: any) {
      alert(e?.message || "Failed to use template");
    }
  }

  const leftCategories: CategoryKey[] = ["Blogging", "Social Media", "Education", "Other"];
  const rightCategories: CategoryKey[] = ["Business"];

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-8">
      <header className="mb-6">
        <div className="mb-4 flex items-center gap-2 text-xs text-zinc-500">
          <span>Home</span>
          <span>›</span>
          <span className="text-zinc-700">Templates</span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-zinc-900">Templates</h1>
          </div>

          <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[360px]">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search templates..."
                className="w-full rounded-full border border-zinc-200 bg-white px-4 py-2.5 pr-10 text-sm text-zinc-800 shadow-sm outline-none transition focus:border-zinc-300"
              />
              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-zinc-400">
                <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9 3.5A5.5 5.5 0 1 1 3.5 9 5.5 5.5 0 0 1 9 3.5Zm0-1.5a7 7 0 1 0 4.38 12.46l2.83 2.83a1 1 0 0 0 1.42-1.42l-2.83-2.83A7 7 0 0 0 9 2Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50"
            >
              <span className="text-zinc-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                </svg>
              </span>
              Filter
            </button>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-200/70"
            >
              New Template
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-[220px]">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-10 text-sm text-zinc-700 shadow-sm outline-none"
            />
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-400">
              <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9 3.5A5.5 5.5 0 1 1 3.5 9 5.5 5.5 0 0 1 9 3.5Zm0-1.5a7 7 0 1 0 4.38 12.46l2.83 2.83a1 1 0 0 0 1.42-1.42l-2.83-2.83A7 7 0 0 0 9 2Z"
                  fill="currentColor"
                />
              </svg>
            </span>
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryKey)}
            className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 shadow-sm"
          >
            <option value="All">All Categories</option>
            <option value="Blogging">Blogging</option>
            <option value="Social Media">Social Media</option>
            <option value="Business">Business</option>
            <option value="Education">Education</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 shadow-sm"
          >
            <option value="popular">Most Popular</option>
            <option value="newest">Newest</option>
            <option value="name">Name</option>
          </select>
        </div>
      </header>

      {loading && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600 shadow-sm">Loading templates...</div>
      )}

      {error && !loading && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{error}</div>
      )}

      {!loading && !error && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
          <div className="space-y-6">
            {leftCategories.map((cat) => {
              const list = grouped[cat];
              if (!list || list.length === 0) return null;
              return (
                <section key={cat} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-zinc-900">{cat}</h2>
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {list.map((t) => (
                      <div key={t.slug} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <path d="M14 2v6h6" />
                              <path d="M16 13H8" />
                              <path d="M16 17H8" />
                              <path d="M10 9H8" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-zinc-900">{t.name}</h3>
                            <p className="mt-1 line-clamp-3 text-xs leading-5 text-zinc-600">{t.description || ""}</p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onPreview(t.slug)}
                            className="h-8 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                          >
                            Preview
                          </button>
                          <button
                            type="button"
                            onClick={() => onUse(t)}
                            className="h-8 rounded-lg border border-zinc-200 bg-zinc-100 px-3 text-xs font-medium text-zinc-900 hover:bg-zinc-200/70"
                          >
                            Use
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-6 space-y-4">
              {rightCategories.map((cat) => {
                const list = grouped[cat];
                if (!list || list.length === 0) return null;
                return (
                  <section key={cat} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <h2 className="text-sm font-semibold text-zinc-900">{cat}</h2>
                    <div className="mt-4 space-y-3">
                      {list.map((t) => (
                        <div key={t.slug} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2h12" />
                                <path d="M6 6h12" />
                                <path d="M8 10h8" />
                                <path d="M8 14h8" />
                                <path d="M8 18h8" />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold text-zinc-900">{t.name}</h3>
                              <p className="mt-1 line-clamp-4 text-xs leading-5 text-zinc-600">{t.description || ""}</p>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => onPreview(t.slug)}
                              className="h-8 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                            >
                              Preview
                            </button>
                            <button
                              type="button"
                              onClick={() => onUse(t)}
                              className="h-8 rounded-lg border border-zinc-200 bg-zinc-100 px-3 text-xs font-medium text-zinc-900 hover:bg-zinc-200/70"
                            >
                              Use
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </aside>
        </div>
      )}

      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
              <div>
                <p className="text-xs text-zinc-500">Preview</p>
                <p className="text-sm font-semibold text-zinc-900">{previewTitle}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreviewOpen(false);
                  setPreviewHtml("");
                  setPreviewTitle("");
                  setPreviewError(null);
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 hover:bg-zinc-50"
                aria-label="Close preview"
              >
                 
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto p-4">
              {previewBusy && <div className="text-sm text-zinc-600">Loading preview...</div>}
              {previewError && !previewBusy && <div className="text-sm text-rose-700">{previewError}</div>}
              {!previewBusy && !previewError && (
                <div className="prose prose-zinc max-w-none" dangerouslySetInnerHTML={{ __html: previewHtml }} />
              )}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-zinc-200 px-4 py-3">
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="h-9 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
