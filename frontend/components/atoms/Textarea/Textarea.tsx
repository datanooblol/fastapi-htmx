import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className = "", ...props }, ref) => {
    return (
      <div>
        <textarea
          ref={ref}
          className={`
            w-full px-3.5 py-2.5 rounded bg-bg-input
            border text-text-primary text-base font-sans leading-relaxed
            transition-colors duration-150 resize-y min-h-48
            placeholder:text-text-muted
            focus:outline-none focus:border-sb-primary
            ${error ? "border-sb-danger" : "border-sb-border"}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-sb-danger">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
