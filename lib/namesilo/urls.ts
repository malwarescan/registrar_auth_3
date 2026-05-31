export function getBuyUrl(domain: string, priceType: "registration" | "marketplace"): string {
  if (priceType === "registration") {
    return `https://www.namesilo.com/domain/search-domains?query=${encodeURIComponent(domain)}`;
  }
  return `https://www.namesilo.com/marketplace/search?query=${encodeURIComponent(domain)}`;
}
