import { cn } from "@/lib/utils";

type ProgressBarProps = {
  label: string;
  value: number;
  subtext?: string;
  variant?: "primary" | "secondary";
  className?: string;
};

export function ProgressBar({
  label,
  value,
  subtext,
  variant = "primary",
  className,
}: ProgressBarProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-[var(--on-surface)]">{label}</span>
        <span className="font-semibold tabular-nums text-[var(--on-surface)]">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-container)]">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            variant === "primary" ? "bg-[var(--secondary)]" : "bg-[#7c3aed]"
          )}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
      {subtext && (
        <p className="text-xs text-[var(--on-surface-variant)]">{subtext}</p>
      )}
    </div>
  );
}
