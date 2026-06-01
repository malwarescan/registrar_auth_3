import Link from "next/link";
import { Search } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";

type AppHeaderProps = {
  title?: string;
  showLogo?: boolean;
  showSearch?: boolean;
  backHref?: string;
};

export function AppHeader({
  title = "NameSilo Intelligence",
  showLogo = false,
  showSearch = true,
  backHref,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--outline-variant)] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[var(--container-max)] items-center justify-between px-4 py-3 md:px-6 lg:py-4">
        <div className="flex items-center gap-2">
          {backHref && (
            <Link href={backHref} className="mr-1 text-[var(--on-surface-variant)] lg:hidden">
              ←
            </Link>
          )}
          {showLogo ? (
            <Link href="/" className="lg:hidden">
              <BrandLogo className="h-7 w-7" />
            </Link>
          ) : (
            <h1 className="text-base font-bold text-[var(--theme-primary)] md:text-lg lg:hidden">
              {title}
            </h1>
          )}
          {backHref && (
            <Link
              href={backHref}
              className="hidden text-sm text-[var(--on-surface-variant)] hover:text-[var(--on-surface)] lg:inline"
            >
              ← Back to Search
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
