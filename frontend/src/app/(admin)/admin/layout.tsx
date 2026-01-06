"use client";

import type { ReactNode } from "react";
import AdminSidebar from "@/components/dashboard/AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="hidden lg:block fixed inset-y-0 left-0 w-64 border-r border-zinc-200 bg-zinc-900">
        <div className="h-full overflow-y-auto px-4 py-5">
          <AdminSidebar />
        </div>
      </div>

      <main className="lg:pl-64">{children}</main>
    </div>
  );
}
