"use client";

import { useState } from "react";
import { Source, Summary } from "@/lib/types";
import { Button } from "@/components/atoms/Button/Button";

interface SourceReaderProps {
  source: Source;
  summaries: Summary[];
  onDeleteSummary?: (summaryId: string) => void;
}

export function SourceReader({ source, summaries, onDeleteSummary }: SourceReaderProps) {
  const [activeTab, setActiveTab] = useState<"original" | "summaries">("original");
  const [activeSummaryId, setActiveSummaryId] = useState(summaries[0]?.id || "");

  const activeSummary = summaries.find((s) => s.id === activeSummaryId);

  return (
    <div className="bg-bg-card border border-sb-border rounded-lg flex flex-col overflow-hidden min-h-0">
      {/* Header */}
      <div className="flex justify-between items-center px-4.5 py-3.5 border-b border-sb-border shrink-0">
        <h3 className="text-md font-semibold">Source</h3>
        <div className="flex gap-0">
          <button
            onClick={() => setActiveTab("original")}
            className={`px-3.5 py-1.5 text-xs border cursor-pointer transition-all first:rounded-l last:rounded-r not-first:border-l-0
              ${activeTab === "original" ? "bg-sb-primary border-sb-primary text-white" : "bg-transparent border-sb-border text-text-muted"}`}
          >
            Original
          </button>
          <button
            onClick={() => setActiveTab("summaries")}
            className={`px-3.5 py-1.5 text-xs border cursor-pointer transition-all first:rounded-l last:rounded-r not-first:border-l-0
              ${activeTab === "summaries" ? "bg-sb-primary border-sb-primary text-white" : "bg-transparent border-sb-border text-text-muted"}`}
          >
            Summaries ({summaries.length})
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4.5 min-h-0">
        {activeTab === "original" && (
          <div className="text-base leading-relaxed text-text-secondary whitespace-pre-wrap break-words">
            {source.raw_content || "(No content)"}
          </div>
        )}

        {activeTab === "summaries" && (
          <>
            {summaries.length > 0 ? (
              <>
                <div className="flex items-center gap-2.5 mb-4">
                  <select
                    value={activeSummaryId}
                    onChange={(e) => setActiveSummaryId(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 bg-bg-input border border-sb-border rounded-md text-text-primary text-sm font-sans focus:outline-none focus:border-sb-primary"
                  >
                    {summaries.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.prompt_name || "Summary"} — {new Date(s.created_at).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>

                {activeSummary && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-label px-2 py-0.5 bg-tag-bg text-sb-primary rounded-sm">
                        {activeSummary.prompt_name || "Summary"}
                      </span>
                      {onDeleteSummary && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            if (confirm("Delete this summary?")) onDeleteSummary(activeSummary.id);
                          }}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                    <div className="text-base leading-relaxed text-text-secondary whitespace-pre-wrap">
                      {activeSummary.content}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-text-muted text-sm">
                No summaries yet. Go to Step 2 to generate one.
              </div>
            )}
          </>
        )}
      </div>

      {/* Meta bar */}
      <div className="flex gap-4 px-4.5 py-2.5 border-t border-sb-border text-hint text-text-muted shrink-0">
        <span>{source.source_type}</span>
        <span>{source.word_count} words</span>
        <span>{summaries.length} summaries</span>
      </div>
    </div>
  );
}
