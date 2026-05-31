"use client";

import { Card } from "@/components/ui/Card";
import { STARTING_PATHS, type StartingPath } from "@/lib/search/search-config";

type SearchEmptySidebarProps = {
  recent: string[];
  onRecentSelect: (query: string) => void;
  onPathSelect: (path: StartingPath) => void;
};

export function SearchEmptySidebar({ recent, onRecentSelect, onPathSelect }: SearchEmptySidebarProps) {
  return (
    <div className="space-y-4">
      {recent.length > 0 && (
        <Card padding="md">
          <h2 className="text-sm font-semibold text-[var(--on-surface)]">Recent searches</h2>
          <ul className="mt-3 space-y-1">
            {recent.map((q) => (
              <li key={q}>
                <button
                  type="button"
                  onClick={() => onRecentSelect(q)}
                  className="w-full truncate rounded-md px-2 py-1.5 text-left text-sm text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] hover:text-[var(--secondary)]"
                >
                  {q}
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card padding="md">
        <h2 className="text-sm font-semibold text-[var(--on-surface)]">Quick start</h2>
        <ul className="mt-3 space-y-2">
          {STARTING_PATHS.slice(0, 4).map((path) => (
            <li key={path.id}>
              <button
                type="button"
                onClick={() => onPathSelect(path)}
                className="w-full rounded-md px-2 py-1.5 text-left hover:bg-[var(--surface-container-low)]"
              >
                <p className="text-sm font-medium text-[var(--on-surface)]">{path.title}</p>
                <p className="text-xs text-[var(--on-surface-variant)]">{path.description}</p>
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
