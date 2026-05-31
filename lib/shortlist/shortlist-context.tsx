"use client";

import { createContext, useContext, useCallback, useEffect, useState } from "react";
import type { DomainCandidate } from "@/lib/types/domain";

const STORAGE_KEY = "ns-intel-shortlist";

type ShortlistContextValue = {
  shortlist: DomainCandidate[];
  add: (candidate: DomainCandidate) => void;
  remove: (domain: string) => void;
  isShortlisted: (domain: string) => boolean;
  clear: () => void;
  loaded: boolean;
};

const ShortlistContext = createContext<ShortlistContextValue | null>(null);

export function ShortlistProvider({ children }: { children: React.ReactNode }) {
  const [shortlist, setShortlist] = useState<DomainCandidate[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setShortlist(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  const add = useCallback((candidate: DomainCandidate) => {
    setShortlist((prev) => {
      if (prev.some((c) => c.domain === candidate.domain)) return prev;
      const next = [...prev, candidate];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const remove = useCallback((domain: string) => {
    setShortlist((prev) => {
      const next = prev.filter((c) => c.domain !== domain);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isShortlisted = useCallback(
    (domain: string) => shortlist.some((c) => c.domain === domain),
    [shortlist]
  );

  const clear = useCallback(() => {
    setShortlist([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <ShortlistContext.Provider value={{ shortlist, add, remove, isShortlisted, clear, loaded }}>
      {children}
    </ShortlistContext.Provider>
  );
}

export function useShortlistContext() {
  const ctx = useContext(ShortlistContext);
  if (!ctx) throw new Error("useShortlistContext must be used within ShortlistProvider");
  return ctx;
}
