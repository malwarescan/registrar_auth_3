export function domainToSlug(domain: string): string {
  return domain.toLowerCase().replace(/\./g, "-");
}

export function slugToDomain(slug: string): string {
  const parts = slug.split("-");
  if (parts.length < 2) return slug;
  const tld = parts.pop()!;
  return `${parts.join("-")}.${tld}`;
}
