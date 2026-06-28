"use client";

import { ViewMode } from "./ContentCard";

interface ViewToggleProps {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div className="flex gap-0">
      <button
        onClick={() => onChange("list")}
        className={`px-3 py-1.5 text-xs border cursor-pointer transition-all rounded-l
          ${mode === "list" ? "bg-sb-primary border-sb-primary text-white" : "bg-transparent border-sb-border text-text-muted hover:text-text-secondary"}`}
      >
        List
      </button>
      <button
        onClick={() => onChange("card")}
        className={`px-3 py-1.5 text-xs border border-l-0 cursor-pointer transition-all rounded-r
          ${mode === "card" ? "bg-sb-primary border-sb-primary text-white" : "bg-transparent border-sb-border text-text-muted hover:text-text-secondary"}`}
      >
        Cards
      </button>
    </div>
  );
}
