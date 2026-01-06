"use client";

import { useEffect, useState } from "react";
import {
  listBlogs,
  updateBlog,
  deleteBlog,
  type Blog,
  type BlogStatus,
} from "@/services/blogService";
import { userService } from "@/services/userService";
import Link from "next/link";

export default function ManageBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; role?: string } | null>(null);

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const u = await userService.me();
      setUser(u);

      // If admin, we might want to fetch all. Current listBlogs supports that via controller logic
      // if we don't pass specific filters that restrict it.
      // Passing sort to ensure consistent order.
      const data = await listBlogs({ sort: "newest" });
      setBlogs(data);
    } catch (e) {
      setError("Failed to load blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: BlogStatus) => {
    try {
      // Optimistic update
      setBlogs((prev) =>
        prev.map((b) => (b._id === id ? { ...b, status: newStatus } : b))
      );
      await updateBlog({ id, status: newStatus });
    } catch (e) {
      // Revert on failure
      loadBlogs();
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;
    try {
      setBlogs((prev) => prev.filter((b) => b._id !== id));
      await deleteBlog(id);
    } catch (e) {
      loadBlogs();
      alert("Failed to delete blog");
    }
  };

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900">Manage Blogs</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Approve, reject, or remove content.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Back to Dashboard
        </Link>
      </header>

      {loading && (
        <div className="py-12 text-center text-zinc-500">Loading blogs...</div>
      )}

      {error && !loading && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600">{error}</div>
      )}

      {!loading && !error && (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
              <tr>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {blogs.map((blog) => (
                <tr key={blog._id} className="hover:bg-zinc-50/50">
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    <Link
                      href={`/blog/${blog._id}`}
                      className="hover:underline"
                    >
                      {blog.title || "Untitled"}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    {typeof blog.author === "object" && blog.author?.name
                      ? blog.author.name
                      : "Unknown"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        blog.status === "published"
                          ? "bg-green-100 text-green-700"
                          : blog.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : blog.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      {blog.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(blog.createdAt || "").toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {/* Approve/Reject for Admin or Pending items */}
                      {/* Assuming logic: If pending, can approve/reject. If published, can reject. If rejected, can approve. */}
                      {blog.status !== "published" && (
                        <button
                          onClick={() =>
                            handleStatusChange(blog._id, "published")
                          }
                          className="text-green-600 hover:underline"
                        >
                          Approve
                        </button>
                      )}
                      {blog.status !== "rejected" && (
                        <button
                          onClick={() =>
                            handleStatusChange(blog._id, "rejected")
                          }
                          className="text-amber-600 hover:underline"
                        >
                          Reject
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(blog._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {blogs.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-zinc-500"
                  >
                    No blogs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
