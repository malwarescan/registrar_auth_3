import Image from "next/image";
import nameMogLogo from "@/NameMog_transparent.png";
import { cn } from "@/lib/utils";

/** Intrinsic wordmark aspect ratio (1381×349). */
const LOGO_ASPECT = nameMogLogo.width / nameMogLogo.height;

export type BrandLogoVariant = "header" | "sidebar";

type BrandLogoProps = {
  /** Standardized placement — avoids ad-hoc className size drift. */
  variant?: BrandLogoVariant;
  className?: string;
  priority?: boolean;
};

const VARIANT_CLASS: Record<BrandLogoVariant, string> = {
  header: "brand-logo brand-logo--header",
  sidebar: "brand-logo brand-logo--sidebar",
};

export function BrandLogo({
  variant = "sidebar",
  className,
  priority = false,
}: BrandLogoProps) {
  return (
    <span className={cn(VARIANT_CLASS[variant], className)}>
      <Image
        src={nameMogLogo}
        alt="NameMog"
        width={nameMogLogo.width}
        height={nameMogLogo.height}
        sizes="(max-width: 1023px) 120px, 168px"
        className="brand-logo__image"
        priority={priority}
        style={{ aspectRatio: LOGO_ASPECT }}
      />
    </span>
  );
}
