"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WriteRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/write");
  }, [router]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <p className="text-sm text-zinc-600">Redirecting to dashboard write…</p>
    </main>
  );
}
