"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/atoms/Button/Button";
import { PageContainer } from "@/components/organisms/layout/PageContainer";
import { StatCard } from "@/components/molecules/StatCard/StatCard";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface Connection {
  id: string;
  node_a_id: string;
  node_a_type: string;
  node_b_id: string;
  node_b_type: string;
  relationship_type: string | null;
  strength: string;
  status: string;
  ai_reason: string | null;
  created_at: string;
}

const strengthStyles = {
  strong: "bg-sb-success text-white",
  moderate: "bg-sb-primary text-white",
  weak: "bg-sb-warning text-white",
};

export default function SynapseDashboardPage() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/synapse/connections`)
      .then((r) => r.json())
      .then((data) => { setConnections(data); setLoading(false); })
      .catch(console.error);
  }, []);

  const strongCount = connections.filter((c) => c.strength === "strong").length;
  const moderateCount = connections.filter((c) => c.strength === "moderate").length;
  const weakCount = connections.filter((c) => c.strength === "weak").length;

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this connection?")) return;
    await fetch(`${API_BASE}/synapse/connections/${id}`, { method: "DELETE" });
    setConnections((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <PageContainer>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold mb-1">Connections</h2>
          <p className="text-text-secondary text-sm">All Synapse-established connections between your notes</p>
        </div>
        <div className="flex gap-2">
          <Link href="/notes"><Button variant="secondary">Run from Notes</Button></Link>
          <Link href="/graph"><Button>View Graph →</Button></Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Connections" value={connections.length} />
        <StatCard label="Strong" value={strongCount} />
        <StatCard label="Moderate" value={moderateCount} />
        <StatCard label="Weak" value={weakCount} />
      </div>

      <div className="text-sm text-text-muted mb-3">
        Tip: To create new connections, select notes on the <Link href="/notes" className="text-sb-primary">Notes page</Link> and click &quot;Connect with Synapse&quot;, or use the Synapse button on the <Link href="/graph" className="text-sb-primary">Knowledge Graph</Link>.
      </div>

      {/* Connection list */}
      {loading ? (
        <div className="text-center py-12 text-text-muted">Loading...</div>
      ) : connections.length === 0 ? (
        <div className="text-center py-12 text-text-muted">
          <p className="text-base mb-2">No connections yet</p>
          <p className="text-sm mb-4">Go to Notes and select notes to connect with Synapse</p>
          <Link href="/notes"><Button>Go to Notes →</Button></Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {connections.map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-3.5 bg-bg-card border border-sb-border rounded-lg group">
              <span className={`text-label font-semibold px-2 py-0.5 rounded ${strengthStyles[c.strength as keyof typeof strengthStyles] || "bg-tag-bg text-text-muted"}`}>
                {c.strength}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium truncate">{c.node_a_id.slice(0, 8)}...</span>
                  <span className="text-sb-primary">↔</span>
                  <span className="font-medium truncate">{c.node_b_id.slice(0, 8)}...</span>
                </div>
                {c.relationship_type && (
                  <div className="text-hint text-text-muted mt-0.5">{c.relationship_type}</div>
                )}
                {c.ai_reason && (
                  <div className="text-hint text-text-muted mt-0.5 line-clamp-1">{c.ai_reason}</div>
                )}
              </div>
              <div className="text-hint text-text-muted">{new Date(c.created_at).toLocaleDateString()}</div>
              <Button variant="danger" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(c.id)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
