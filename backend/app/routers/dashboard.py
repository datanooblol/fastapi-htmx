from fastapi import APIRouter, Depends

from app.config import settings
from app.dependencies import (
    get_note_repo, get_source_repo, get_connection_repo,
    get_article_repo, get_section_repo, get_engagement_repo,
)

router = APIRouter()
USER_ID = settings.DEFAULT_USER_ID


@router.get("/dashboard")
def dashboard(
    note_repo=Depends(get_note_repo),
    source_repo=Depends(get_source_repo),
    conn_repo=Depends(get_connection_repo),
    article_repo=Depends(get_article_repo),
    section_repo=Depends(get_section_repo),
    engagement_repo=Depends(get_engagement_repo),
):
    stats = {
        "total_notes": note_repo.count(USER_ID),
        "total_sources": source_repo.count(USER_ID),
        "total_connections": conn_repo.count(USER_ID),
        "total_articles": article_repo.count(USER_ID),
    }

    recent_notes = note_repo.recent(USER_ID, limit=5)
    recent_notes_data = [
        {
            "id": n.id,
            "title": n.title,
            "source_id": n.source_id,
            "word_count": n.word_count,
            "created_at": n.created_at.isoformat(),
        }
        for n in recent_notes
    ]

    articles = article_repo.list_all(USER_ID)
    draft_articles = []
    for a in articles:
        if a.status == "published":
            continue
        sections = section_repo.list_by_article(a.id)
        written = sum(1 for s in sections if s.status == "written")
        draft_articles.append({
            "id": a.id,
            "title": a.title,
            "status": a.status,
            "section_count": len(sections),
            "written_count": written,
            "updated_at": a.updated_at.isoformat(),
        })

    return {
        "stats": stats,
        "recent_notes": recent_notes_data,
        "draft_articles": draft_articles[:5],
    }
