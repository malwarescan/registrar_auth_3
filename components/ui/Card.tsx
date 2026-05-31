import { cn } from "@/lib/utils";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg";
  onClick?: () => void;
};

export function Card({ children, className, padding = "md", onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--outline-variant)] bg-white",
        padding === "sm" && "p-3",
        padding === "md" && "p-4",
        padding === "lg" && "p-5",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
