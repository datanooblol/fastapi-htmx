from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, File
from pydantic import BaseModel

from app.config import settings
from app.dependencies import (
    get_source_repo,
    get_note_repo,
    get_tag_repo,
    get_prompt_template_repo,
    get_summary_repo,
    get_ai_provider,
)
from app.models.source import SourceCreate
from app.models.note import NoteCreate, NoteUpdate
from app.services.source_service import save_upload, extract_text, delete_upload
from app.services.summary_service import run_summary

router = APIRouter(prefix="/sources")
USER_ID = settings.DEFAULT_USER_ID


@router.get("")
def list_sources(
    source_repo=Depends(get_source_repo),
    tag_repo=Depends(get_tag_repo),
):
    sources = source_repo.list_all(USER_ID)
    for s in sources:
        s.tags = [t.name for t in tag_repo.get_tags_for_item(s.id, "source")]
    return sources


@router.post("")
def create_source(
    title: str = Form(...),
    source_type: str = Form(...),
    content: str | None = Form(None),
    source_url: str | None = Form(None),
    tags: str | None = Form(None),
    file: UploadFile | None = File(None),
    source_repo=Depends(get_source_repo),
    tag_repo=Depends(get_tag_repo),
):
    file_path = None
    file_name = None
    file_size = None
    raw_content = content

    if source_type == "upload" and file and file.filename:
        file_path, file_name, file_size = save_upload(file)
        raw_content = extract_text(file_path)

    source_data = SourceCreate(
        title=title,
        source_type=source_type,
        raw_content=raw_content,
        source_url=source_url or None,
        file_path=file_path,
        file_name=file_name,
        file_size_bytes=file_size,
    )
    source = source_repo.create(USER_ID, source_data)

    if tags:
        tag_names = [t.strip() for t in tags.split(",") if t.strip()]
        source.tags = [t.name for t in tag_repo.set_tags(USER_ID, source.id, "source", tag_names)]

    return source


@router.get("/{source_id}")
def get_source(
    source_id: str,
    source_repo=Depends(get_source_repo),
    note_repo=Depends(get_note_repo),
    summary_repo=Depends(get_summary_repo),
    prompt_repo=Depends(get_prompt_template_repo),
    tag_repo=Depends(get_tag_repo),
):
    source = source_repo.get_by_id(source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")

    source.tags = [t.name for t in tag_repo.get_tags_for_item(source_id, "source")]
    notes = note_repo.list_by_source(source_id)
    summaries = summary_repo.list_by_source(source_id)
    prompts = prompt_repo.list_all(USER_ID)

    return {
        "source": source,
        "notes": notes,
        "summaries": summaries,
        "prompts": prompts,
    }


@router.delete("/{source_id}")
def delete_source(
    source_id: str,
    source_repo=Depends(get_source_repo),
):
    source = source_repo.get_by_id(source_id)
    if not source:
        raise HTTPException(status_code=404, detail="Source not found")
    delete_upload(source.file_path)
    source_repo.delete(source_id)
    return {"ok": True}


# --- Notes on a source ---

@router.post("/{source_id}/notes")
def create_note(
    source_id: str,
    title: str = Form(...),
    content: str = Form(...),
    note_repo=Depends(get_note_repo),
):
    note = note_repo.create(USER_ID, NoteCreate(title=title, content=content, source_id=source_id))
    return note


@router.put("/{source_id}/notes/{note_id}")
def update_note(
    source_id: str,
    note_id: str,
    title: str = Form(...),
    content: str = Form(...),
    note_repo=Depends(get_note_repo),
):
    note = note_repo.update(note_id, NoteUpdate(title=title, content=content))
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.delete("/{source_id}/notes/{note_id}")
def delete_note(
    source_id: str,
    note_id: str,
    note_repo=Depends(get_note_repo),
):
    note_repo.delete(note_id)
    return {"ok": True}


# --- Summaries ---

@router.post("/{source_id}/summarize")
def summarize_source(
    source_id: str,
    prompt_template_id: str | None = Form(None),
    prompt_text: str | None = Form(None),
    source_repo=Depends(get_source_repo),
    summary_repo=Depends(get_summary_repo),
    prompt_repo=Depends(get_prompt_template_repo),
    ai=Depends(get_ai_provider),
):
    result = run_summary(
        user_id=USER_ID,
        source_id=source_id,
        prompt_template_id=prompt_template_id,
        prompt_text_override=prompt_text,
        ai=ai,
        source_repo=source_repo,
        summary_repo=summary_repo,
        prompt_repo=prompt_repo,
    )

    if isinstance(result, str):
        raise HTTPException(status_code=500, detail=result)

    return result


@router.delete("/{source_id}/summaries/{summary_id}")
def delete_summary(
    source_id: str,
    summary_id: str,
    summary_repo=Depends(get_summary_repo),
):
    summary_repo.delete(summary_id)
    return {"ok": True}
