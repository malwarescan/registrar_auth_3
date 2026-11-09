import Link from "next/link";
import { OPERATOR, OPERATOR_DISCLOSURE, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

// Kept as plain strings (not imported from lib/guides) so client pages that use
// PageShell don't bundle the full guide content.
const FOOTER_GUIDES = [
  { slug: "how-to-shortlist-domain-names-for-a-new-company", label: "Shortlist domain names for a new company" },
  { slug: "how-to-score-a-domain-name-for-branding", label: "Weight a branding scorecard" },
  { slug: "alternatives-when-the-domain-name-you-want-is-taken", label: "Your domain is taken: what you can do" },
  { slug: "how-to-check-a-used-domains-history-before-buying", label: "Check a used domain's history" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--outline-variant)] bg-white px-4 pb-24 pt-6 text-sm text-[var(--on-surface-variant)] md:px-6 lg:pb-6">
      <div className="mx-auto grid max-w-[var(--container-max)] gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="mb-2 font-semibold text-[var(--on-surface)]">About</p>
          <p>
            {OPERATOR_DISCLOSURE} {SITE_DESCRIPTION}
          </p>
          <p className="mt-2">
            <Link href="/about" className="hover:underline">About {SITE_NAME}</Link>
            {" · "}
            <a href={OPERATOR.url} rel="noopener" className="hover:underline">{OPERATOR.name}</a>
          </p>
        </div>
        <nav aria-label="Site">
          <p className="mb-2 font-semibold text-[var(--on-surface)]">Tools</p>
          <ul className="space-y-1">
            <li><Link href="/" className="hover:underline">Search and score domain names</Link></li>
            <li><Link href="/compare" className="hover:underline">Compare domains side by side</Link></li>
            <li><Link href="/methodology" className="hover:underline">How the scores are calculated</Link></li>
          </ul>
        </nav>
        <nav aria-label="Guides">
          <p className="mb-2 font-semibold text-[var(--on-surface)]">Guides</p>
          <ul className="space-y-1">
            {FOOTER_GUIDES.map((g) => (
              <li key={g.slug}>
                <Link href={`/guides/${g.slug}`} className="hover:underline">{g.label}</Link>
              </li>
            ))}
            <li><Link href="/guides" className="font-medium hover:underline">All domain name guides</Link></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
