from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.config import settings
from app.dependencies import (
    get_article_repo, get_section_repo, get_note_repo,
    get_engagement_repo,
)
from app.models.article import ArticleUpdate

router = APIRouter()
USER_ID = settings.DEFAULT_USER_ID


# --- Publish Preview ---

@router.get("/articles/{article_id}/publish")
def publish_preview(
    article_id: str,
    article_repo=Depends(get_article_repo),
    section_repo=Depends(get_section_repo),
):
    article = article_repo.get_by_id(article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    sections = section_repo.list_by_article(article_id)
    written_count = sum(1 for s in sections if s.status == "written")
    total_words = sum(s.word_count for s in sections)

    checklist = [
        {"label": f"All {len(sections)} sections written", "passed": written_count == len(sections) and len(sections) > 0},
        {"label": "Slug set", "passed": bool(article.slug)},
        {"label": "Excerpt written", "passed": bool(article.excerpt)},
        {"label": "Cover image", "passed": bool(article.cover_image_path), "optional": True},
    ]

    return {
        "article": article,
        "sections": [{"title": s.title, "content": s.content or "", "status": s.status, "word_count": s.word_count} for s in sections],
        "total_words": total_words,
        "reading_time": max(1, total_words // 250),
        "checklist": checklist,
    }


class PublishSettings(BaseModel):
    slug: str | None = None
    excerpt: str | None = None
    visibility: str | None = None


@router.put("/articles/{article_id}/publish/settings")
def update_publish_settings(
    article_id: str,
    body: PublishSettings,
    article_repo=Depends(get_article_repo),
):
    updates = body.model_dump(exclude_none=True)
    if updates:
        article = article_repo.update(article_id, ArticleUpdate(**updates))
    else:
        article = article_repo.get_by_id(article_id)
    return article


@router.post("/articles/{article_id}/publish/now")
def publish_now(
    article_id: str,
    article_repo=Depends(get_article_repo),
):
    article = article_repo.get_by_id(article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    if not article.slug:
        slug = article.title.lower().replace(" ", "-")
        slug = "".join(c for c in slug if c.isalnum() or c == "-")
        article_repo.update(article_id, ArticleUpdate(slug=slug))

    article_repo.update(article_id, ArticleUpdate(status="published"))
    article = article_repo.get_by_id(article_id)
    return article


# --- Public Article ---

@router.get("/p/{slug}")
def get_public_article(
    slug: str,
    article_repo=Depends(get_article_repo),
    section_repo=Depends(get_section_repo),
    note_repo=Depends(get_note_repo),
    engagement_repo=Depends(get_engagement_repo),
):
    # Find article by slug
    articles = article_repo.list_all(USER_ID, status="published")
    article = next((a for a in articles if a.slug == slug), None)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    # Record view
    engagement_repo.record(article.id, "view")

    sections = section_repo.list_by_article(article.id)
    total_words = sum(s.word_count for s in sections)

    # Get engagement stats
    stats = engagement_repo.get_stats_for_article(article.id)

    return {
        "article": article,
        "sections": [{"title": s.title, "content": s.content or ""} for s in sections],
        "total_words": total_words,
        "reading_time": max(1, total_words // 250),
        "engagement": {
            "views": stats.get("view", 0),
            "likes": stats.get("like", 0),
            "saves": stats.get("save", 0),
            "shares": stats.get("share", 0),
        },
    }


@router.get("/p/{slug}/export/{format}")
def export_article(
    slug: str,
    format: str,
    article_repo=Depends(get_article_repo),
    section_repo=Depends(get_section_repo),
    engagement_repo=Depends(get_engagement_repo),
):
    articles = article_repo.list_all(USER_ID, status="published")
    article = next((a for a in articles if a.slug == slug), None)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    sections = section_repo.list_by_article(article.id)

    if format == "markdown":
        content = f"# {article.title}\n\n"
        if article.subtitle:
            content += f"*{article.subtitle}*\n\n"
        for s in sections:
            content += f"## {s.title}\n\n{s.content or ''}\n\n"

        engagement_repo.record(article.id, "download", format="md")
        from fastapi.responses import PlainTextResponse
        return PlainTextResponse(content, headers={
            "Content-Disposition": f'attachment; filename="{article.slug}.md"'
        })

    elif format == "html":
        html = f"<h1>{article.title}</h1>\n"
        if article.subtitle:
            html += f"<p><em>{article.subtitle}</em></p>\n"
        for s in sections:
            html += f"<h2>{s.title}</h2>\n<p>{s.content or ''}</p>\n"

        engagement_repo.record(article.id, "download", format="html")
        from fastapi.responses import HTMLResponse
        return HTMLResponse(html, headers={
            "Content-Disposition": f'attachment; filename="{article.slug}.html"'
        })

    elif format == "medium":
        content = f"# {article.title}\n\n"
        if article.subtitle:
            content += f"*{article.subtitle}*\n\n"
        for s in sections:
            content += f"## {s.title}\n\n{s.content or ''}\n\n"
        engagement_repo.record(article.id, "download", platform="medium")
        return {"content": content, "format": "markdown", "platform": "medium"}

    elif format == "devto":
        frontmatter = f"---\ntitle: {article.title}\npublished: false\n"
        if article.excerpt:
            frontmatter += f"description: {article.excerpt}\n"
        frontmatter += "---\n\n"
        body = ""
        for s in sections:
            body += f"## {s.title}\n\n{s.content or ''}\n\n"
        engagement_repo.record(article.id, "download", platform="devto")
        return {"content": frontmatter + body, "format": "markdown+frontmatter", "platform": "devto"}

    elif format == "linkedin":
        text = f"{article.title}\n\n"
        if article.subtitle:
            text += f"{article.subtitle}\n\n"
        for s in sections:
            text += f"{s.title}\n{s.content or ''}\n\n"
        engagement_repo.record(article.id, "download", platform="linkedin")
        return {"content": text, "format": "plaintext", "platform": "linkedin"}

    raise HTTPException(status_code=400, detail=f"Unsupported format: {format}")


class EngageRequest(BaseModel):
    type: str


@router.post("/p/{slug}/engage")
def engage_article(
    slug: str,
    body: EngageRequest,
    article_repo=Depends(get_article_repo),
    engagement_repo=Depends(get_engagement_repo),
):
    articles = article_repo.list_all(USER_ID, status="published")
    article = next((a for a in articles if a.slug == slug), None)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    engagement_repo.record(article.id, body.type)
    stats = engagement_repo.get_stats_for_article(article.id)
    return {
        "views": stats.get("view", 0),
        "likes": stats.get("like", 0),
        "saves": stats.get("save", 0),
        "shares": stats.get("share", 0),
    }
