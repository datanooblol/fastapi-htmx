"use client";

import Link from "next/link";
import { Badge } from "@/components/atoms/Badge/Badge";
import { Tag } from "@/components/atoms/Tag/Tag";
import { Button } from "@/components/atoms/Button/Button";

interface NoteListItemProps {
  item: {
    id: string;
    item_type: "note" | "source" | "summary";
    title: string;
    preview: string;
    word_count: number;
    created_at: string;
    tags: string[];
    source_id: string | null;
    source_title: string | null;
    connections: number;
  };
  selected?: boolean;
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  searchQuery?: string;
}

function highlightText(text: string, query?: string) {
  if (!query || !query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-highlight text-text-primary px-0.5 rounded-sm">{part}</mark> : part
  );
}

export function NoteListItem({ item, selected, onSelect, onDelete, searchQuery }: NoteListItemProps) {
  const linkHref = item.item_type === "source" ? `/sources/${item.id}` : item.source_id ? `/sources/${item.source_id}` : "#";

  return (
    <div
      className={`flex gap-3 p-3.5 bg-bg-card border rounded-lg transition-all items-start group
        ${selected ? "border-sb-primary bg-tag-bg" : "border-sb-border hover:border-sb-primary"}`}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onSelect?.(item.id)}
        className="mt-1 accent-sb-primary shrink-0 cursor-pointer"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant={item.item_type as "note" | "source" | "summary"}>{item.item_type}</Badge>
          <span className="text-base font-semibold truncate">{highlightText(item.title, searchQuery)}</span>
        </div>

        <div className="text-hint text-text-muted mb-1">
          {item.source_id && item.item_type !== "source" ? (
            <>from: <Link href={`/sources/${item.source_id}`} className="text-text-muted hover:text-sb-primary" onClick={e => e.stopPropagation()}>{item.source_title}</Link> · </>
          ) : item.item_type === "source" ? (
            <>{item.source_title} · </>
          ) : (
            <>standalone · </>
          )}
          {new Date(item.created_at).toLocaleDateString()} · {item.word_count} words · {item.connections} connections
        </div>

        <div className="text-sm text-text-secondary leading-normal line-clamp-2 mb-2">
          {highlightText(item.preview, searchQuery)}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {item.tags.map((t) => (
            <Tag key={t} label={t} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link href={linkHref}>
          <Button variant="secondary" size="sm">Open</Button>
        </Link>
        {item.item_type === "note" && onDelete && (
          <Button variant="danger" size="sm" onClick={() => { if (confirm("Delete?")) onDelete(item.id); }}>
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
