"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  FiHome,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiGitMerge,
  FiClipboard,
  FiUser,
} from "react-icons/fi";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

type Item = { href: string; label: string; icon: ReactNode };

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();

  const primaryItems: Item[] = [
    { href: "/dashboard", label: "Home", icon: <FiHome className="h-4 w-4" /> },
    { href: "/dashboard/assignments", label: "My Assignments", icon: <FiClipboard className="h-4 w-4" /> },
    { href: "/dashboard/shared", label: "Shared Projects", icon: <FiUsers className="h-4 w-4" /> },
    { href: "/dashboard/profile", label: "Profile", icon: <FiUser className="h-4 w-4" /> },
    { href: "/dashboard/merge", label: "AI Merge Resolver", icon: <FiGitMerge className="h-4 w-4" /> },
    { href: "/dashboard/reports", label: "Reports & Analytics", icon: <FiBarChart2 className="h-4 w-4" /> },
  ];

  const projects = [
    { id: "proj-1", name: "CS Capstone" },
    { id: "proj-2", name: "Marketing Group" },
    { id: "proj-3", name: "AI Seminar" },
  ];

  return (
    <aside className="sticky top-2">
      <nav className="rounded-2xl bg-zinc-900 text-zinc-100 p-3 shadow-sm">
        {/* Header: logo + collapse */}
        <div className="flex items-center justify-between mb-3">
          <a href="/" className="flex items-center gap-2 shrink-0" aria-label="CollabWrite home">
          <span
            className="text-xl tracking-tight text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            CollabWrite
          </span>
        </a>
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-zinc-300 hover:bg-zinc-800"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <FiChevronRight className="h-4 w-4" /> : <FiChevronLeft className="h-4 w-4" />}
          </button>
        </div>


        {/* Primary nav */}
        <ul className="space-y-1 text-sm">
          {primaryItems.map((it) => {
            const isActive = pathname === it.href || pathname?.startsWith(it.href + "/");
            return (
              <li key={it.label}>
                <Link
                  href={it.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                    isActive ? "bg-zinc-100 text-zinc-900" : "text-zinc-200 hover:bg-zinc-800"
                  }`}
                >
                  {it.icon}
                  {!collapsed && <span className="truncate">{it.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Quick action: go to assignments hub (create/pick assignment, then open writer) */}
        <div className="mt-4">
          <Link
            href="/dashboard/assignments"
            className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              collapsed ? "bg-zinc-800 text-zinc-100 hover:bg-zinc-700" : "bg-white text-zinc-900 hover:bg-zinc-100"
            }`}
          >
            <FiClipboard className="h-4 w-4" />
            {!collapsed && <span>Start assignment</span>}
          </Link>
        </div>

        {/* Bottom items */}
        <div className="mt-4 border-t border-zinc-800 pt-3">
          <ul className="space-y-1 text-sm">
            <li>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-300 hover:bg-zinc-800"
              >
                <FiSettings className="h-4 w-4" />
                {!collapsed && <span>Settings</span>}
              </Link>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  try {
                    logout();
                  } finally {
                    router.replace("/login");
                  }
                }}
                className="w-full text-left flex items-center gap-3 rounded-lg px-3 py-2 text-zinc-300 hover:bg-zinc-800"
                aria-label="Log out"
                title="Log out"
              >
                <FiLogOut className="h-4 w-4" />
                {!collapsed && <span>Logout</span>}
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
}
