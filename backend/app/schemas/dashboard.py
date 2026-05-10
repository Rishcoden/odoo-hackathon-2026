from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TripSummary(BaseModel):
    trip_id: str
    title: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    budget_limit: Optional[float] = None

    class Config:
        from_attributes = True

class DashboardOverview(BaseModel):
    user_name: str
    total_trips: int
    upcoming_trips: int
    total_budget: float
    recent_trip_count: int

class Recommendation(BaseModel):
    city_name: str
    country: str
    estimated_budget: float
