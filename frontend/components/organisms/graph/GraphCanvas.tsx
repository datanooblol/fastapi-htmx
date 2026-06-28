"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface GraphNode {
  id: string;
  type: string;
  title: string;
  connections: number;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphEdge {
  source: string | GraphNode;
  target: string | GraphNode;
  type: string;
  strength: string;
  status: string;
  reason?: string;
}

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick?: (nodeId: string, nodeType: string) => void;
  nodeFilters: Record<string, boolean>;
}

const nodeColors: Record<string, string> = {
  note: "#4fc3f7",
  source: "#66bb6a",
  summary: "#ffa726",
  article: "#ab47bc",
  concept: "#ec407a",
};

const nodeShapes: Record<string, string> = {
  note: "circle",
  source: "square",
  summary: "diamond",
  article: "rect",
  concept: "hexagon",
};

export function GraphCanvas({ nodes, edges, onNodeClick, nodeFilters }: GraphCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Filter nodes
    const visibleNodes = nodes.filter((n) => nodeFilters[n.type] !== false);
    const visibleIds = new Set(visibleNodes.map((n) => n.id));
    const visibleEdges = edges.filter(
      (e) => visibleIds.has(typeof e.source === "string" ? e.source : e.source.id) &&
             visibleIds.has(typeof e.target === "string" ? e.target : e.target.id)
    );

    // Create simulation
    const simulation = d3.forceSimulation(visibleNodes as d3.SimulationNodeDatum[])
      .force("link", d3.forceLink(visibleEdges as d3.SimulationLinkDatum<d3.SimulationNodeDatum>[])
        .id((d: any) => d.id)
        .distance((d: any) => {
          const str = d.strength;
          return str === "strong" ? 60 : str === "moderate" ? 100 : 140;
        }))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    // Zoom
    const g = svg.append("g");
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on("zoom", (event) => g.attr("transform", event.transform));
    svg.call(zoom);

    // Edges
    const link = g.append("g")
      .selectAll("line")
      .data(visibleEdges)
      .join("line")
      .attr("stroke", (d: any) => d.status === "confirmed" || d.status === "implicit" ? "#4fc3f7" : "#3a3a5a")
      .attr("stroke-width", (d: any) => d.status === "implicit" ? 1 : 1.5)
      .attr("stroke-dasharray", (d: any) => d.status === "suggested" ? "4,4" : "none")
      .attr("opacity", 0.4);

    // Nodes
    const node = g.append("g")
      .selectAll("g")
      .data(visibleNodes)
      .join("g")
      .attr("cursor", "pointer")
      .call(d3.drag<SVGGElement, GraphNode>()
        .on("start", (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }));

    // Draw node shapes
    node.each(function (d) {
      const el = d3.select(this);
      const color = nodeColors[d.type] || "#888";
      const size = Math.max(6, Math.min(16, 6 + d.connections * 2));

      if (d.type === "source") {
        el.append("rect")
          .attr("width", size * 2).attr("height", size * 2)
          .attr("x", -size).attr("y", -size)
          .attr("rx", 3)
          .attr("fill", color).attr("opacity", 0.85);
      } else if (d.type === "summary") {
        el.append("polygon")
          .attr("points", `0,${-size} ${size},0 0,${size} ${-size},0`)
          .attr("fill", color).attr("opacity", 0.8);
      } else if (d.type === "article") {
        el.append("rect")
          .attr("width", size * 2.5).attr("height", size * 1.5)
          .attr("x", -size * 1.25).attr("y", -size * 0.75)
          .attr("rx", 5)
          .attr("fill", color).attr("opacity", 0.85);
      } else {
        el.append("circle")
          .attr("r", size)
          .attr("fill", color).attr("opacity", 0.85);
      }

      // Label
      el.append("text")
        .text(d.title.length > 12 ? d.title.slice(0, 12) + "…" : d.title)
        .attr("text-anchor", "middle")
        .attr("dy", size + 14)
        .attr("font-size", "9px")
        .attr("fill", "#a0a0b0");
    });

    // Click handler
    node.on("click", (event, d) => {
      event.stopPropagation();
      onNodeClick?.(d.id, d.type);
    });

    // Hover effects
    node.on("mouseenter", function (event, d) {
      // Highlight connected edges
      link.attr("opacity", (l: any) => {
        const sourceId = typeof l.source === "string" ? l.source : l.source.id;
        const targetId = typeof l.target === "string" ? l.target : l.target.id;
        return sourceId === d.id || targetId === d.id ? 0.8 : 0.1;
      });
      // Dim unconnected nodes
      node.attr("opacity", (n) => {
        if (n.id === d.id) return 1;
        const connected = visibleEdges.some((e: any) => {
          const s = typeof e.source === "string" ? e.source : e.source.id;
          const t = typeof e.target === "string" ? e.target : e.target.id;
          return (s === d.id && t === n.id) || (t === d.id && s === n.id);
        });
        return connected ? 1 : 0.2;
      });
    });

    node.on("mouseleave", function () {
      link.attr("opacity", 0.4);
      node.attr("opacity", 1);
    });

    // Tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => { simulation.stop(); };
  }, [nodes, edges, nodeFilters, onNodeClick]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ background: "var(--bg-primary)" }}
    />
  );
}
