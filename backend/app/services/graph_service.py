from app.repositories.duckdb.source_repo import DuckDBSourceRepository
from app.repositories.duckdb.note_repo import DuckDBNoteRepository
from app.repositories.duckdb.summary_repo import DuckDBSummaryRepository
from app.repositories.duckdb.article_repo import DuckDBArticleRepository
from app.repositories.duckdb.connection_repo import DuckDBConnectionRepository
from app.repositories.duckdb.tag_repo import DuckDBTagRepository


def get_graph_data(
    user_id: str,
    source_repo: DuckDBSourceRepository,
    note_repo: DuckDBNoteRepository,
    summary_repo: DuckDBSummaryRepository,
    article_repo: DuckDBArticleRepository,
    conn_repo: DuckDBConnectionRepository,
    tag_repo: DuckDBTagRepository,
) -> dict:
    """Assemble all nodes and edges for the knowledge graph."""

    nodes = []
    edges = []

    # Sources
    sources = source_repo.list_all(user_id, limit=500)
    for s in sources:
        tags = [t.name for t in tag_repo.get_tags_for_item(s.id, "source")]
        nodes.append({
            "id": s.id,
            "type": "source",
            "title": s.title,
            "word_count": s.word_count,
            "tags": tags,
            "created_at": s.created_at.isoformat(),
        })

    # Notes
    notes = note_repo.list_all(user_id, limit=500)
    for n in notes:
        tags = [t.name for t in tag_repo.get_tags_for_item(n.id, "note")]
        nodes.append({
            "id": n.id,
            "type": "note",
            "title": n.title,
            "word_count": n.word_count,
            "tags": tags,
            "source_id": n.source_id,
            "created_at": n.created_at.isoformat(),
        })
        # Implicit edge: note → source
        if n.source_id:
            edges.append({
                "source": n.source_id,
                "target": n.id,
                "type": "belongs_to",
                "strength": "strong",
                "status": "implicit",
            })

    # Summaries
    for src in sources:
        summaries = summary_repo.list_by_source(src.id)
        for sm in summaries:
            nodes.append({
                "id": sm.id,
                "type": "summary",
                "title": sm.prompt_name or "Summary",
                "word_count": len(sm.content.split()) if sm.content else 0,
                "tags": [],
                "source_id": src.id,
                "created_at": sm.created_at.isoformat(),
            })
            edges.append({
                "source": src.id,
                "target": sm.id,
                "type": "has_summary",
                "strength": "strong",
                "status": "implicit",
            })

    # Articles
    articles = article_repo.list_all(user_id)
    for a in articles:
        nodes.append({
            "id": a.id,
            "type": "article",
            "title": a.title,
            "word_count": a.word_count,
            "tags": [],
            "status": a.status,
            "created_at": a.created_at.isoformat(),
        })

    # Synapse connections
    connections = conn_repo.list_all(user_id)
    for c in connections:
        edges.append({
            "id": c.id,
            "source": c.node_a_id,
            "target": c.node_b_id,
            "type": c.relationship_type or "related",
            "strength": c.strength,
            "status": c.status,
            "reason": c.ai_reason,
        })

    # Count connections per node
    connection_counts: dict[str, int] = {}
    for e in edges:
        connection_counts[e["source"]] = connection_counts.get(e["source"], 0) + 1
        connection_counts[e["target"]] = connection_counts.get(e["target"], 0) + 1

    for node in nodes:
        node["connections"] = connection_counts.get(node["id"], 0)

    return {
        "nodes": nodes,
        "edges": edges,
        "stats": {
            "total_nodes": len(nodes),
            "total_edges": len(edges),
            "confirmed_edges": sum(1 for e in edges if e.get("status") in ("confirmed", "implicit")),
            "suggested_edges": sum(1 for e in edges if e.get("status") == "suggested"),
        },
    }
