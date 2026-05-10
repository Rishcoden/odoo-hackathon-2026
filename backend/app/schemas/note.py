from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

class NoteCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: Optional[str] = None
    trip_stop_id: Optional[str] = None
    note_date: Optional[date] = None

class NoteUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    content: Optional[str] = None
    trip_stop_id: Optional[str] = None
    note_date: Optional[date] = None

class NoteResponse(BaseModel):
    id: str
    trip_id: str
    trip_stop_id: Optional[str]
    title: str
    content: Optional[str]
    note_date: Optional[date]
    created_at: datetime

    class Config:
        from_attributes = True
