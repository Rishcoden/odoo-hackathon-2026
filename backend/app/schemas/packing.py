from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class PackingItemCreate(BaseModel):
    item_name: str = Field(..., min_length=1, max_length=100)
    category: Optional[str] = None
    is_packed: bool = False

class PackingItemUpdate(BaseModel):
    item_name: Optional[str] = Field(None, min_length=1, max_length=100)
    category: Optional[str] = None

class PackingItemToggle(BaseModel):
    is_packed: bool

class PackingItemResponse(BaseModel):
    id: str
    trip_id: str
    item_name: str
    category: Optional[str] = None
    is_packed: bool
    created_at: datetime

    class Config:
        from_attributes = True
