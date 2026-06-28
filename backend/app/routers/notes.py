from fastapi import APIRouter, Depends, HTTPException, Query

from app.config import settings
from app.dependencies import get_source_repo, get_note_repo, get_summary_repo, get_tag_repo

router = APIRouter(prefix="/notes")
USER_ID = settings.DEFAULT_USER_ID


@router.get("")
def list_notes(
    q: str | None = Query(None),
    type: str | None = Query(None),
    tag: str | None = Query(None),
    sort: str = Query("newest"),
    limit: int = Query(50),
    offset: int = Query(0),
    note_repo=Depends(get_note_repo),
    source_repo=Depends(get_source_repo),
    summary_repo=Depends(get_summary_repo),
    tag_repo=Depends(get_tag_repo),
):
    """
    Search and list notes, sources, and summaries.
    type: 'note' | 'source' | 'summary' | None (all)
    sort: 'newest' | 'oldest' | 'alpha' | 'connections'
    """
    results = []

    if type is None or type == "note":
        notes = note_repo.list_all(USER_ID, limit=200, offset=0)
        for n in notes:
            n.tags = [t.name for t in tag_repo.get_tags_for_item(n.id, "note")]
            results.append({
                "id": n.id,
                "item_type": "note",
                "title": n.title,
                "preview": n.content[:200] if n.content else "",
                "word_count": n.word_count,
                "created_at": n.created_at.isoformat(),
                "updated_at": n.updated_at.isoformat(),
                "tags": n.tags,
                "source_id": n.source_id,
                "source_title": n.source_title,
                "connections": 0,
            })

    if type is None or type == "source":
        sources = source_repo.list_all(USER_ID, limit=200, offset=0)
        for s in sources:
            s.tags = [t.name for t in tag_repo.get_tags_for_item(s.id, "source")]
            results.append({
                "id": s.id,
                "item_type": "source",
                "title": s.title,
                "preview": (s.raw_content or "")[:200],
                "word_count": s.word_count,
                "created_at": s.created_at.isoformat(),
                "updated_at": s.updated_at.isoformat(),
                "tags": s.tags,
                "source_id": None,
                "source_title": s.file_name or s.source_type,
                "connections": 0,
            })

    if type is None or type == "summary":
        all_sources = source_repo.list_all(USER_ID, limit=200, offset=0)
        for src in all_sources:
            summaries = summary_repo.list_by_source(src.id)
            for sm in summaries:
                results.append({
                    "id": sm.id,
                    "item_type": "summary",
                    "title": f"{sm.prompt_name or 'Summary'} — {src.title}",
                    "preview": sm.content[:200],
                    "word_count": len(sm.content.split()) if sm.content else 0,
                    "created_at": sm.created_at.isoformat(),
                    "updated_at": sm.created_at.isoformat(),
                    "tags": [],
                    "source_id": src.id,
                    "source_title": src.title,
                    "connections": 0,
                })

    # Filter by keyword
    if q:
        q_lower = q.lower()
        results = [
            r for r in results
            if q_lower in r["title"].lower() or q_lower in r["preview"].lower()
        ]

    # Filter by tag
    if tag:
        results = [r for r in results if tag in r["tags"]]

    # Sort
    if sort == "newest":
        results.sort(key=lambda r: r["created_at"], reverse=True)
    elif sort == "oldest":
        results.sort(key=lambda r: r["created_at"])
    elif sort == "alpha":
        results.sort(key=lambda r: r["title"].lower())

    total = len(results)
    results = results[offset:offset + limit]

    # Stats
    all_items = note_repo.count(USER_ID)
    all_sources = source_repo.count(USER_ID)

    return {
        "results": results,
        "total": total,
        "stats": {
            "notes": all_items,
            "sources": all_sources,
            "summaries": 0,
            "connections": 0,
        },
    }


@router.delete("/{note_id}")
def delete_note(
    note_id: str,
    note_repo=Depends(get_note_repo),
):
    note_repo.delete(note_id)
    return {"ok": True}
