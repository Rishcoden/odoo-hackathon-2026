from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
from app.schemas.itinerary import TripStopResponse
from app.schemas.activity import TripActivityResponse
from app.schemas.packing import PackingItemResponse
from app.schemas.budget import BudgetSummaryResponse

class ShareToggleRequest(BaseModel):
    is_public: bool

class ShareLinkResponse(BaseModel):
    trip_id: str
    is_public: bool
    public_share_token: Optional[str]
    share_url: Optional[str]

class PublicTripOverview(BaseModel):
    id: str
    title: str
    destination: str
    start_date: datetime
    end_date: datetime
    description: Optional[str]
    cover_image: Optional[str]

class PublicStopWithActivities(TripStopResponse):
    activities: List[TripActivityResponse] = []

class PublicTripResponse(BaseModel):
    overview: PublicTripOverview
    stops: List[PublicStopWithActivities]
    budget_summary: BudgetSummaryResponse
    packing_progress: Dict[str, int] # e.g. {"packed": 5, "total": 10, "percentage": 50}
