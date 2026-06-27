from fastapi import APIRouter, Request

from app.dependencies import templates

router = APIRouter()


@router.get("/")
def dashboard(request: Request):
    stats = {
        "total_notes": 0,
        "total_sources": 0,
        "total_connections": 0,
        "total_articles": 0,
        "total_views": 0,
    }
    return templates.TemplateResponse(
        request,
        "pages/dashboard.html",
        {
            "stats": stats,
            "recent_notes": [],
            "draft_articles": [],
        },
    )
