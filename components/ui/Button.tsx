import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors rounded-[var(--radius-default)] disabled:opacity-50",
        variant === "primary" && "bg-[var(--secondary)] text-white hover:bg-[var(--secondary-dark)]",
        variant === "secondary" && "bg-[var(--surface-container)] text-[var(--on-surface)] hover:bg-[var(--surface-container-high)]",
        variant === "outline" && "border border-[var(--outline-variant)] bg-white text-[var(--secondary)] hover:border-[var(--secondary)]",
        variant === "ghost" && "text-[var(--secondary)] hover:bg-[var(--surface-container-low)]",
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2.5 text-sm",
        size === "lg" && "px-6 py-3 text-base",
        className
      )}
      {...props}
    />
  );
}
