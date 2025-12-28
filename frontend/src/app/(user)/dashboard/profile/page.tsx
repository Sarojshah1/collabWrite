"use client";

import { useEffect, useMemo, useState } from "react";
import ProfileCard from "@/components/profile/ProfileCard";
import Sidebar from "@/components/common/Sidebar";
import { userService } from "@/services/userService";
import { listBlogs, type Blog } from "@/services/blogService";

export default function ProfilePage() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<any>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const user = await userService.me();
        const myBlogs = await listBlogs({ author: user.id, sort: "newest" });
        if (!mounted) return;
        setMe(user as any);
        setBlogs(myBlogs);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const username = useMemo(() => {
    const email = typeof me?.email === "string" ? me.email : "";
    const base = email.split("@")[0] || "creator";
    return base.replace(/[^a-z0-9_]/gi, "");
  }, [me?.email]);

  const stats = useMemo(() => {
    const published = blogs.filter((b) => b.status === "published");
    const publishedPosts = published.length;
    const totalViews = published.reduce((acc, b: any) => acc + (typeof b?.views === "number" ? b.views : 0), 0);
    const totalLikes = published.reduce((acc, b: any) => acc + (Array.isArray(b?.likes) ? b.likes.length : 0), 0);
    return { publishedPosts, totalViews, totalLikes };
  }, [blogs]);

  const recentPosts = useMemo(() => {
    const filtered = blogs.filter((b) => {
      if (!search.trim()) return true;
      return (b.title || "").toLowerCase().includes(search.trim().toLowerCase());
    });
    return filtered.slice(0, 3);
  }, [blogs, search]);

  const safeName = typeof me?.name === "string" && me.name.trim().length > 0 ? me.name : "Your Name";
  const safeBio = typeof me?.bio === "string" && me.bio.trim().length > 0 ? me.bio : "";
  const safeAvatar = typeof me?.avatar === "string" && me.avatar.trim().length > 0 ? me.avatar : "/logo.svg";
  const followersCount = Array.isArray(me?.followers) ? me.followers.length : 0;
  const followingCount = Array.isArray(me?.following) ? me.following.length : 0;

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
                  <span className="truncate">Profile</span>
                </div>
                <h1 className="mt-1 truncate text-[20px] font-semibold text-zinc-900">Your Creator Profile</h1>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden md:flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 shadow-sm w-[340px]">
                  <span className="text-zinc-400">Search...</span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="w-full bg-transparent text-[13px] text-zinc-700 outline-none placeholder:text-zinc-400"
                  />
                </div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2 text-[13px] font-medium text-zinc-700 shadow-sm hover:bg-zinc-50"
                >
                  Edit Profile
                </button>
                <a
                  href="/dashboard/write"
                  className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-zinc-800"
                >
                  New Post
                </a>
                <span className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-[12px] font-semibold text-zinc-700">
                  {(safeName || "N").slice(0, 1).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
          {loading ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm">Loading profile...</div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm">{error}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  <ProfileCard
                    name={safeName}
                    username={username || "creator"}
                    bio={safeBio || "Add a short bio to introduce yourself to readers."}
                    avatarUrl={safeAvatar}
                    coverUrl="/globe.svg"
                    stats={{ posts: stats.publishedPosts, followers: followersCount, following: followingCount }}
                    skills={Array.isArray(me?.interests?.tags) ? me.interests.tags : ["writing", "nextjs", "ui/ux", "collaboration"]}
                    location={typeof me?.location === "string" ? me.location : "Kathmandu, Nepal"}
                    website={typeof me?.website === "string" ? me.website : "https://collabwrite.app"}
                  />

                  <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-zinc-900">Recent Posts</h2>
                      <a href="/dashboard" className="text-xs font-medium text-zinc-600 hover:text-zinc-900">
                        View all
                      </a>
                    </div>
                    <ul className="divide-y divide-zinc-200">
                      {recentPosts.length === 0 ? (
                        <li className="py-8 text-sm text-zinc-600">No posts found.</li>
                      ) : (
                        recentPosts.map((p: any) => {
                          const date = p?.createdAt ? new Date(p.createdAt) : null;
                          const dateLabel = date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "";
                          const likesCount = Array.isArray(p?.likes) ? p.likes.length : 0;
                          const viewsCount = typeof p?.views === "number" ? p.views : 0;
                          return (
                            <li key={p._id} className="flex items-center justify-between gap-3 py-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-zinc-900">{p.title || "Untitled"}</p>
                                <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                                  <span>{dateLabel}</span>
                                  <span className="inline-flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                                    {viewsCount} views
                                  </span>
                                  <span className="inline-flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                                    {likesCount} likes
                                  </span>
                                </div>
                              </div>
                              <a href={`/blog/${p._id}`} className="text-xs font-medium text-zinc-700 hover:text-zinc-900">
                                Open
                              </a>
                            </li>
                          );
                        })
                      )}
                    </ul>
                  </section>
                </div>

                <aside className="space-y-6">
                  <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                    <div className="grid grid-cols-3 divide-x divide-zinc-200">
                      <div className="p-4">
                        <div className="text-lg font-semibold text-zinc-900">{stats.publishedPosts}</div>
                        <div className="text-[10px] uppercase tracking-wide text-zinc-500">Published Posts</div>
                      </div>
                      <div className="p-4">
                        <div className="text-lg font-semibold text-zinc-900">{stats.totalViews}</div>
                        <div className="text-[10px] uppercase tracking-wide text-zinc-500">Total Views</div>
                      </div>
                      <div className="p-4">
                        <div className="text-lg font-semibold text-zinc-900">{stats.totalLikes}</div>
                        <div className="text-[10px] uppercase tracking-wide text-zinc-500">Total Likes</div>
                      </div>
                    </div>
                  </div>

                  <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-2 text-sm font-semibold text-zinc-900">About</h2>
                    <p className="text-sm leading-6 text-zinc-700">
                      {safeBio || "Tell readers what you write about, what you’re building, and what they can expect from your posts."}
                    </p>
                  </section>

                  <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                    <h2 className="mb-3 text-sm font-semibold text-zinc-900">Social</h2>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <a href="#" className="inline-flex items-center gap-2 text-zinc-700 hover:text-zinc-900">
                          <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                          twitter.com/{username || "creator"}
                        </a>
                      </li>
                      <li>
                        <a href="#" className="inline-flex items-center gap-2 text-zinc-700 hover:text-zinc-900">
                          <span className="h-1.5 w-1.5 rounded-full bg-zinc-500" />
                          github.com/{username || "creator"}
                        </a>
                      </li>
                      <li>
                        <a href="#" className="inline-flex items-center gap-2 text-zinc-700 hover:text-zinc-900">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                          linkedin.com/in/{username || "creator"}
                        </a>
                      </li>
                    </ul>
                  </section>
                </aside>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
