from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.config import settings
from app.dependencies import get_prompt_template_repo
from app.models.prompt_template import PromptTemplateCreate

router = APIRouter(prefix="/prompts")
USER_ID = settings.DEFAULT_USER_ID


class PromptCreateRequest(BaseModel):
    name: str
    prompt_text: str


@router.get("")
def list_prompts(prompt_repo=Depends(get_prompt_template_repo)):
    return prompt_repo.list_all(USER_ID)


@router.post("")
def create_prompt(
    body: PromptCreateRequest,
    prompt_repo=Depends(get_prompt_template_repo),
):
    existing = prompt_repo.list_all(USER_ID)
    if any(p.name.lower() == body.name.strip().lower() for p in existing):
        raise HTTPException(status_code=409, detail=f'A prompt named "{body.name}" already exists.')

    template = prompt_repo.create(
        USER_ID,
        PromptTemplateCreate(name=body.name.strip(), prompt_text=body.prompt_text),
    )
    return template


@router.get("/{template_id}")
def get_prompt(
    template_id: str,
    prompt_repo=Depends(get_prompt_template_repo),
):
    template = prompt_repo.get_by_id(template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return template


@router.delete("/{template_id}")
def delete_prompt(
    template_id: str,
    prompt_repo=Depends(get_prompt_template_repo),
):
    deleted = prompt_repo.delete(template_id)
    if not deleted:
        raise HTTPException(status_code=403, detail="Cannot delete default prompts")
    return {"ok": True}
