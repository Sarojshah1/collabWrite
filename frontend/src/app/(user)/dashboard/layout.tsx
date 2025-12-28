"use client";

import Sidebar from "@/components/common/Sidebar";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="hidden lg:block fixed inset-y-0 left-0 w-64 border-r border-zinc-200 bg-white">
        <div className="h-full overflow-y-auto px-4 py-5">
          <Sidebar />
        </div>
      </div>

      <main className="lg:pl-64">
        {children}
      </main>
    </div>
  );
}
