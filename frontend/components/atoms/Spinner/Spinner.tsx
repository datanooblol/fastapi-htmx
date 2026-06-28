interface SpinnerProps {
  size?: "sm" | "md";
  className?: string;
}

const sizeStyles = {
  sm: "w-4 h-4 border-2",
  md: "w-6 h-6 border-2",
};

export function Spinner({ size = "sm", className = "" }: SpinnerProps) {
  return (
    <span
      className={`
        inline-block rounded-full border-sb-border border-t-sb-primary animate-spin
        ${sizeStyles[size]}
        ${className}
      `}
    />
  );
}
