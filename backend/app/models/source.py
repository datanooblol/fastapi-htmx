from datetime import datetime
from pydantic import BaseModel, Field


class SourceCreate(BaseModel):
    title: str
    source_type: str = Field(pattern="^(write|paste|upload)$")
    raw_content: str | None = None
    source_url: str | None = None
    file_path: str | None = None
    file_name: str | None = None
    file_size_bytes: int | None = None


class SourceUpdate(BaseModel):
    title: str | None = None
    raw_content: str | None = None
    source_url: str | None = None


class Source(BaseModel):
    id: str
    user_id: str
    title: str
    source_type: str
    raw_content: str | None = None
    file_path: str | None = None
    file_name: str | None = None
    file_size_bytes: int | None = None
    source_url: str | None = None
    word_count: int = 0
    created_at: datetime
    updated_at: datetime
    tags: list[str] = Field(default_factory=list)
