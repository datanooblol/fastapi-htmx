"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/atoms/Button/Button";
import { GraphCanvas } from "@/components/organisms/graph/GraphCanvas";
import { NodeDetail } from "@/components/organisms/graph/NodeDetail";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface GraphData {
  nodes: any[];
  edges: any[];
  stats: { total_nodes: number; total_edges: number; confirmed_edges: number; suggested_edges: number };
}

const nodeTypeConfig = [
  { key: "note", label: "Notes", color: "#4fc3f7" },
  { key: "source", label: "Sources", color: "#66bb6a" },
  { key: "summary", label: "Summaries", color: "#ffa726" },
  { key: "article", label: "Articles", color: "#ab47bc" },
];

export default function KnowledgeGraphPage() {
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [nodeFilters, setNodeFilters] = useState<Record<string, boolean>>({
    note: true, source: true, summary: true, article: true, concept: true,
  });
  const [selectedNode, setSelectedNode] = useState<{ id: string; type: string } | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/graph/data`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(console.error);
  }, []);

  const toggleFilter = (type: string) => {
    setNodeFilters((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleNodeClick = (nodeId: string, nodeType: string) => {
    setSelectedNode({ id: nodeId, type: nodeType });
  };

  const filteredNodes = data?.nodes?.filter((n) => {
    if (!nodeFilters[n.type]) return false;
    if (search && !n.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }) || [];

  const typeCounts = data?.nodes?.reduce((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="flex h-screen">
      {/* Main graph area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-sb-border bg-bg-secondary shrink-0 flex-wrap">
          <h2 className="text-xl font-bold mr-2">Knowledge Graph</h2>
          <div className="w-px h-6 bg-sb-border" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Find a node..."
            className="px-3 py-1.5 bg-bg-input border border-sb-border rounded-md text-text-primary text-sm font-sans w-52 focus:outline-none focus:border-sb-primary"
          />
          <div className="w-px h-6 bg-sb-border" />
          <Link href="/synapse">
            <Button variant="success" size="sm">Synapse: All</Button>
          </Link>
        </div>

        {/* Node filters */}
        <div className="flex items-center gap-1.5 px-5 py-2 border-b border-sb-border bg-bg-secondary shrink-0">
          <span className="text-hint text-text-muted mr-1">Show:</span>
          {nodeTypeConfig.map((t) => (
            <button
              key={t.key}
              onClick={() => toggleFilter(t.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label cursor-pointer transition-all border
                ${nodeFilters[t.key]
                  ? "border-current text-text-primary"
                  : "border-sb-border text-text-muted opacity-50"}`}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
              {t.label}
              <span className="text-label opacity-70">{typeCounts[t.key] || 0}</span>
            </button>
          ))}
        </div>

        {/* Graph canvas */}
        <div className="flex-1 relative min-h-0">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center text-text-muted">
              Loading graph...
            </div>
          ) : data && filteredNodes.length > 0 ? (
            <GraphCanvas
              nodes={filteredNodes}
              edges={data.edges}
              onNodeClick={handleNodeClick}
              nodeFilters={nodeFilters}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-text-muted">
              <div className="text-center">
                <p className="text-lg mb-2">No nodes to display</p>
                <p className="text-sm">Add sources, notes, and run Synapse to build your knowledge graph</p>
              </div>
            </div>
          )}

          {/* Stats overlay */}
          {data && (
            <div className="absolute bottom-4 right-4 flex gap-4 bg-bg-card border border-sb-border rounded-md px-3.5 py-2 text-label text-text-muted">
              <span><strong className="text-text-secondary">{data.stats.total_nodes}</strong> nodes</span>
              <span><strong className="text-text-secondary">{data.stats.confirmed_edges}</strong> edges</span>
              <span><strong className="text-text-secondary">{data.stats.suggested_edges}</strong> suggested</span>
            </div>
          )}
        </div>
      </div>

      {/* Node detail panel */}
      {selectedNode && (
        <NodeDetail
          nodeId={selectedNode.id}
          nodeType={selectedNode.type}
          isOpen={true}
          onClose={() => setSelectedNode(null)}
          onNodeClick={handleNodeClick}
        />
      )}
    </div>
  );
}
