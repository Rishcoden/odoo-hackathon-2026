from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ActivityCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    category: Optional[str] = None
    estimated_cost: float = Field(0.0, ge=0)
    duration_hours: float = Field(1.0, gt=0)

class ActivityResponse(ActivityCreate):
    id: str
    city_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class TripActivityCreate(BaseModel):
    activity_id: str
    scheduled_time: Optional[datetime] = None
    notes: Optional[str] = None

class TripActivityUpdate(BaseModel):
    scheduled_time: Optional[datetime] = None
    notes: Optional[str] = None

class TripActivityResponse(BaseModel):
    id: str
    trip_stop_id: str
    activity_id: str
    scheduled_time: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    
    # Nested activity details for the frontend
    activity: Optional[ActivityResponse] = None

    class Config:
        from_attributes = True
