"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/Button/Button";
import { ConnectionCard } from "./ConnectionCard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

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

interface SynapsePanelProps {
  isOpen: boolean;
  onClose: () => void;
  noteIds: string[];
  noteTitle?: string;
  onComplete?: () => void;
}

export function SynapsePanel({ isOpen, onClose, noteIds, noteTitle, onComplete }: SynapsePanelProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [statuses, setStatuses] = useState<Record<string, CardStatus>>({});
  const [focusTitle, setFocusTitle] = useState("");
  const [totalScanned, setTotalScanned] = useState(0);
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);

  const pairKey = (s: Suggestion) => `${s.node_a_id}-${s.node_b_id}`;

  const runSynapse = async () => {
    setLoading(true);
    setSuggestions([]);
    setStatuses({});

    try {
      if (noteIds.length === 1) {
        const res = await fetch(`${API_BASE}/synapse/single`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note_id: noteIds[0] }),
        });
        if (!res.ok) throw new Error((await res.json()).detail);
        const data = await res.json();
        setFocusTitle(noteTitle || data.focus_note.title);
        setSuggestions(data.suggestions);
        setTotalScanned(data.total_scanned);
      } else {
        const res = await fetch(`${API_BASE}/synapse/bulk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ note_ids: noteIds }),
        });
        if (!res.ok) throw new Error((await res.json()).detail);
        const data = await res.json();
        setFocusTitle(`${noteIds.length} notes`);
        setSuggestions(data.suggestions);
        setTotalScanned(data.notes_scanned);
      }
      setScanned(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Synapse failed");
    } finally {
      setLoading(false);
    }
  };

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

  const handleReject = (suggestion: Suggestion) => {
    setStatuses((prev) => ({ ...prev, [pairKey(suggestion)]: "rejected" }));
  };

  const acceptAll = async () => {
    for (const s of suggestions) {
      if (!s.already_connected && !statuses[pairKey(s)]) {
        await handleAccept(s);
      }
    }
  };

  const pendingCount = suggestions.filter((s) => !s.already_connected && !statuses[pairKey(s)]).length;
  const acceptedCount = Object.values(statuses).filter((s) => s === "accepted").length;
  const rejectedCount = Object.values(statuses).filter((s) => s === "rejected").length;
  const existingCount = suggestions.filter((s) => s.already_connected).length;

  const handleDone = () => {
    onComplete?.();
    onClose();
    setSuggestions([]);
    setStatuses({});
    setScanned(false);
  };

  if (!isOpen) return null;

  return (
    <div className="w-96 border-l border-sb-border bg-bg-secondary flex flex-col shrink-0 h-full">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3.5 border-b border-sb-border shrink-0">
        <h3 className="text-md font-semibold">Synapse</h3>
        <button onClick={handleDone} className="text-text-muted hover:text-text-primary cursor-pointer bg-transparent border-none text-lg">✕</button>
      </div>

      {/* Context */}
      <div className="px-4 py-2.5 border-b border-sb-border text-sm bg-bg-input shrink-0">
        <div className="text-text-muted">
          {noteIds.length === 1 ? "Connecting:" : "Bulk scan:"}{" "}
          <strong className="text-text-secondary">{noteTitle || `${noteIds.length} notes`}</strong>
        </div>
        {scanned && (
          <div className="text-hint text-text-muted mt-1">
            Scanned {totalScanned} notes · Found {suggestions.length} connections
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {/* Not yet scanned */}
        {!scanned && !loading && (
          <div className="text-center py-8">
            <p className="text-sm text-text-secondary mb-4">
              {noteIds.length === 1
                ? "Synapse will analyze this note against all other notes and find conceptual connections."
                : `Synapse will analyze ${noteIds.length} notes and find connections between them.`}
            </p>
            <Button onClick={runSynapse}>Run Synapse →</Button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-8 text-text-muted">
            <div className="inline-block w-6 h-6 border-2 border-sb-border border-t-sb-primary rounded-full animate-spin mb-3" />
            <p className="text-sm">Analyzing connections...</p>
          </div>
        )}

        {/* Results */}
        {scanned && !loading && (
          <>
            {suggestions.length === 0 ? (
              <div className="text-center py-8 text-text-muted text-sm">
                No connections found. Notes may not have enough overlap yet.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {suggestions.map((s) => (
                  <ConnectionCard
                    key={pairKey(s)}
                    focusTitle={focusTitle}
                    suggestion={s}
                    status={s.already_connected ? "accepted" : statuses[pairKey(s)] || "pending"}
                    onAccept={() => handleAccept(s)}
                    onReject={() => handleReject(s)}
                  />
                ))}
              </div>
            )}

            {/* Summary when all reviewed */}
            {pendingCount === 0 && suggestions.length > 0 && (
              <div className="mt-4 p-4 bg-bg-card border border-sb-border rounded-lg text-center">
                <div className="text-sm font-semibold mb-2">Review Complete</div>
                <div className="flex justify-center gap-6 text-sm mb-3">
                  <div><span className="font-bold text-sb-success">{acceptedCount}</span> <span className="text-text-muted">accepted</span></div>
                  <div><span className="font-bold text-text-muted">{rejectedCount}</span> <span className="text-text-muted">skipped</span></div>
                  <div><span className="font-bold text-sb-primary">{existingCount}</span> <span className="text-text-muted">existing</span></div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {scanned && !loading && suggestions.length > 0 && (
        <div className="px-4 py-3 border-t border-sb-border shrink-0 flex gap-2 justify-end">
          {pendingCount > 0 && (
            <>
              <Button variant="ghost" size="sm" onClick={() => suggestions.forEach((s) => { if (!s.already_connected && !statuses[pairKey(s)]) handleReject(s); })}>
                Skip All
              </Button>
              <Button variant="secondary" size="sm" onClick={acceptAll}>Accept All</Button>
            </>
          )}
          <Button variant="success" size="sm" onClick={handleDone}>Done</Button>
        </div>
      )}
    </div>
  );
}
