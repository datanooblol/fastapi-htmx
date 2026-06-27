from fastapi import APIRouter, Depends, Form, Request
from fastapi.responses import HTMLResponse, PlainTextResponse

from app.config import settings
from app.dependencies import get_prompt_template_repo
from app.models.prompt_template import PromptTemplateCreate

router = APIRouter(prefix="/prompts")
USER_ID = settings.DEFAULT_USER_ID


@router.post("", response_class=HTMLResponse)
def create_prompt(
    name: str = Form(...),
    prompt_text: str = Form(...),
    prompt_repo=Depends(get_prompt_template_repo),
):
    existing = prompt_repo.list_all(USER_ID)
    if any(p.name.lower() == name.strip().lower() for p in existing):
        return HTMLResponse(
            f'<div id="prompt-error" style="color:var(--danger);font-size:0.8rem;padding:8px 0;">A prompt named "{name}" already exists.</div>',
            status_code=409,
        )

    template = prompt_repo.create(
        USER_ID,
        PromptTemplateCreate(name=name.strip(), prompt_text=prompt_text),
    )
    return HTMLResponse(
        f'<option value="{template.id}" data-default="false">{template.name}</option>'
    )


@router.get("/preview/{template_id}", response_class=PlainTextResponse)
def get_prompt_text(
    template_id: str,
    prompt_repo=Depends(get_prompt_template_repo),
):
    template = prompt_repo.get_by_id(template_id)
    if not template:
        return PlainTextResponse("")
    return PlainTextResponse(template.prompt_text)


@router.get("/is-default/{template_id}", response_class=PlainTextResponse)
def check_is_default(
    template_id: str,
    prompt_repo=Depends(get_prompt_template_repo),
):
    template = prompt_repo.get_by_id(template_id)
    if not template:
        return PlainTextResponse("true")
    return PlainTextResponse("true" if template.is_default else "false")


@router.delete("/{template_id}", response_class=HTMLResponse)
def delete_prompt(
    template_id: str,
    prompt_repo=Depends(get_prompt_template_repo),
):
    deleted = prompt_repo.delete(template_id)
    if not deleted:
        return HTMLResponse("", status_code=403)
    return HTMLResponse("")
