from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from app.config import settings
from app.dependencies import (
    get_article_repo, get_section_repo, get_note_repo,
    get_source_repo, get_summary_repo,
)
from app.models.article import (
    ArticleCreate, ArticleUpdate,
    ArticleSectionCreate, ArticleSectionUpdate,
)

router = APIRouter(prefix="/articles")
USER_ID = settings.DEFAULT_USER_ID


# --- Articles CRUD ---

@router.get("")
def list_articles(
    status: str | None = Query(None),
    article_repo=Depends(get_article_repo),
):
    articles = article_repo.list_all(USER_ID, status=status)
    section_repo = get_section_repo()

    results = []
    for a in articles:
        sections = section_repo.list_by_article(a.id)
        total_words = sum(s.word_count for s in sections)
        results.append({
            **a.model_dump(),
            "sections": [{"id": s.id, "title": s.title, "status": s.status, "word_count": s.word_count} for s in sections],
            "section_count": len(sections),
            "total_word_count": total_words,
        })

    status_counts = article_repo.count_by_status(USER_ID)
    return {
        "articles": results,
        "counts": {
            "total": sum(status_counts.values()),
            "outline": status_counts.get("outline", 0),
            "draft": status_counts.get("draft", 0),
            "review": status_counts.get("review", 0),
            "published": status_counts.get("published", 0),
        },
    }


class CreateArticleRequest(BaseModel):
    title: str
    subtitle: str | None = None


@router.post("")
def create_article(
    body: CreateArticleRequest,
    article_repo=Depends(get_article_repo),
):
    article = article_repo.create(USER_ID, ArticleCreate(title=body.title, subtitle=body.subtitle))
    return article


@router.get("/{article_id}")
def get_article(
    article_id: str,
    article_repo=Depends(get_article_repo),
    section_repo=Depends(get_section_repo),
    note_repo=Depends(get_note_repo),
    source_repo=Depends(get_source_repo),
    summary_repo=Depends(get_summary_repo),
):
    article = article_repo.get_by_id(article_id)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    sections = section_repo.list_by_article(article_id)
    sections_data = []
    for s in sections:
        refs = section_repo.list_refs_by_section(s.id)
        ref_details = []
        for r in refs:
            name = r.ref_id
            if r.ref_type == "note":
                note = note_repo.get_by_id(r.ref_id)
                if note:
                    name = note.title
            elif r.ref_type == "source":
                source = source_repo.get_by_id(r.ref_id)
                if source:
                    name = source.title
            elif r.ref_type == "summary":
                sm = summary_repo.get_by_id(r.ref_id)
                if sm:
                    name = sm.prompt_name or "Summary"
            ref_details.append({**r.model_dump(), "name": name})
        sections_data.append({**s.model_dump(), "refs": ref_details})

    # Available references for the ref picker
    notes = note_repo.list_all(USER_ID, limit=200)
    sources = source_repo.list_all(USER_ID, limit=200)

    return {
        "article": article,
        "sections": sections_data,
        "available_refs": {
            "notes": [{"id": n.id, "title": n.title, "type": "note"} for n in notes],
            "sources": [{"id": s.id, "title": s.title, "type": "source"} for s in sources],
        },
    }


@router.put("/{article_id}")
def update_article(
    article_id: str,
    body: ArticleUpdate,
    article_repo=Depends(get_article_repo),
):
    article = article_repo.update(article_id, body)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article


@router.delete("/{article_id}")
def delete_article(
    article_id: str,
    article_repo=Depends(get_article_repo),
):
    article_repo.delete(article_id)
    return {"ok": True}


# --- Sections ---

class CreateSectionRequest(BaseModel):
    title: str
    brief: str | None = None


@router.post("/{article_id}/sections")
def create_section(
    article_id: str,
    body: CreateSectionRequest,
    section_repo=Depends(get_section_repo),
):
    existing = section_repo.list_by_article(article_id)
    position = len(existing)
    section = section_repo.create(USER_ID, article_id, ArticleSectionCreate(
        title=body.title, brief=body.brief, position=position,
    ))
    return section


@router.put("/{article_id}/sections/{section_id}")
def update_section(
    article_id: str,
    section_id: str,
    body: ArticleSectionUpdate,
    section_repo=Depends(get_section_repo),
):
    section = section_repo.update(section_id, body)
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    return section


@router.delete("/{article_id}/sections/{section_id}")
def delete_section(
    article_id: str,
    section_id: str,
    section_repo=Depends(get_section_repo),
):
    section_repo.delete(section_id)
    return {"ok": True}


# --- Section Refs ---

class AddRefRequest(BaseModel):
    ref_id: str
    ref_type: str


@router.post("/{article_id}/sections/{section_id}/refs")
def add_section_ref(
    article_id: str,
    section_id: str,
    body: AddRefRequest,
    section_repo=Depends(get_section_repo),
):
    ref = section_repo.add_ref(section_id, body.ref_id, body.ref_type)
    return ref


@router.delete("/{article_id}/sections/{section_id}/refs/{ref_link_id}")
def remove_section_ref(
    article_id: str,
    section_id: str,
    ref_link_id: str,
    section_repo=Depends(get_section_repo),
):
    section_repo.remove_ref(ref_link_id)
    return {"ok": True}
