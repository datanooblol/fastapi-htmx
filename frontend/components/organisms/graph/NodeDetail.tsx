"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/atoms/Button/Button";
import { Badge } from "@/components/atoms/Badge/Badge";
import { Tag } from "@/components/atoms/Tag/Tag";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface ConnectedItem {
  id: string;
  type: string;
  name: string;
  relationship: string | null;
  strength: string;
}

interface NodeDetailData {
  type: string;
  title: string;
  content?: string;
  word_count?: number;
  tags?: string[];
  source_title?: string;
  source_type?: string;
  status?: string;
  subtitle?: string;
  created_at: string;
  connections: ConnectedItem[];
}

interface NodeDetailProps {
  nodeId: string;
  nodeType: string;
  isOpen: boolean;
  onClose: () => void;
  onNodeClick?: (nodeId: string, nodeType: string) => void;
}

const typeColors: Record<string, string> = {
  note: "bg-node-note",
  source: "bg-node-source",
  summary: "bg-node-summary",
  article: "bg-node-article",
  concept: "bg-node-concept",
};

const dotColors: Record<string, string> = {
  note: "bg-node-note",
  source: "bg-node-source",
  summary: "bg-node-summary",
  article: "bg-node-article",
  concept: "bg-node-concept",
};

export function NodeDetail({ nodeId, nodeType, isOpen, onClose, onNodeClick }: NodeDetailProps) {
  const [data, setData] = useState<NodeDetailData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !nodeId) return;
    setLoading(true);
    fetch(`${API_BASE}/graph/node/${nodeType}/${nodeId}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [nodeId, nodeType, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="w-[360px] border-l border-sb-border bg-bg-secondary flex flex-col shrink-0 h-full transition-all">
      <div className="flex justify-between items-center px-4.5 py-3.5 border-b border-sb-border shrink-0">
        <h3 className="text-md font-semibold">Node Details</h3>
        <button onClick={onClose} className="text-text-muted hover:text-text-primary cursor-pointer bg-transparent border-none text-lg">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4.5 min-h-0">
        {loading && <div className="text-center py-8 text-text-muted text-sm">Loading...</div>}

        {data && (
          <>
            <span className={`inline-block px-2 py-0.5 rounded-sm text-label font-semibold uppercase text-white mb-2 ${typeColors[data.type] || "bg-text-muted"}`}>
              {data.type}
            </span>
            <h2 className="text-xl font-bold mb-1">{data.title}</h2>
            {data.subtitle && <div className="text-sm text-text-secondary mb-2">{data.subtitle}</div>}
            <div className="text-hint text-text-muted mb-4">
              {data.word_count && `${data.word_count} words · `}
              {data.source_title && `from: ${data.source_title} · `}
              {data.status && `${data.status} · `}
              {new Date(data.created_at).toLocaleDateString()}
            </div>

            {/* Content preview */}
            {data.content && (
              <div className="mb-4">
                <div className="text-label uppercase tracking-wide text-text-muted mb-1.5">Content</div>
                <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                  {data.content}
                </div>
              </div>
            )}

            {/* Tags */}
            {data.tags && data.tags.length > 0 && (
              <div className="mb-4">
                <div className="text-label uppercase tracking-wide text-text-muted mb-1.5">Tags</div>
                <div className="flex gap-1 flex-wrap">
                  {data.tags.map((t) => <Tag key={t} label={t} />)}
                </div>
              </div>
            )}

            {/* Connections */}
            <div className="mb-4">
              <div className="text-label uppercase tracking-wide text-text-muted mb-1.5">
                Connected Items ({data.connections.length})
              </div>
              {data.connections.length === 0 ? (
                <div className="text-sm text-text-muted py-2">No connections yet</div>
              ) : (
                <div className="flex flex-col gap-1">
                  {data.connections.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => onNodeClick?.(c.id, c.type)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-all hover:bg-bg-input text-xs"
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${dotColors[c.type] || "bg-text-muted"}`} />
                      <span className="flex-1 text-text-secondary">{c.name}</span>
                      {c.relationship && (
                        <span className="text-label text-text-muted italic">{c.relationship}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {data && (
        <div className="px-4.5 py-3 border-t border-sb-border flex gap-1.5 shrink-0">
          {data.type === "note" && data.connections && (
            <a href={`/sources/${(data as any).source_id || ""}`}>
              <Button variant="primary" size="sm">Open</Button>
            </a>
          )}
          <a href="/synapse">
            <Button variant="secondary" size="sm">Synapse</Button>
          </a>
          <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
        </div>
      )}
    </div>
  );
}
