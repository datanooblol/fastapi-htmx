import { InputHTMLAttributes } from "react";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export function Checkbox({ label, className = "", ...props }: CheckboxProps) {
  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer text-sm text-text-secondary ${className}`}>
      <input
        type="checkbox"
        className="accent-sb-primary w-3 h-3 cursor-pointer"
        {...props}
      />
      {label && <span>{label}</span>}
    </label>
  );
}
