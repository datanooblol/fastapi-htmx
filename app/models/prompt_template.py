from datetime import datetime
from pydantic import BaseModel


class PromptTemplateCreate(BaseModel):
    name: str
    prompt_text: str
    is_default: bool = False


class PromptTemplate(BaseModel):
    id: str
    user_id: str
    name: str
    prompt_text: str
    is_default: bool
    created_at: datetime
    updated_at: datetime
