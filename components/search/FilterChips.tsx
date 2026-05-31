"use client";

import { SlidersHorizontal } from "lucide-react";
import { Chip } from "@/components/ui/Chip";

type FilterChipsProps = {
  maxPrice: number;
  tld: string;
  activeCount: number;
  onMaxPriceClick: () => void;
  onTldClick: () => void;
};

export function FilterChips({
  maxPrice,
  tld,
  activeCount,
  onMaxPriceClick,
  onTldClick,
}: FilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Chip active={activeCount > 0}>
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filters ({activeCount})
      </Chip>
      <Chip onClick={onMaxPriceClick}>Max Price: ${maxPrice >= 1000 ? `${maxPrice / 1000}k` : maxPrice}</Chip>
      <Chip onClick={onTldClick}>TLD: {tld === "any" ? "All" : `.${tld}`}</Chip>
    </div>
  );
}
