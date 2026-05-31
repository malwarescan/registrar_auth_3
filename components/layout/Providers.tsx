"use client";

import { ShortlistProvider } from "@/lib/shortlist/shortlist-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ShortlistProvider>{children}</ShortlistProvider>;
}
