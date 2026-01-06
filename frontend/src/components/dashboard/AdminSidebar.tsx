"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiHome,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiClipboard,
  FiUser,
} from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";

type Item = { href: string; label: string; icon: React.ReactNode };

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const adminItems: Item[] = [
    {
      href: "/admin",
      label: "Overview",
      icon: <FiHome className="h-4 w-4" />,
    },
    {
      href: "/admin/analytics",
      label: "Analytics",
      icon: <FiBarChart2 className="h-4 w-4" />,
    },
    {
      href: "/admin/blogs",
      label: "Manage Blogs",
      icon: <FiClipboard className="h-4 w-4" />,
    },
    {
      href: "/admin/users",
      label: "Manage Users",
      icon: <FiUser className="h-4 w-4" />,
    },
  ];

  return (
    <aside className="h-full bg-zinc-900 border-r border-zinc-800">
      <nav className="h-full text-zinc-300">
        <div className="flex items-center gap-2 p-6">
          <a
            href="/"
            className="flex items-center gap-2 shrink-0"
            aria-label="CollabWrite home"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm ring-2 ring-blue-500/30">
              <span className="text-xs font-bold uppercase">A</span>
            </span>
            <span className="text-lg font-semibold tracking-tight text-white">
              CollabWrite
            </span>
          </a>
        </div>

        <div className="px-4">
          <div className="px-2 mb-2 text-xs font-semibold uppercase text-zinc-500 tracking-wider">
            Admin Console
          </div>
          <ul className="space-y-1 text-sm">
            {adminItems.map((it) => {
              const isActive =
                pathname === it.href || pathname?.startsWith(it.href + "/");
              return (
                <li key={it.label}>
                  <Link
                    href={it.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${
                      isActive
                        ? "bg-zinc-800 text-white shadow-sm"
                        : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
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

        <div className="mt-6 border-t border-zinc-800 pt-4 px-4">
          <ul className="space-y-1 text-sm">
            <li>
              <Link
                href="/dashboard"
                target="_blank" // Optional: open in new tab to keep admin context? user said "only opens inadmin".
                // Actually, user said "click to admin buttons it only opens inadmin not of dashboard".
                // Navigating TO user dashboard is fine, but navigation WITHIN admin should stay in admin.
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              >
                <FiHome className="h-4 w-4" />
                <span>User Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
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
                className="w-full text-left flex items-center gap-3 rounded-xl px-3 py-2.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
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
