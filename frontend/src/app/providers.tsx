"use client";

import { HeroUIProvider } from "@heroui/react";
import { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function Providers({ children }: { children: ReactNode }) {
  const { refresh } = useAuth();

  useEffect(() => {
    // Initialize auth state on app mount
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <HeroUIProvider>{children}</HeroUIProvider>;
}
