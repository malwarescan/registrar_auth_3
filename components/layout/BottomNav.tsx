"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Heart, ArrowLeftRight, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Search", icon: Search },
  { href: "/portfolio", label: "Saved", icon: Heart },
  { href: "/compare", label: "Compare", icon: ArrowLeftRight },
  { href: "/ask", label: "Ask", icon: HelpCircle },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--outline-variant)] bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="mx-auto flex max-w-[var(--container-max)] items-stretch justify-around px-4">
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
                "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors",
                active ? "text-[var(--theme-primary)]" : "text-[var(--on-surface-variant)]"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
