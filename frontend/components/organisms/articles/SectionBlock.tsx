"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/atoms/Button/Button";
import { StatusDot } from "@/components/atoms/StatusDot/StatusDot";
import { Tag } from "@/components/atoms/Tag/Tag";

interface SectionRef {
  id: string;
  ref_id: string;
  ref_type: string;
  name: string;
}

interface SectionData {
  id: string;
  title: string;
  brief: string | null;
  content: string | null;
  status: string;
  word_count: number;
  refs: SectionRef[];
}

interface SectionBlockProps {
  section: SectionData;
  onUpdate: (sectionId: string, data: { title?: string; brief?: string; content?: string; status?: string }) => void;
  onDelete: (sectionId: string) => void;
  onAddRef: (sectionId: string) => void;
  onRemoveRef: (sectionId: string, refLinkId: string) => void;
  onOpenMuse?: (sectionId: string, sectionTitle: string) => void;
}

export function SectionBlock({ section, onUpdate, onDelete, onAddRef, onRemoveRef, onOpenMuse }: SectionBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [brief, setBrief] = useState(section.brief || "");
  const [content, setContent] = useState(section.content || "");

  // Sync local state when props change (e.g., after Muse applies content)
  useEffect(() => {
    setBrief(section.brief || "");
    setContent(section.content || "");
  }, [section.brief, section.content]);

  const statusColors: Record<string, string> = {
    outline: "",
    writing: "border-l-3 border-l-sb-primary",
    written: "border-l-3 border-l-sb-success",
    ai_drafted: "border-l-3 border-l-sb-warning",
  };

  const handleSaveContent = () => {
    onUpdate(section.id, { content, status: content.trim() ? "writing" : "outline", brief });
    setEditing(false);
  };

  const handleMarkDone = () => {
    onUpdate(section.id, { content, status: "written", brief });
    setEditing(false);
  };

  return (
    <div className={`border border-sb-border rounded-lg mb-3 overflow-visible transition-all ${statusColors[section.status] || ""}`}>
      {/* Header */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2.5 px-4 py-3 cursor-pointer transition-colors hover:bg-tag-bg/30"
      >
        <span className="text-text-muted cursor-grab text-md">⁞⁞</span>
        <StatusDot status={section.status as "outline" | "writing" | "written" | "ai_drafted"} />
        <span className="flex-1 text-md font-semibold">{section.title}</span>
        <span className="text-label text-text-muted px-2 py-0.5 bg-tag-bg rounded-full">
          {section.word_count} words
        </span>
        <span className="text-label text-text-muted px-2 py-0.5 bg-tag-bg rounded-full">
          {section.refs.length} refs
        </span>
        <span className="text-label text-text-muted uppercase tracking-wide">{section.status.replace("_", " ")}</span>
        <span className={`text-text-muted text-sm transition-transform ${expanded ? "rotate-180" : ""}`}>▾</span>
      </div>

      {/* Body */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-sb-border">
          {/* Section Brief */}
          <div className="p-3 my-3 bg-bg-input rounded-md border-l-3 border-l-sb-primary">
            <div className="text-label uppercase tracking-wide text-text-muted mb-1">
              Section Brief <span className="normal-case italic tracking-normal">— guides AI when drafting or reviewing</span>
            </div>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              onBlur={() => onUpdate(section.id, { brief })}
              placeholder="What should this section cover?"
              className="w-full p-0 bg-transparent border-none text-text-secondary text-sm font-sans leading-relaxed resize-none min-h-10 focus:outline-none placeholder:text-text-muted"
            />
          </div>

          {/* Refs */}
          <div className="my-3">
            <div className="text-label uppercase tracking-wide text-text-muted mb-1.5">Attached References</div>
            <div className="flex flex-wrap gap-1.5 items-center">
              {section.refs.map((r) => (
                <span
                  key={r.id}
                  className="flex items-center gap-1 px-2.5 py-1 bg-tag-bg border border-sb-border rounded text-hint text-sb-primary"
                >
                  <span className="text-label text-text-muted">{r.ref_type}</span>
                  {r.name}
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemoveRef(section.id, r.id); }}
                    className="text-text-muted hover:text-sb-danger text-xs cursor-pointer bg-transparent border-none ml-1"
                  >✕</button>
                </span>
              ))}
              <button
                onClick={() => onAddRef(section.id)}
                className="px-2.5 py-1 border border-dashed border-sb-border rounded text-hint text-text-muted cursor-pointer transition-all hover:text-sb-primary hover:border-sb-primary bg-transparent"
              >
                + Attach reference
              </button>
            </div>
          </div>

          {/* Content editor */}
          {(editing || section.status === "writing" || section.content) && (
            <div className="my-3">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing this section..."
                className="w-full min-h-28 p-3 bg-bg-primary border border-sb-border rounded-md text-text-primary text-base font-sans leading-relaxed resize-y focus:outline-none focus:border-sb-primary"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {!editing && section.status === "outline" && (
              <Button size="sm" onClick={() => setEditing(true)}>Write</Button>
            )}
            {(editing || section.content) && (
              <>
                <Button size="sm" variant="secondary" onClick={handleSaveContent}>Save</Button>
                <Button size="sm" variant="success" onClick={handleMarkDone}>Mark as done</Button>
              </>
            )}
            {onOpenMuse && (
              <Button size="sm" variant="secondary" onClick={() => onOpenMuse(section.id, section.title)}>
                ◈ Muse
              </Button>
            )}
            <Button size="sm" variant="danger" onClick={() => { if (confirm("Delete this section?")) onDelete(section.id); }}>
              Delete section
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
