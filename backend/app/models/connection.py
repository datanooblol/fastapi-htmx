from datetime import datetime
from pydantic import BaseModel


class Connection(BaseModel):
    id: str
    user_id: str
    node_a_id: str
    node_a_type: str
    node_b_id: str
    node_b_type: str
    relationship_type: str | None = None
    strength: str = "moderate"
    status: str = "confirmed"
    ai_reason: str | None = None
    created_at: datetime
    updated_at: datetime
