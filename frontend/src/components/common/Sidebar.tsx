"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiHome,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiClipboard,
  FiGrid,
  FiUser,
} from "react-icons/fi";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

type Item = { href: string; label: string; icon: ReactNode };

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const primaryItems: Item[] = [
    { href: "/dashboard", label: "Home", icon: <FiHome className="h-4 w-4" /> },
    {
      href: "/dashboard/assignments",
      label: "My Assignments",
      icon: <FiClipboard className="h-4 w-4" />,
    },
    {
      href: "/dashboard/templates",
      label: "Templates",
      icon: <FiGrid className="h-4 w-4" />,
    },
    {
      href: "/dashboard/profile",
      label: "Profile",
      icon: <FiUser className="h-4 w-4" />,
    },
    {
      href: "/dashboard/reports",
      label: "Reports & Analytics",
      icon: <FiBarChart2 className="h-4 w-4" />,
    },
  ];

  return (
    <aside className="h-full">
      <nav className="h-full text-zinc-900">
        <div className="flex items-center gap-2">
          <a
            href="/"
            className="flex items-center gap-2 shrink-0"
            aria-label="CollabWrite home"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white">
              <span className="text-sm font-semibold">C</span>
            </span>
            <span
              className="text-lg font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              CollabWrite
            </span>
          </a>
        </div>

        <div className="mt-6">
          <ul className="space-y-1 text-sm">
            {primaryItems.map((it) => {
              const isActive =
                pathname === it.href || pathname?.startsWith(it.href + "/");
              return (
                <li key={it.label}>
                  <Link
                    href={it.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                      isActive
                        ? "bg-zinc-100 text-zinc-900"
                        : "text-zinc-700 hover:bg-zinc-100"
                    }`}
                  >
                    {it.icon}
                    <span className="truncate">{it.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-5">
          <Link
            href="/dashboard/assignments"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-200/70"
          >
            <FiClipboard className="h-4 w-4" />
            <span>Start assignment</span>
          </Link>
        </div>

        <div className="mt-6 border-t border-zinc-200 pt-4">
          <ul className="space-y-1 text-sm">
            <li>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-zinc-700 hover:bg-zinc-100"
              >
                <FiSettings className="h-4 w-4" />
                <span>Settings</span>
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
                className="w-full text-left flex items-center gap-3 rounded-xl px-3 py-2.5 text-zinc-700 hover:bg-zinc-100"
                aria-label="Log out"
                title="Log out"
              >
                <FiLogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
}
