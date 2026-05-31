import { cn } from "@/lib/utils";

type ChipProps = {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
};

export function Chip({ children, active, onClick, className }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-[var(--secondary)] bg-[var(--surface-container-low)] text-[var(--secondary)]"
          : "border-[var(--outline-variant)] bg-white text-[var(--on-surface-variant)] hover:border-[var(--outline)]",
        className
      )}
    >
      {children}
    </button>
  );
}
