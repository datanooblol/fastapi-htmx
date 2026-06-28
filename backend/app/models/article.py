from datetime import datetime
from pydantic import BaseModel


class ArticleCreate(BaseModel):
    title: str
    subtitle: str | None = None


class ArticleUpdate(BaseModel):
    title: str | None = None
    subtitle: str | None = None
    slug: str | None = None
    status: str | None = None
    visibility: str | None = None
    excerpt: str | None = None


class Article(BaseModel):
    id: str
    user_id: str
    title: str
    subtitle: str | None = None
    slug: str | None = None
    status: str = "outline"
    visibility: str = "public"
    excerpt: str | None = None
    cover_image_path: str | None = None
    published_at: datetime | None = None
    word_count: int = 0
    created_at: datetime
    updated_at: datetime


class ArticleSectionCreate(BaseModel):
    title: str
    brief: str | None = None
    position: int = 0


class ArticleSectionUpdate(BaseModel):
    title: str | None = None
    brief: str | None = None
    content: str | None = None
    status: str | None = None
    position: int | None = None


class ArticleSection(BaseModel):
    id: str
    user_id: str
    article_id: str
    position: int
    title: str
    brief: str | None = None
    content: str | None = None
    status: str = "outline"
    word_count: int = 0
    created_at: datetime
    updated_at: datetime


class ArticleSectionRef(BaseModel):
    id: str
    section_id: str
    ref_id: str
    ref_type: str
    position: int = 0
    created_at: datetime
