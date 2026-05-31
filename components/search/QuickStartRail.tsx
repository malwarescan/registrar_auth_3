"use client";

import { STARTING_PATHS, type StartingPath } from "@/lib/search/search-config";
import { cn } from "@/lib/utils";

type QuickStartRailProps = {
  recent?: string[];
  onPathSelect: (path: StartingPath) => void;
  onRecentSelect?: (query: string) => void;
  className?: string;
};

export function QuickStartRail({
  recent = [],
  onPathSelect,
  onRecentSelect,
  className,
}: QuickStartRailProps) {
  return (
    <aside className={cn("space-y-5", className)}>
      <div className="rounded-lg border border-[var(--outline-variant)] bg-white p-4">
        <h2 className="text-sm font-semibold text-[var(--on-surface)]">Quick start</h2>
        <ul className="mt-3 divide-y divide-[var(--outline-variant)]">
          {STARTING_PATHS.map((path) => (
            <li key={path.id}>
              <button
                type="button"
                onClick={() => onPathSelect(path)}
                className="w-full py-3 text-left transition-colors hover:text-[var(--secondary)]"
              >
                <p className="text-sm font-medium text-[var(--on-surface)]">{path.title}</p>
                <p className="mt-0.5 text-xs leading-snug text-[var(--on-surface-variant)]">
                  {path.description}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {recent.length > 0 && (
        <div className="rounded-lg border border-[var(--outline-variant)] bg-white p-4">
          <h2 className="text-sm font-semibold text-[var(--on-surface)]">Recent searches</h2>
          <ul className="mt-2 space-y-0.5">
            {recent.slice(0, 5).map((q) => (
              <li key={q}>
                <button
                  type="button"
                  onClick={() => onRecentSelect?.(q)}
                  className="w-full truncate rounded-md px-2 py-1.5 text-left text-sm text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] hover:text-[var(--secondary)]"
                >
                  {q}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
