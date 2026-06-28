from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.config import settings
from app.dependencies import (
    get_source_repo, get_note_repo, get_summary_repo,
    get_article_repo, get_connection_repo, get_tag_repo,
    get_ai_provider,
)
from app.services.graph_service import get_graph_data

router = APIRouter(prefix="/graph")
USER_ID = settings.DEFAULT_USER_ID


@router.get("/data")
def graph_data(
    source_repo=Depends(get_source_repo),
    note_repo=Depends(get_note_repo),
    summary_repo=Depends(get_summary_repo),
    article_repo=Depends(get_article_repo),
    conn_repo=Depends(get_connection_repo),
    tag_repo=Depends(get_tag_repo),
):
    return get_graph_data(
        USER_ID, source_repo, note_repo, summary_repo,
        article_repo, conn_repo, tag_repo,
    )


@router.get("/node/{node_type}/{node_id}")
def get_node_detail(
    node_type: str,
    node_id: str,
    source_repo=Depends(get_source_repo),
    note_repo=Depends(get_note_repo),
    summary_repo=Depends(get_summary_repo),
    article_repo=Depends(get_article_repo),
    conn_repo=Depends(get_connection_repo),
    tag_repo=Depends(get_tag_repo),
    note_repo2=Depends(get_note_repo),
):
    detail = None
    if node_type == "source":
        item = source_repo.get_by_id(node_id)
        if item:
            tags = [t.name for t in tag_repo.get_tags_for_item(node_id, "source")]
            detail = {"type": "source", "title": item.title, "word_count": item.word_count,
                       "source_type": item.source_type, "tags": tags, "created_at": item.created_at.isoformat()}
    elif node_type == "note":
        item = note_repo.get_by_id(node_id)
        if item:
            tags = [t.name for t in tag_repo.get_tags_for_item(node_id, "note")]
            detail = {"type": "note", "title": item.title, "content": item.content[:500],
                       "word_count": item.word_count, "tags": tags, "source_title": item.source_title,
                       "created_at": item.created_at.isoformat()}
    elif node_type == "summary":
        item = summary_repo.get_by_id(node_id)
        if item:
            detail = {"type": "summary", "title": item.prompt_name or "Summary",
                       "content": item.content[:500], "created_at": item.created_at.isoformat()}
    elif node_type == "article":
        item = article_repo.get_by_id(node_id)
        if item:
            detail = {"type": "article", "title": item.title, "subtitle": item.subtitle,
                       "status": item.status, "word_count": item.word_count,
                       "created_at": item.created_at.isoformat()}

    if not detail:
        raise HTTPException(status_code=404, detail="Node not found")

    # Get connections for this node
    conns = conn_repo.list_for_node(node_id, node_type)
    connected = []
    for c in conns:
        other_id = c.node_b_id if c.node_a_id == node_id else c.node_a_id
        other_type = c.node_b_type if c.node_a_id == node_id else c.node_a_type
        # Resolve name
        name = other_id
        if other_type == "note":
            n = note_repo.get_by_id(other_id)
            if n: name = n.title
        elif other_type == "source":
            s = source_repo.get_by_id(other_id)
            if s: name = s.title
        elif other_type == "article":
            a = article_repo.get_by_id(other_id)
            if a: name = a.title

        connected.append({
            "id": other_id,
            "type": other_type,
            "name": name,
            "relationship": c.relationship_type,
            "strength": c.strength,
        })

    detail["connections"] = connected
    return detail
