interface StatCardProps {
  label: string;
  value: number | string;
  change?: string;
  changeDirection?: "up" | "down" | "flat";
  className?: string;
}

const changeStyles = {
  up: "text-sb-success",
  down: "text-sb-danger",
  flat: "text-text-muted",
};

export function StatCard({ label, value, change, changeDirection = "flat", className = "" }: StatCardProps) {
  return (
    <div className={`bg-bg-card border border-sb-border rounded-lg p-5 transition-colors ${className}`}>
      <div className="text-xs uppercase tracking-wide text-text-muted mb-2">{label}</div>
      <div className="text-3xl font-bold">{value}</div>
      {change && (
        <div className={`text-xs mt-1 ${changeStyles[changeDirection]}`}>{change}</div>
      )}
    </div>
  );
}
