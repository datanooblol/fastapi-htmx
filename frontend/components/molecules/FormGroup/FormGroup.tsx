import { ReactNode } from "react";

interface FormGroupProps {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function FormGroup({ label, hint, children, className = "" }: FormGroupProps) {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-text-secondary mb-1.5">
        {label}
      </label>
      {children}
      {hint && <p className="text-hint text-text-muted mt-1">{hint}</p>}
    </div>
  );
}
