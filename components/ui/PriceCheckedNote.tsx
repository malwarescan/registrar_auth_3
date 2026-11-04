import type { DomainCandidate } from "@/lib/types/domain";
import { NAMESILO_PRICES, namesiloPriceLabel } from "@/lib/namesilo/price-snapshot";

/**
 * "NameSilo price, checked <date>" under a registration price. When the price came
 * from the snapshot and the renewal differs, the snapshot renewal is shown too.
 */
export function PriceCheckedNote({
  candidate,
  className = "text-xs font-normal text-[var(--on-surface-variant)]",
}: {
  candidate: Pick<DomainCandidate, "domain" | "priceType" | "priceCheckedAt">;
  className?: string;
}) {
  if (candidate.priceType !== "registration" || !candidate.priceCheckedAt) return null;
  const tld = (candidate.domain.split(".").pop() ?? "").toLowerCase();
  const row = NAMESILO_PRICES.prices[tld];
  const renewal =
    row && candidate.priceCheckedAt === NAMESILO_PRICES.checked && row.renew !== row.register
      ? `; renews at $${row.renew}/yr`
      : "";
  return (
    <span className={`block ${className}`} data-namesilo-price-checked={candidate.priceCheckedAt}>
      {namesiloPriceLabel(candidate.priceCheckedAt)}
      {renewal}
    </span>
  );
}
