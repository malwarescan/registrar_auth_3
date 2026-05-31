"use client";

import { useCallback, useEffect, useState } from "react";
import type { DomainCandidate } from "@/lib/types/domain";

const STORAGE_KEY = "ns-intel-shortlist";

export function useShortlist() {
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

  const persist = useCallback((items: DomainCandidate[]) => {
    setShortlist(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, []);

  const add = useCallback(
    (candidate: DomainCandidate) => {
      setShortlist((prev) => {
        if (prev.some((c) => c.domain === candidate.domain)) return prev;
        const next = [...prev, candidate];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const remove = useCallback(
    (domain: string) => {
      setShortlist((prev) => {
        const next = prev.filter((c) => c.domain !== domain);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const isShortlisted = useCallback(
    (domain: string) => shortlist.some((c) => c.domain === domain),
    [shortlist]
  );

  const clear = useCallback(() => persist([]), [persist]);

  return { shortlist, add, remove, isShortlisted, clear, loaded };
}

export function domainToSlug(domain: string): string {
  return domain.toLowerCase().replace(/\./g, "-");
}

export function slugToDomain(slug: string): string {
  const parts = slug.split("-");
  if (parts.length < 2) return slug;
  const tld = parts.pop()!;
  return `${parts.join("-")}.${tld}`;
}
