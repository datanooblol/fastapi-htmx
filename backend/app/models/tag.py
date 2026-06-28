from datetime import datetime
from pydantic import BaseModel


class Tag(BaseModel):
    id: str
    user_id: str
    name: str
    created_at: datetime
