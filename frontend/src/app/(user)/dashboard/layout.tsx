"use client";

import Sidebar from "@/components/common/Sidebar";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-56 border-r border-zinc-200 bg-zinc-900">
        <div className="h-full overflow-y-auto p-3">
          <Sidebar />
        </div>
      </div>

      {/* Main content area shifted right of sidebar */}
      <main className="lg:pl-56">
        {children}
      </main>
    </div>
  );
}
