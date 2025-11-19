"use client";

import { useSearchParams } from "next/navigation";
import DocsEditor from "@/components/editor/DocsEditor";

export default function DashboardWritePage() {
  const searchParams = useSearchParams();
  const blogId = searchParams.get("blogId") || undefined;

  return (
    <section className="mx-auto max-w-[1200px] px-4 sm:px-6 py-4">
      <DocsEditor initialDocId={blogId} />
    </section>
  );
}
