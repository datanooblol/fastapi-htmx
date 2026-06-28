export type DotStatus = "outline" | "writing" | "written" | "ai_drafted";

interface StatusDotProps {
  status: DotStatus;
  className?: string;
}

const statusStyles: Record<DotStatus, string> = {
  outline: "border-[1.5px] border-text-muted bg-transparent",
  writing: "bg-sb-primary",
  written: "bg-sb-success",
  ai_drafted: "bg-sb-warning",
};

export function StatusDot({ status, className = "" }: StatusDotProps) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full shrink-0 ${statusStyles[status]} ${className}`}
      title={status.replace("_", " ")}
    />
  );
}
