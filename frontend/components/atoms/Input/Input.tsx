import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className = "", ...props }, ref) => {
    return (
      <div>
        <input
          ref={ref}
          className={`
            w-full px-3.5 py-2.5 rounded bg-bg-input
            border text-text-primary text-base font-sans
            transition-colors duration-150
            placeholder:text-text-muted
            focus:outline-none focus:border-sb-primary
            ${error ? "border-sb-danger" : "border-sb-border"}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-sb-danger">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
