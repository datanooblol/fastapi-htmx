"use client";

import { Button } from "@/components/atoms/Button/Button";

interface ConnectionSuggestion {
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

interface ConnectionCardProps {
  focusTitle: string;
  suggestion: ConnectionSuggestion;
  status?: "pending" | "accepted" | "rejected";
  onAccept?: () => void;
  onReject?: () => void;
}

const strengthStyles = {
  strong: "bg-sb-success text-white",
  moderate: "bg-sb-primary text-white",
  weak: "bg-sb-warning text-white",
};

const cardBorderStyles = {
  strong: "border-l-3 border-l-sb-success",
  moderate: "border-l-3 border-l-sb-primary",
  weak: "border-l-3 border-l-sb-warning",
};

export function ConnectionCard({ focusTitle, suggestion, status = "pending", onAccept, onReject }: ConnectionCardProps) {
  const isResolved = status !== "pending" || suggestion.already_connected;

  return (
    <div
      className={`
        rounded-lg p-4.5 border border-sb-border transition-all
        ${cardBorderStyles[suggestion.strength]}
        ${isResolved ? "opacity-50" : ""}
      `}
    >
      {/* Strength badge */}
      <div className="flex justify-between items-start mb-2.5">
        <span className={`text-label font-semibold uppercase tracking-wide px-2 py-0.5 rounded ${strengthStyles[suggestion.strength]}`}>
          {suggestion.already_connected ? "Already Connected" : suggestion.strength}
        </span>
      </div>

      {/* Note pair */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-base font-medium px-3 py-1.5 bg-bg-card border border-sb-border rounded-md max-w-[280px] truncate">
          {focusTitle}
        </span>
        <span className="text-sb-primary text-xl">↔</span>
        <span className="text-base font-medium px-3 py-1.5 bg-bg-card border border-sb-border rounded-md max-w-[280px] truncate">
          {suggestion.node_b_title}
        </span>
      </div>

      {/* Reason */}
      <div className="text-sm text-text-secondary leading-normal mb-3 pl-3 border-l-2 border-sb-border">
        {suggestion.reason}
      </div>

      {/* Relationship type tag */}
      <div className="flex gap-1.5 mb-3.5">
        <span className="text-label px-2 py-0.5 bg-tag-bg text-text-secondary rounded-sm">
          {suggestion.relationship_type}
        </span>
      </div>

      {/* Actions */}
      {suggestion.already_connected ? (
        <div className="text-sm text-text-muted text-right">Already connected</div>
      ) : status === "accepted" ? (
        <div className="text-sm text-sb-success text-right font-medium">✓ Connected</div>
      ) : status === "rejected" ? (
        <div className="text-sm text-text-muted text-right">Skipped</div>
      ) : (
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onReject}>Skip</Button>
          <Button variant="success" size="sm" onClick={onAccept}>✓ Connect</Button>
        </div>
      )}
    </div>
  );
}
