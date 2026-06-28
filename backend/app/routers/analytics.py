from fastapi import APIRouter, Depends, Query

from app.config import settings
from app.dependencies import get_article_repo, get_engagement_repo

router = APIRouter(prefix="/analytics")
USER_ID = settings.DEFAULT_USER_ID


@router.get("")
def get_analytics(
    days: int | None = Query(None),
    article_repo=Depends(get_article_repo),
    engagement_repo=Depends(get_engagement_repo),
):
    # Aggregate stats
    stats = engagement_repo.get_aggregate_stats(USER_ID, days)

    # Per-article stats
    articles = article_repo.list_all(USER_ID, status="published")
    article_stats = []
    for a in articles:
        a_stats = engagement_repo.get_stats_for_article(a.id)
        article_stats.append({
            "id": a.id,
            "title": a.title,
            "slug": a.slug,
            "published_at": a.published_at.isoformat() if a.published_at else a.created_at.isoformat(),
            "word_count": a.word_count,
            "views": a_stats.get("view", 0),
            "likes": a_stats.get("like", 0),
            "saves": a_stats.get("save", 0),
            "shares": a_stats.get("share", 0),
            "downloads": a_stats.get("download", 0),
        })

    article_stats.sort(key=lambda x: x["views"], reverse=True)

    # Recent activity
    recent = engagement_repo.get_recent_activity(USER_ID, limit=10)
    activity = []
    for r in recent:
        activity.append({
            "type": r["engagement_type"],
            "format": r.get("format"),
            "platform": r.get("platform"),
            "article_title": r["title"],
            "created_at": r["created_at"].isoformat() if hasattr(r["created_at"], "isoformat") else str(r["created_at"]),
        })

    return {
        "stats": {
            "views": stats.get("view", 0),
            "likes": stats.get("like", 0),
            "saves": stats.get("save", 0),
            "shares": stats.get("share", 0),
            "downloads": stats.get("download", 0),
        },
        "articles": article_stats,
        "recent_activity": activity,
    }
