"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/atoms/Button/Button";
import { PageContainer } from "@/components/organisms/layout/PageContainer";
import { ContentCard, ViewMode } from "@/components/organisms/shared/ContentCard";
import { ViewToggle } from "@/components/organisms/shared/ViewToggle";
import { SynapsePanel } from "@/components/organisms/synapse/SynapsePanel";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface SearchResult {
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
}

interface Stats { notes: number; sources: number; summaries: number; connections: number; }

export default function NotesListPage() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [stats, setStats] = useState<Stats>({ notes: 0, sources: 0, summaries: 0, connections: 0 });
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [loading, setLoading] = useState(true);
  const [synapseOpen, setSynapseOpen] = useState(false);
  const [synapseNoteIds, setSynapseNoteIds] = useState<string[]>([]);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (typeFilter !== "all") params.set("type", typeFilter);
    params.set("sort", sortBy);
    try {
      const res = await fetch(`${API_BASE}/notes?${params}`);
      const data = await res.json();
      setResults(data.results);
      setTotal(data.total);
      setStats(data.stats);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [query, typeFilter, sortBy]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); fetchResults(); };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };
  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.size === results.length ? new Set() : new Set(results.map((r) => r.id)));
  };
  const clearSelection = () => setSelectedIds(new Set());

  const handleDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    await fetch(`${API_BASE}/notes/${id}`, { method: "DELETE" });
    await fetchResults();
    selectedIds.delete(id);
    setSelectedIds(new Set(selectedIds));
  };

  const openSynapse = (ids?: string[]) => {
    const noteOnlyIds = ids || Array.from(selectedIds).filter((id) => {
      const item = results.find((r) => r.id === id);
      return item?.item_type === "note";
    });
    if (noteOnlyIds.length === 0) { alert("Select at least one note to connect."); return; }
    setSynapseNoteIds(noteOnlyIds);
    setSynapseOpen(true);
  };

  return (
    <div className="flex h-full">
    <PageContainer className="flex-1">
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-3xl font-bold mb-1">Notes & Sources</h2>
          <div className="flex gap-4 text-xs text-text-muted">
            <span><strong className="text-text-secondary">{stats.notes}</strong> notes</span>
            <span><strong className="text-text-secondary">{stats.sources}</strong> sources</span>
            <span><strong className="text-text-secondary">{stats.summaries}</strong> summaries</span>
            <span><strong className="text-text-secondary">{stats.connections}</strong> connections</span>
          </div>
        </div>
        <Link href="/sources/new"><Button>+ New Source</Button></Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-md">⌕</span>
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes, sources, summaries..."
            className="w-full pl-9 pr-3.5 py-2.5 bg-bg-card border border-sb-border rounded-lg text-text-primary text-base font-sans focus:outline-none focus:border-sb-primary" />
        </div>
        <button type="submit" className="px-5 py-2.5 bg-sb-primary border-none rounded-lg text-white text-sm font-medium cursor-pointer transition-all hover:bg-sb-primary-hover">Search</button>
      </form>

      {/* Filters + View Toggle */}
      <div className="flex gap-2.5 items-center mb-4 flex-wrap">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-bg-card border border-sb-border rounded text-text-primary text-xs font-sans focus:outline-none focus:border-sb-primary">
          <option value="all">All Types</option>
          <option value="note">Notes</option>
          <option value="source">Sources</option>
          <option value="summary">Summaries</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="px-2.5 py-1.5 bg-bg-card border border-sb-border rounded text-text-primary text-xs font-sans focus:outline-none focus:border-sb-primary">
          <option value="newest">Sort: Newest</option>
          <option value="oldest">Sort: Oldest</option>
          <option value="alpha">Sort: A → Z</option>
        </select>
        <div className="ml-auto">
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* Bulk bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-tag-bg border border-sb-primary rounded-lg mb-3 text-sm">
          <span className="font-semibold text-sb-primary">{selectedIds.size} selected</span>
          <div className="flex gap-1.5 ml-auto">
            <Button variant="secondary" size="sm" onClick={() => openSynapse()}>Connect with Synapse</Button>
            <Button variant="danger" size="sm">Delete</Button>
            <Button variant="secondary" size="sm" onClick={clearSelection}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Results header */}
      <div className="flex justify-between items-center mb-2.5">
        <div className="text-sm text-text-muted flex items-center gap-2">
          <label className="inline-flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={selectedIds.size === results.length && results.length > 0}
              onChange={toggleSelectAll} className="accent-sb-primary" />
          </label>
          <strong className="text-text-primary">{total}</strong> results
          {query && <span>for &quot;{query}&quot;</span>}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-text-muted">Loading...</div>
      ) : results.length === 0 ? (
        <div className="text-center py-12 text-text-muted">
          <p className="text-base mb-2">No results found</p>
          <p className="text-sm">Try a different search or <Link href="/sources/new" className="text-sb-primary">add a new source</Link></p>
        </div>
      ) : (
        <div className={viewMode === "card" ? "grid grid-cols-3 gap-3" : "flex flex-col gap-2"}>
          {results.map((item) => (
            <ContentCard
              key={item.id}
              id={item.id}
              title={item.title}
              href={item.item_type === "source" ? `/sources/${item.id}` : item.source_id ? `/sources/${item.source_id}` : undefined}
              typeBadge={{ label: item.item_type, variant: item.item_type as "note" | "source" | "summary" }}
              meta={`${item.source_title ? `from: ${item.source_title} · ` : "standalone · "}${new Date(item.created_at).toLocaleDateString()} · ${item.word_count} words · ${item.connections} connections`}
              preview={item.preview}
              tags={item.tags}
              viewMode={viewMode}
              selected={selectedIds.has(item.id)}
              onSelect={toggleSelect}
              searchQuery={query}
              actions={[
                { label: "Open", href: item.item_type === "source" ? `/sources/${item.id}` : item.source_id ? `/sources/${item.source_id}` : "/notes" },
                ...(item.item_type === "note" ? [
                  { label: "Synapse", variant: "secondary" as const, onClick: () => openSynapse([item.id]) },
                  { label: "Delete", variant: "danger" as const, onClick: () => handleDelete(item.id) },
                ] : []),
              ]}
            />
          ))}
        </div>
      )}
    </PageContainer>

    <SynapsePanel
      isOpen={synapseOpen}
      onClose={() => setSynapseOpen(false)}
      noteIds={synapseNoteIds}
      onComplete={() => { clearSelection(); fetchResults(); }}
    />
    </div>
  );
}
