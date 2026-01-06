"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FiBarChart2,
  FiUsers,
  FiFileText,
  FiActivity,
  FiTrendingUp,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  adminService,
  type AdminAnalyticsResponse,
} from "@/services/adminService";

export default function AdminDashboardHome() {
  const [data, setData] = useState<AdminAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await adminService.getAnalytics(30);
        setData(res);
      } catch (e) {
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <div className="rounded-lg bg-rose-50 p-4 text-rose-700">
          {error || "No data available"}
        </div>
      </div>
    );
  }

  // Calculate some aggregate stats
  // Calculate some aggregate stats
  const safeDau = data.dau || [];
  const safePopularBlogs = data.mostPopularBlogs || [];
  const safeTopCategories = data.topCategories || [];
  const safeActiveAuthors = data.mostActiveAuthors || [];

  const totalDau = safeDau.reduce((acc, curr) => acc + (curr.dau || 0), 0);
  const avgDau = Math.round(totalDau / (safeDau.length || 1));
  const totalInteractions = safeDau.reduce(
    (acc, curr) => acc + (curr.interactions || 0),
    0
  );

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Admin Console</h1>
          <p className="mt-1 text-zinc-600">Platform performance & insights.</p>
        </div>
        <div className="text-sm text-zinc-500">Last 30 Days</div>
      </header>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Active Users (Avg)"
          value={avgDau.toString()}
          icon={<FiUsers className="h-5 w-5 text-blue-600" />}
          trend={12} // Mock trend for now
        />
        <StatsCard
          title="Total Interactions"
          value={totalInteractions.toLocaleString()}
          icon={<FiActivity className="h-5 w-5 text-emerald-600" />}
          trend={8}
        />
        <StatsCard
          title="Popular Blogs"
          value={safePopularBlogs.length.toString()}
          icon={<FiFileText className="h-5 w-5 text-purple-600" />}
          subtext="Top performing content"
        />
        <StatsCard
          title="Top Categories"
          value={safeTopCategories.length.toString()}
          icon={<FiBarChart2 className="h-5 w-5 text-indigo-600" />}
          subtext="Active topics"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Main Chart: User Growth / Activity */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-semibold text-zinc-900">
            Daily Active Users
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={safeDau}>
                <defs>
                  <linearGradient id="colorDau" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f4f4f5"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 12 }}
                  tickFormatter={(val) => val.slice(5)} // Show MM-DD
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="dau"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDau)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Content List */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-zinc-900">
            Top Content
          </h3>
          <div className="space-y-4">
            {safePopularBlogs.slice(0, 5).map((blog, i) => (
              <div key={blog._id} className="flex items-start gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-xs font-bold text-zinc-500">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {blog.title}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {blog.views} views • {blog.author.name}
                  </p>
                </div>
              </div>
            ))}
            {safePopularBlogs.length === 0 && (
              <p className="text-sm text-zinc-500">No popular blogs yet.</p>
            )}
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-100">
            <Link
              href="/dashboard/manage-blogs"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all content &rarr;
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Categories Chart */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-semibold text-zinc-900">
            Top Categories
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={safeTopCategories.slice(0, 7)} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#f4f4f5"
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="_id"
                  type="category"
                  width={100}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#3f3f46", fontSize: 13, fontWeight: 500 }}
                />
                <Tooltip
                  cursor={{ fill: "#f4f4f5" }}
                  contentStyle={{ borderRadius: "8px", border: "none" }}
                />
                <Bar
                  dataKey="count"
                  fill="#4f46e5"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active Authors List */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-zinc-900">
            Top Creators
          </h3>
          <div className="overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-100 text-xs font-medium uppercase text-zinc-500">
                  <th className="pb-3 font-medium">Author</th>
                  <th className="pb-3 font-medium text-right">Blogs</th>
                  <th className="pb-3 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {safeActiveAuthors.slice(0, 5).map((author) => (
                  <tr key={author._id}>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-600">
                          {author.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-zinc-900">
                            {author.name}
                          </div>
                          <div className="truncate text-xs text-zinc-500">
                            {author.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right font-medium text-zinc-900">
                      {author.blogs}
                    </td>
                    <td className="py-3 text-right">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
                {safeActiveAuthors.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-zinc-500">
                      No active authors.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 pt-2 text-right">
            <Link
              href="/dashboard/admin/users"
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Manage all users &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({
  title,
  value,
  icon,
  trend,
  subtext,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: number;
  subtext?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">{title}</p>
          <h3 className="mt-2 text-3xl font-bold text-zinc-900">{value}</h3>
        </div>
        <div className="rounded-xl bg-zinc-50 p-3">{icon}</div>
      </div>
      <div className="mt-4">
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trend >= 0 ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {trend >= 0 ? <FiArrowUp /> : <FiArrowDown />}
            <span>{Math.abs(trend)}% from last month</span>
          </div>
        )}
        {subtext && <p className="text-xs text-zinc-500">{subtext}</p>}
      </div>
    </div>
  );
}
