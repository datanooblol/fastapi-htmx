"use client";
import { PageContainer } from "@/components/organisms/layout/PageContainer";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/atoms/Button/Button";
import { ConnectionCard } from "@/components/organisms/synapse/ConnectionCard";
import { ContentCard } from "@/components/organisms/shared/ContentCard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface NoteItem {
  id: string;
  title: string;
  word_count: number;
  created_at: string;
  tags: string[];
}

interface Suggestion {
  node_a_id: string;
  node_a_type: string;
  node_b_id: string;
  node_b_type: string;
  node_b_title: string;
  strength: "strong" | "moderate" | "weak";
  relationship_type: string;
  reason: string;
  already_connected: boolean;
}

type CardStatus = "pending" | "accepted" | "rejected";

export default function SynapsePage() {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState("");
  const [selectedBulkIds, setSelectedBulkIds] = useState<Set<string>>(new Set());
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [statuses, setStatuses] = useState<Record<string, CardStatus>>({});
  const [focusTitle, setFocusTitle] = useState("");
  const [totalScanned, setTotalScanned] = useState(0);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);

  // Fetch notes for selection
  useEffect(() => {
    fetch(`${API_BASE}/notes?type=note`)
      .then((r) => r.json())
      .then((data) => setNotes(data.results || []))
      .catch(console.error);
  }, []);

  const runSingle = async () => {
    if (!selectedNoteId) return;
    setLoading(true);
    setSuggestions([]);
    setStatuses({});

    try {
      const res = await fetch(`${API_BASE}/synapse/single`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note_id: selectedNoteId }),
      });
      if (!res.ok) throw new Error((await res.json()).detail);
      const data = await res.json();
      setFocusTitle(data.focus_note.title);
      setSuggestions(data.suggestions);
      setTotalScanned(data.total_scanned);
      setScanned(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Synapse failed");
    } finally {
      setLoading(false);
    }
  };

  const runBulk = async () => {
    if (selectedBulkIds.size === 0) return;
    setLoading(true);
    setSuggestions([]);
    setStatuses({});

    try {
      const res = await fetch(`${API_BASE}/synapse/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note_ids: Array.from(selectedBulkIds) }),
      });
      if (!res.ok) throw new Error((await res.json()).detail);
      const data = await res.json();
      setFocusTitle("Bulk scan");
      setSuggestions(data.suggestions);
      setTotalScanned(data.notes_scanned);
      setScanned(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Synapse failed");
    } finally {
      setLoading(false);
    }
  };

  const pairKey = (s: Suggestion) => `${s.node_a_id}-${s.node_b_id}`;

  const handleAccept = async (suggestion: Suggestion) => {
    try {
      await fetch(`${API_BASE}/synapse/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          node_a_id: suggestion.node_a_id,
          node_a_type: suggestion.node_a_type,
          node_b_id: suggestion.node_b_id,
          node_b_type: suggestion.node_b_type,
          strength: suggestion.strength,
          relationship_type: suggestion.relationship_type,
          ai_reason: suggestion.reason,
        }),
      });
      setStatuses((prev) => ({ ...prev, [pairKey(suggestion)]: "accepted" }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (suggestion: Suggestion) => {
    setStatuses((prev) => ({ ...prev, [pairKey(suggestion)]: "rejected" }));
  };

  const acceptAll = async () => {
    for (const s of suggestions) {
      if (!s.already_connected && statuses[pairKey(s)] !== "accepted" && statuses[pairKey(s)] !== "rejected") {
        await handleAccept(s);
      }
    }
  };

  const pendingCount = suggestions.filter((s) => !s.already_connected && !statuses[pairKey(s)]).length;
  const acceptedCount = Object.values(statuses).filter((s) => s === "accepted").length;
  const rejectedCount = Object.values(statuses).filter((s) => s === "rejected").length;
  const existingCount = suggestions.filter((s) => s.already_connected).length;

  const toggleBulk = (id: string) => {
    setSelectedBulkIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <PageContainer>
      <div className="text-sm text-text-muted mb-1">
        <a href="/">Dashboard</a> / <a href="/graph">Knowledge Graph</a> / Synapse
      </div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-1">Synapse — Connection Review</h2>
        <p className="text-text-secondary text-md">Review AI-suggested connections between your notes</p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-0 mb-6">
        <button
          onClick={() => { setMode("single"); setScanned(false); setSuggestions([]); }}
          className={`px-6 py-2.5 text-base border cursor-pointer transition-all first:rounded-l-md last:rounded-r-md
            ${mode === "single" ? "bg-sb-primary border-sb-primary text-white font-medium" : "bg-bg-card border-sb-border text-text-secondary"}`}
        >
          Single Note
        </button>
        <button
          onClick={() => { setMode("bulk"); setScanned(false); setSuggestions([]); }}
          className={`px-6 py-2.5 text-base border border-l-0 cursor-pointer transition-all first:rounded-l-md last:rounded-r-md
            ${mode === "bulk" ? "bg-sb-primary border-sb-primary text-white font-medium" : "bg-bg-card border-sb-border text-text-secondary"}`}
        >
          All Notes
        </button>
      </div>

      {/* Single mode: select a note */}
      {mode === "single" && !scanned && (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-2">Select a note to connect:</label>
            <select
              value={selectedNoteId}
              onChange={(e) => setSelectedNoteId(e.target.value)}
              className="w-full px-3 py-2.5 bg-bg-card border border-sb-border rounded-md text-text-primary text-base font-sans focus:outline-none focus:border-sb-primary"
            >
              <option value="">Choose a note...</option>
              {notes.map((n) => (
                <option key={n.id} value={n.id}>{n.title}</option>
              ))}
            </select>
          </div>
          <Button onClick={runSingle} loading={loading} disabled={!selectedNoteId}>
            Run Synapse →
          </Button>
        </div>
      )}

      {/* Bulk mode: select notes */}
      {mode === "bulk" && !scanned && (
        <div>
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-text-secondary">
                Select notes to scan ({selectedBulkIds.size} selected):
              </label>
              <button
                onClick={() => {
                  if (selectedBulkIds.size === notes.length) {
                    setSelectedBulkIds(new Set());
                  } else {
                    setSelectedBulkIds(new Set(notes.map((n) => n.id)));
                  }
                }}
                className="text-sm text-sb-primary cursor-pointer bg-transparent border border-sb-border rounded px-3 py-1 transition-all hover:bg-bg-card"
              >
                {selectedBulkIds.size === notes.length ? "Deselect All" : "Select All"}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {notes.map((n) => (
                <ContentCard
                  key={n.id}
                  id={n.id}
                  title={n.title}
                  typeBadge={{ label: "note", variant: "note" }}
                  meta={`${n.word_count} words · ${new Date(n.created_at).toLocaleDateString()}`}
                  tags={n.tags}
                  viewMode="card"
                  selected={selectedBulkIds.has(n.id)}
                  onSelect={toggleBulk}
                />
              ))}
            </div>
          </div>
          <Button onClick={runBulk} loading={loading} disabled={selectedBulkIds.size === 0}>
            Run Synapse on {selectedBulkIds.size} notes →
          </Button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-12 text-text-muted">
          <div className="inline-block w-6 h-6 border-2 border-sb-border border-t-sb-primary rounded-full animate-spin mb-3" />
          <p>Synapse is analyzing your notes...</p>
        </div>
      )}

      {/* Results */}
      {scanned && !loading && (
        <>
          {/* Context bar */}
          <div className="flex items-center gap-4 px-5 py-3.5 bg-bg-card border border-sb-border rounded-lg mb-6">
            <span className="text-xl">✎</span>
            <div className="flex-1">
              <div className="text-hint uppercase tracking-wide text-text-muted">
                {mode === "single" ? "Connecting note" : "Bulk scan complete"}
              </div>
              <div className="font-medium mt-0.5">{focusTitle}</div>
            </div>
            <div className="text-center px-4 border-l border-sb-border">
              <div className="text-xl font-bold text-sb-primary">{totalScanned}</div>
              <div className="text-label text-text-muted uppercase">Scanned</div>
            </div>
            <div className="text-center px-4 border-l border-sb-border">
              <div className="text-xl font-bold text-sb-primary">{suggestions.length}</div>
              <div className="text-label text-text-muted uppercase">Found</div>
            </div>
          </div>

          {/* Connection cards */}
          {suggestions.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              No connections found. Your notes may not have enough conceptual overlap yet.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {suggestions.map((s) => (
                <ConnectionCard
                  key={pairKey(s)}
                  focusTitle={mode === "single" ? focusTitle : notes.find((n) => n.id === s.node_a_id)?.title || s.node_a_id}
                  suggestion={s}
                  status={s.already_connected ? "accepted" : statuses[pairKey(s)] || "pending"}
                  onAccept={() => handleAccept(s)}
                  onReject={() => handleReject(s)}
                />
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            {pendingCount > 0 && (
              <>
                <Button variant="ghost" onClick={() => suggestions.forEach((s) => { if (!s.already_connected && !statuses[pairKey(s)]) handleReject(s); })}>
                  Skip All
                </Button>
                <Button variant="secondary" onClick={acceptAll}>Accept All</Button>
              </>
            )}
            <Link href="/graph">
              <Button variant="success">Done — View Graph →</Button>
            </Link>
          </div>

          {/* Result summary */}
          {pendingCount === 0 && suggestions.length > 0 && (
            <div className="bg-bg-card border border-sb-border rounded-lg p-6 mt-6 text-center">
              <h3 className="text-lg font-semibold mb-2">Synapse Complete</h3>
              <div className="flex justify-center gap-8 mb-4">
                <div>
                  <div className="text-2xl font-bold text-sb-success">{acceptedCount}</div>
                  <div className="text-hint text-text-muted uppercase">Accepted</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-text-muted">{rejectedCount}</div>
                  <div className="text-hint text-text-muted uppercase">Skipped</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-sb-primary">{existingCount}</div>
                  <div className="text-hint text-text-muted uppercase">Already Connected</div>
                </div>
              </div>
              <div className="flex justify-center gap-3">
                <Link href="/notes"><Button variant="secondary">Back to Notes</Button></Link>
                <Link href="/graph"><Button variant="success">View Graph →</Button></Link>
              </div>
            </div>
          )}
        </>
      )}
    </PageContainer>
  );
}
