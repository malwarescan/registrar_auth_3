import Image from "next/image";
import siloradarLogo from "@/siloradar.png";
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
        "relative inline-flex aspect-square shrink-0 items-center justify-center",
        sizeClass
      )}
    >
      {pulsing && (
        <>
          <span className="signal-pulse-ring signal-pulse-ring-inner" aria-hidden />
          <span
            className="signal-pulse-ring signal-pulse-ring-outer signal-pulse-ring-delay"
            aria-hidden
          />
        </>
      )}
      <Image
        src={siloradarLogo}
        alt="NameSilo Intelligence"
        className="relative z-10 aspect-square h-full w-full object-contain"
        priority={priority}
      />
    </span>
  );
}
