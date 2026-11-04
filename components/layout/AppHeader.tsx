import Link from "next/link";
import { Search } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { SITE_NAME } from "@/lib/site";

type AppHeaderProps = {
  title?: string;
  showLogo?: boolean;
  showSearch?: boolean;
  backHref?: string;
};

const BACK_LABELS: Record<string, string> = {
  "/": "Back to search",
  "/guides": "All guides",
};

export function AppHeader({
  title = SITE_NAME,
  showLogo = true,
  showSearch = true,
  backHref,
}: AppHeaderProps) {
  const backLabel = backHref ? (BACK_LABELS[backHref] ?? "Back") : "";
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--outline-variant)] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[var(--container-max)] items-center justify-between px-4 py-3 md:px-6 lg:py-4">
        <div className="flex min-w-0 items-center gap-2">
          {backHref && (
            <Link
              href={backHref}
              aria-label={backLabel}
              className="mr-1 text-[var(--on-surface-variant)] lg:hidden"
            >
              <span aria-hidden>←</span>
            </Link>
          )}
          {showLogo ? (
            <Link
              href="/"
              aria-label="NameMog home"
              className="inline-flex shrink-0 items-center py-0.5 lg:hidden"
            >
              <BrandLogo variant="header" priority />
            </Link>
          ) : (
            <h1 className="truncate text-base font-bold text-[var(--theme-primary)] md:text-lg lg:hidden">
              {title}
            </h1>
          )}
          {backHref && (
            <Link
              href={backHref}
              className="hidden text-sm text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] lg:inline"
            >
              ← {backLabel}
            </Link>
          )}
        </div>
        {showSearch && (
          <Link href="/" aria-label="Search" className="text-[var(--on-surface-variant)] lg:hidden">
            <Search className="h-5 w-5" />
          </Link>
        )}
      </div>
    </header>
  );
}
