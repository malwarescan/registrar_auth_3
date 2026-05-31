"use client";

import {
  ArrowLeftRight,
  Grid3X3,
  Layers,
  Map,
  Pin,
} from "lucide-react";
import { OUTPUT_PREVIEW_ITEMS } from "@/lib/search/search-config";

const ICONS = {
  map: Map,
  stack: Layers,
  matrix: Grid3X3,
  pin: Pin,
  compare: ArrowLeftRight,
} as const;

export function OutputPreviewGrid() {
  return (
    <section>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--on-surface-variant)]">
        After analysis, you&apos;ll get
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {OUTPUT_PREVIEW_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          return (
            <div
              key={item.title}
              className="flex min-h-[88px] items-start gap-3 rounded-lg border border-[var(--outline-variant)] bg-white p-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[var(--surface-container-low)] text-[var(--secondary)]">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold leading-tight text-[var(--on-surface)]">
                  {item.title}
                </h3>
                <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-[var(--on-surface-variant)]">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
