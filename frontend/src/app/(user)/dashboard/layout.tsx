"use client";

import Sidebar from "@/components/common/Sidebar";
import AdminSidebar from "@/components/dashboard/AdminSidebar";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="hidden lg:block fixed inset-y-0 left-0 w-64 border-r border-zinc-200 bg-white">
        <div className="h-full overflow-y-auto px-4 py-5">
          {isAdmin ? <AdminSidebar /> : <Sidebar />}
        </div>
      </div>

      <main className="lg:pl-64">{children}</main>
    </div>
  );
}
