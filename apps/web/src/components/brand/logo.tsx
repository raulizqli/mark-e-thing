import Link from "next/link";
import { cn } from "@/lib/cn";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "hero";
  href?: string;
}

const sizeClasses = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
  hero: "text-6xl sm:text-7xl md:text-8xl",
};

export function Logo({ className, size = "md", href = "/" }: LogoProps) {
  const content = (
    <span
      className={cn(
        "font-display font-semibold tracking-tight text-ink",
        sizeClasses[size],
        className,
      )}
    >
      Marke<span className="text-teal">Thing</span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block">
        {content}
      </Link>
    );
  }

  return content;
}
