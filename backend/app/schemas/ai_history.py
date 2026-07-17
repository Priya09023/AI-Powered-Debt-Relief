from datetime import datetime
from pydantic import BaseModel


class AIHistoryCreate(BaseModel):
    type: str  # letter | prediction | recommendation
    title: str
    content: str
    metadata: dict = {}


class AIHistoryResponse(BaseModel):
    id: str
    user_id: str
    type: str
    title: str
    content: str
    metadata: dict = {}
    created_at: datetime | None = None

    class Config:
        from_attributes = True
