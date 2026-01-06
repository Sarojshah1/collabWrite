"use client";

import { useEffect, useState } from "react";
import {
  adminService,
  type AdminUserListResponse,
} from "@/services/adminService";
import { type AuthUser } from "@/services/authService";
import Link from "next/link";
import { userService } from "@/services/userService";

export default function ManageUsersPage() {
  const [data, setData] = useState<AdminUserListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    loadUsers();
    userService
      .me()
      .then(setCurrentUser)
      .catch(() => {});
  }, []);

  const loadUsers = async (page = 1) => {
    try {
      setLoading(true);
      const res = await adminService.listUsers({ page });
      setData(res);
    } catch (e: any) {
      setError(e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      // Optimistic update
      setData((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          users: prev.users.map((u) =>
            u.id === userId ? { ...u, role: newRole as any } : u
          ),
        };
      });

      await adminService.updateUserRole(userId, newRole);
    } catch (e) {
      alert("Failed to update role");
      loadUsers(data?.pagination.page);
    }
  };

  const roles = ["user", "admin", "editor", "moderator"];

  return (
    <section className="mx-auto max-w-[1200px] px-6 py-8">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-zinc-900">Manage Users</h1>
          <p className="mt-1 text-sm text-zinc-600">
            View users and assign roles.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Back to Overview
        </Link>
      </header>

      {loading && !data && (
        <div className="py-12 text-center text-zinc-500">Loading users...</div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600 mb-4">
          {error}
        </div>
      )}

      {data && (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Current Role</th>
                <th className="px-6 py-4">Assign Role</th>
                <th className="px-6 py-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data.users.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50/50">
                  <td className="px-6 py-4 font-medium text-zinc-900">
                    <div className="flex items-center gap-2">
                      {user.avatar && (
                        <img
                          src={user.avatar}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      )}
                      {user.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                      disabled={user.id === currentUser?.id}
                      className="rounded border border-zinc-300 px-2 py-1 text-xs"
                    >
                      {roles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    {/* Date formatting if available, currently mostly assuming string or date obj */}
                    {/* simplified for now */}
                    Unknown
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 flex justify-between items-center border-t border-zinc-100">
            <button
              disabled={data.pagination.page <= 1}
              onClick={() => loadUsers(data.pagination.page - 1)}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-zinc-500">
              Page {data.pagination.page} of {data.pagination.pages}
            </span>
            <button
              disabled={data.pagination.page >= data.pagination.pages}
              onClick={() => loadUsers(data.pagination.page + 1)}
              className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
