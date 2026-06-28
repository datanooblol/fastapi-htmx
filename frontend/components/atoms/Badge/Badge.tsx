import { ReactNode } from "react";

export type BadgeVariant = "note" | "source" | "summary" | "article" | "concept" | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  note: "bg-tag-bg text-sb-primary",
  source: "bg-tag-bg text-sb-success",
  summary: "bg-tag-bg text-sb-warning",
  article: "bg-tag-bg text-node-article",
  concept: "bg-tag-bg text-node-concept",
  default: "bg-tag-bg text-text-muted",
};

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-block px-2 py-0.5 rounded-sm text-label font-semibold uppercase tracking-wide
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
