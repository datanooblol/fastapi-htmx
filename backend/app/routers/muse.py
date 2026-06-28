from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.config import settings
from app.dependencies import (
    get_article_repo, get_section_repo,
    get_note_repo, get_source_repo, get_ai_provider,
)
from app.services.muse_service import run_muse

router = APIRouter(prefix="/articles/{article_id}/muse")
USER_ID = settings.DEFAULT_USER_ID


class ChatMessage(BaseModel):
    role: str
    content: str


class MuseRequest(BaseModel):
    action: str = "chat"
    section_id: str | None = None
    message: str | None = None
    history: list[ChatMessage] = []


@router.post("")
def muse_action(
    article_id: str,
    body: MuseRequest,
    article_repo=Depends(get_article_repo),
    section_repo=Depends(get_section_repo),
    note_repo=Depends(get_note_repo),
    source_repo=Depends(get_source_repo),
    ai=Depends(get_ai_provider),
):
    article = article_repo.get_by_id(article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    response = run_muse(
        action=body.action,
        article_id=article_id,
        section_id=body.section_id,
        user_message=body.message,
        conversation_history=body.history,
        ai=ai,
        article_repo=article_repo,
        section_repo=section_repo,
        note_repo=note_repo,
        source_repo=source_repo,
    )

    if response.startswith("[AI Error:") or response.startswith("[Error:"):
        raise HTTPException(status_code=500, detail=response)

    return {
        "action": body.action,
        "section_id": body.section_id,
        "response": response,
    }
