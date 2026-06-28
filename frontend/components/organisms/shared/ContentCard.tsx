"use client";

import Link from "next/link";
import { Badge } from "@/components/atoms/Badge/Badge";
import { Tag } from "@/components/atoms/Tag/Tag";
import { StatusDot, DotStatus } from "@/components/atoms/StatusDot/StatusDot";
import { Button } from "@/components/atoms/Button/Button";
import { ReactNode } from "react";

export type ViewMode = "list" | "card";

export interface ContentCardAction {
  label: string;
  href?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  onClick?: () => void;
}

export interface ContentCardProps {
  id: string;
  title: string;
  subtitle?: string | null;
  href?: string;
  typeBadge?: { label: string; variant: "note" | "source" | "summary" | "article" | "concept" };
  statusBadge?: { label: string; color: string };
  meta?: string;
  preview?: string;
  tags?: string[];
  progress?: { dots: DotStatus[]; label: string; percent: number };
  actions?: ContentCardAction[];
  viewMode?: ViewMode;
  selected?: boolean;
  onSelect?: (id: string) => void;
  searchQuery?: string;
  children?: ReactNode;
}

function highlightText(text: string, query?: string) {
  if (!query?.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-highlight text-text-primary px-0.5 rounded-sm">{part}</mark> : part
  );
}

const statusColors: Record<string, string> = {
  outline: "bg-bg-input text-text-muted border border-sb-border",
  draft: "bg-tag-bg text-sb-warning",
  review: "bg-tag-bg text-sb-primary",
  published: "bg-tag-bg text-sb-success",
};

export function ContentCard({
  id, title, subtitle, href, typeBadge, statusBadge, meta, preview, tags,
  progress, actions, viewMode = "list", selected, onSelect, searchQuery, children,
}: ContentCardProps) {

  const titleContent = (
    <span className={`font-semibold ${viewMode === "list" ? "text-base truncate" : "text-md"} ${href ? "hover:text-sb-primary" : ""}`}>
      {highlightText(title, searchQuery)}
    </span>
  );

  if (viewMode === "card") {
    return (
      <div className={`bg-bg-card border rounded-lg p-4 transition-all hover:border-sb-primary
        ${selected ? "border-sb-primary bg-tag-bg" : "border-sb-border"}`}>

        <div className="flex items-center gap-2 mb-2">
          {typeBadge && <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>}
          {statusBadge && (
            <span className={`text-label font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${statusColors[statusBadge.label] || statusBadge.color}`}>
              {statusBadge.label}
            </span>
          )}
        </div>

        {href ? <Link href={href}>{titleContent}</Link> : titleContent}
        {subtitle && <div className="text-sm text-text-secondary mt-1">{subtitle}</div>}

        {preview && (
          <div className="text-sm text-text-secondary leading-normal line-clamp-3 mt-2">
            {highlightText(preview, searchQuery)}
          </div>
        )}

        {meta && <div className="text-hint text-text-muted mt-2">{meta}</div>}

        {progress && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex gap-1">
              {progress.dots.map((d, i) => <StatusDot key={i} status={d} />)}
            </div>
            <div className="w-24 h-1 bg-bg-input rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${progress.percent >= 100 ? "bg-sb-success" : progress.percent > 30 ? "bg-sb-primary" : "bg-sb-warning"}`}
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <span className="text-label text-text-muted">{progress.label}</span>
          </div>
        )}

        {tags && tags.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-3 pt-3 border-t border-sb-border">
            {tags.map((t) => <Tag key={t} label={t} />)}
          </div>
        )}

        {children}
      </div>
    );
  }

  // List view (default)
  return (
    <div className={`flex gap-3 p-3.5 bg-bg-card border rounded-lg transition-all items-start group
      ${selected ? "border-sb-primary bg-tag-bg" : "border-sb-border hover:border-sb-primary"}`}>

      {onSelect && (
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(id)}
          className="mt-1 accent-sb-primary shrink-0 cursor-pointer"
        />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {typeBadge && <Badge variant={typeBadge.variant}>{typeBadge.label}</Badge>}
          {href ? <Link href={href}>{titleContent}</Link> : titleContent}
          {statusBadge && (
            <span className={`text-label font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${statusColors[statusBadge.label] || statusBadge.color}`}>
              {statusBadge.label}
            </span>
          )}
        </div>

        {subtitle && <div className="text-sm text-text-secondary mb-1">{subtitle}</div>}
        {meta && <div className="text-hint text-text-muted mb-1">{meta}</div>}

        {preview && (
          <div className="text-sm text-text-secondary leading-normal line-clamp-2 mb-2">
            {highlightText(preview, searchQuery)}
          </div>
        )}

        {progress && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              {progress.dots.map((d, i) => <StatusDot key={i} status={d} />)}
            </div>
            <div className="w-40 h-1 bg-bg-input rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${progress.percent >= 100 ? "bg-sb-success" : progress.percent > 30 ? "bg-sb-primary" : "bg-sb-warning"}`}
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <span className="text-label text-text-muted">{progress.label}</span>
          </div>
        )}

        {tags && tags.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {tags.map((t) => <Tag key={t} label={t} />)}
          </div>
        )}

        {children}
      </div>

      {actions && actions.length > 0 && (
        <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {actions.map((action, i) => (
            action.href ? (
              <Link key={i} href={action.href}>
                <Button variant={action.variant || "secondary"} size="sm">{action.label}</Button>
              </Link>
            ) : (
              <Button key={i} variant={action.variant || "secondary"} size="sm" onClick={action.onClick}>
                {action.label}
              </Button>
            )
          ))}
        </div>
      )}
    </div>
  );
}
