"use client";

import { Chip } from "@/components/ui/Chip";
import { REQUIREMENT_CHIPS } from "@/lib/search/brief-config";

type RequirementChipsProps = {
  selected: string[];
  onChange: (next: string[]) => void;
  label?: string;
};

function toggle(arr: string[], item: string) {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export function RequirementChips({ selected, onChange, label = "Requirements" }: RequirementChipsProps) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--on-surface-variant)]">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {REQUIREMENT_CHIPS.map((chip) => (
          <Chip
            key={chip}
            active={selected.includes(chip)}
            onClick={() => onChange(toggle(selected, chip))}
            className="text-xs"
          >
            {chip}
          </Chip>
        ))}
      </div>
    </div>
  );
}
