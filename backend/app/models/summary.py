from datetime import datetime
from pydantic import BaseModel


class SummaryCreate(BaseModel):
    source_id: str
    prompt_template_id: str | None = None
    prompt_text_used: str
    content: str


class Summary(BaseModel):
    id: str
    user_id: str
    source_id: str
    prompt_template_id: str | None = None
    prompt_text_used: str | None = None
    content: str
    created_at: datetime
    prompt_name: str | None = None
