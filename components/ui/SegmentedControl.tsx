import { cn } from "@/lib/utils";

type SegmentedControlProps<T extends string> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  className?: string;
  variant?: "default" | "primary";
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
  variant = "default",
}: SegmentedControlProps<T>) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <p className="text-sm text-[var(--on-surface-variant)]">{label}</p>
      )}
      <div
        className={cn(
          "flex rounded-lg p-0.5",
          variant === "primary"
            ? "border border-[var(--outline-variant)] bg-[var(--surface-container-low)]"
            : "bg-[var(--surface-container)] p-1"
        )}
      >
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 rounded-md py-2 text-xs font-semibold transition-colors sm:text-sm",
              value === opt.value
                ? variant === "primary"
                  ? "bg-[var(--secondary)] text-white shadow-sm"
                  : "bg-white text-[var(--on-surface)] shadow-sm"
                : "text-[var(--on-surface-variant)] hover:text-[var(--on-surface)]"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
