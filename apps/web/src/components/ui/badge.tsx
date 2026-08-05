import { cn } from "@/lib/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "teal" | "sand" | "outline";
  className?: string;
}

const variantClasses = {
  default: "bg-ink/8 text-ink",
  teal: "bg-teal/15 text-teal",
  sand: "bg-sand/60 text-ink",
  outline: "border border-border text-muted",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
