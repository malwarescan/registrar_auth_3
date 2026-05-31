"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  loading?: boolean;
};

export function SearchBar({ value, onChange, onAnalyze, loading }: SearchBarProps) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1 md:max-w-xl lg:max-w-2xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--on-surface-variant)]" />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAnalyze()}
          placeholder="Search domain ideas..."
          className="w-full rounded-full border border-[var(--outline-variant)] bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[var(--secondary)]"
        />
      </div>
      <Button onClick={onAnalyze} disabled={loading || !value.trim()}>
        {loading ? "..." : "Analyze"}
      </Button>
    </div>
  );
}
