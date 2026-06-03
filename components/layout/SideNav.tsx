"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Heart, ArrowLeftRight, HelpCircle } from "lucide-react";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Search", icon: Search },
  { href: "/portfolio", label: "Saved", icon: Heart },
  { href: "/compare", label: "Compare", icon: ArrowLeftRight },
  { href: "/ask", label: "Ask", icon: HelpCircle },
];

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-[var(--sidebar-width)] flex-col border-r border-[var(--outline-variant)] bg-white lg:flex">
      <div className="flex items-center justify-center border-b border-[var(--outline-variant)] px-6 py-5">
        <Link href="/" className="inline-flex items-center" aria-label="NameMog home">
          <BrandLogo variant="sidebar" priority />
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/" || pathname.startsWith("/domain/")
              : href === "/compare"
                ? pathname.startsWith("/compare")
                : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[var(--secondary)]/10 text-[var(--secondary)]"
                  : "text-[var(--on-surface-variant)] hover:bg-[var(--surface-container-low)] hover:text-[var(--on-surface)]"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
