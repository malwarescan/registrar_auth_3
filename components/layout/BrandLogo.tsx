import Image from "next/image";
import namesiloRadarLogo from "@/namesilo_radar.png";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
  pulsing?: boolean;
};

export function BrandLogo({ className, priority = false, pulsing = true }: BrandLogoProps) {
  const sizeClass = className ?? "h-8 w-8";

  return (
    <span
      className={cn(
        "brand-logo relative inline-flex aspect-square shrink-0 items-center justify-center overflow-visible",
        sizeClass
      )}
    >
      {pulsing && (
        <>
          <span className="brand-logo-pulse signal-pulse-ring signal-pulse-ring-inner" aria-hidden />
          <span
            className="brand-logo-pulse signal-pulse-ring signal-pulse-ring-outer signal-pulse-ring-delay"
            aria-hidden
          />
        </>
      )}
      <Image
        src={namesiloRadarLogo}
        alt="NameSilo Intelligence"
        width={namesiloRadarLogo.width}
        height={namesiloRadarLogo.height}
        sizes="(max-width: 1023px) 36px, 40px"
        className="relative z-10 aspect-square h-full w-full object-contain"
        priority={priority}
      />
    </span>
  );
}
