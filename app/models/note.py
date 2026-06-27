from datetime import datetime
from pydantic import BaseModel, Field


class NoteCreate(BaseModel):
    title: str
    content: str
    source_id: str | None = None


class NoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None


class Note(BaseModel):
    id: str
    user_id: str
    source_id: str | None = None
    title: str
    content: str
    word_count: int = 0
    created_at: datetime
    updated_at: datetime
    tags: list[str] = Field(default_factory=list)
    source_title: str | None = None
