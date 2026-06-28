"use client";

import { NavItem } from "@/components/molecules/NavItem/NavItem";
import { ThemeToggle } from "./ThemeToggle";

export function Sidebar() {
  return (
    <nav className="w-[240px] bg-bg-sidebar border-r border-sb-border flex flex-col fixed top-0 left-0 bottom-0 z-50 transition-colors">
      <div className="p-5 border-b border-sb-border">
        <h1 className="text-xl font-bold text-sb-primary">SecondBrain</h1>
        <div className="text-xs text-text-muted mt-0.5">Your knowledge, connected</div>
      </div>

      <div className="flex-1 py-3">
        <div className="px-3 mb-2">
          <div className="text-label uppercase tracking-widest text-text-muted px-3 py-2">Main</div>
          <NavItem href="/" icon="■" label="Dashboard" />
          <NavItem href="/notes" icon="✎" label="Notes" />
          <NavItem href="/graph" icon="◈" label="Knowledge Graph" />
        </div>

        <div className="px-3 mb-2">
          <div className="text-label uppercase tracking-widest text-text-muted px-3 py-2">Writing</div>
          <NavItem href="/articles" icon="☰" label="Articles" />
        </div>

        <div className="px-3 mb-2">
          <div className="text-label uppercase tracking-widest text-text-muted px-3 py-2">Insights</div>
          <NavItem href="/analytics" icon="▤" label="Analytics" />
        </div>
      </div>

      <div className="p-3 border-t border-sb-border">
        <ThemeToggle />
      </div>
    </nav>
  );
}
