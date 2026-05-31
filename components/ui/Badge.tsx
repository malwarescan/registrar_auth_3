import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "primary";
  className?: string;
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variant === "default" && "bg-[var(--surface-container)] text-[var(--on-surface-variant)]",
        variant === "success" && "bg-[#166534] text-white",
        variant === "warning" && "bg-[var(--warning-container)] text-[#92400e]",
        variant === "error" && "bg-[var(--error-container)] text-[var(--error)]",
        variant === "primary" && "bg-[var(--success-container)] text-[#065f46]",
        className
      )}
    >
      {children}
    </span>
  );
}
